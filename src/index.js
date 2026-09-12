/**
 * ostar-dsh-left-sidebar —— Host 半区。
 *
 * 会话「迁移 / 复制到其他工作区」：
 * 官方模型里工作区归属 = 会话创建时的 cwd 目录，`insertSessionBefore` 只能
 * 在同工作区内排序，`fork` 的副本继承父 cwd —— 官方没有跨工作区移动/复制
 * 会话的 API。因此本半区提供一条同源 HTTP 路由，按官方 fork 的实现路径
 * （`agents.create({ sessionId, seed, meta })`，完整复制对话/轨迹事件日志）
 * 在目标工作区路径下创建一个携带全部已完成会话数据的新会话：
 *
 *   - 复制（copy）：目标工作区生成完整副本，原会话保持不变；
 *   - 迁移（move）：复制完成后归档原会话（从分组面隐藏，日志保留）。
 *
 * 与官方 fork 一致：仅复制到最后一个完成的 turn（进行中的 turn 无法复制）；
 * 副本继承源会话的 agentPreset，标题来自日志内的 title 事件。
 *
 * 工作区分组 / 收藏（dev 分支新增）：
 * `GET/POST /ostar-dsh-left-sidebar/groups` 读写分组数据
 * （收藏列表 + 自定义分组列表），持久化到
 * `~/.dsh/ostar-dsh-left-sidebar/groups.json`，跨刷新/重启保留。
 * 数据仅用于侧边栏展示层过滤，不改动官方工作区/会话账目。
 *
 * 彻底删除（本地数据清理）：
 * 官方「删除会话」= 归档（`archivedSessionIds`，日志保留），「删除工作区」=
 * 注册移除 —— 会话日志目录 `~/.dsh/sessions/<cwd编码>/<sessionId>/` 与投影
 * 缓存 `~/.dsh/storages/session_projcache/sessions/<sessionId>.json` 都会留在
 * 磁盘上，DSH 重建索引 / 重装后会依据这些残留重新登记工作区与会话（“复活”）。
 * `POST /ostar-dsh-left-sidebar/purge` 在官方删除之后清理这些残留：
 *   1. 删除会话日志目录（不可恢复）；
 *   2. 删除投影缓存分片；
 *   3. 从 `~/.dsh/storages/workspace.json` 摘除已删工作区与悬挂的会话引用。
 */

import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdir, readFile, rename, readdir, rm, stat, writeFile } from 'node:fs/promises'

export const name = 'ostar-dsh-left-sidebar'

/** webServer 为硬依赖:Cordis 等待其就绪后再 apply,确保路由注册。 */
export const inject = ['webServer']

const ROUTE = '/ostar-dsh-left-sidebar/migrate'
const PURGE_ROUTE = '/ostar-dsh-left-sidebar/purge'
const ORPHANS_ROUTE = '/ostar-dsh-left-sidebar/orphans'
/** 只接受安全的会话/工作区 id,避免任何路径穿越。 */
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/
/** 孤立会话预览的返回上限（避免超大响应）。 */
const ORPHAN_PREVIEW_LIMIT = 200

function json(res, status, body) {
  try {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(body))
  } catch {
    /* 连接已关闭时忽略 */
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', () => resolve(''))
  })
}

/** 删除会话日志目录：`~/.dsh/sessions/<cwd编码>/<sessionId>/`。 */
async function removeSessionLogs(sessionIds) {
  const root = join(homedir(), '.dsh', 'sessions')
  const removed = []
  const missing = []
  let encodings
  try {
    encodings = await readdir(root, { withFileTypes: true })
  } catch {
    return { removed, missing: sessionIds.slice() }
  }
  for (const sid of sessionIds) {
    let hit = false
    for (const entry of encodings) {
      if (!entry.isDirectory()) continue
      const dir = join(root, entry.name, sid)
      try {
        const info = await stat(dir)
        if (!info.isDirectory()) continue
        await rm(dir, { recursive: true, force: true })
        hit = true
        break
      } catch {
        /* 该编码目录下不存在或无权限 → 继续匹配下一个 */
      }
    }
    if (hit) removed.push(sid)
    else missing.push(sid)
  }
  return { removed, missing }
}

/** 删除投影缓存分片：`~/.dsh/storages/session_projcache/sessions/<sessionId>.json`。 */
async function removeProjcacheShards(sessionIds) {
  const dir = join(homedir(), '.dsh', 'storages', 'session_projcache', 'sessions')
  let count = 0
  for (const sid of sessionIds) {
    try {
      await rm(join(dir, sid + '.json'), { force: true })
      count++
    } catch {
      /* 忽略 */
    }
  }
  return count
}

/** 从 workspace.json 摘除已删工作区，并清理悬挂的会话引用（原子写回）。 */
async function pruneWorkspaceRegistry(sessionIds, workspaceIds) {
  const file = join(homedir(), '.dsh', 'storages', 'workspace.json')
  let data
  try {
    data = JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return false
  }
  const sidSet = new Set(sessionIds)
  const widSet = new Set(workspaceIds)
  const workspaces = data && data.tables && data.tables.workspaces ? data.tables.workspaces : null
  if (workspaces !== null) {
    for (const wid of Object.keys(workspaces)) {
      if (widSet.has(wid)) {
        delete workspaces[wid]
        continue
      }
      const rec = workspaces[wid]
      if (rec === null || typeof rec !== 'object') continue
      if (Array.isArray(rec.sessionIds)) rec.sessionIds = rec.sessionIds.filter((x) => !sidSet.has(x))
      if (Array.isArray(rec.archivedSessionIds)) rec.archivedSessionIds = rec.archivedSessionIds.filter((x) => !sidSet.has(x))
    }
  }
  const global = data && data.global ? data.global : null
  if (global !== null) {
    if (Array.isArray(global.workspaceIds)) global.workspaceIds = global.workspaceIds.filter((x) => !widSet.has(x))
    if (Array.isArray(global.archivedSessionIds)) global.archivedSessionIds = global.archivedSessionIds.filter((x) => !sidSet.has(x))
  }
  const tmp = file + '.purge-tmp'
  await writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await rename(tmp, file)
  return true
}

/** 读取官方账目中的全部会话 id（在工作区中的 + 已归档的）。 */
async function readAccountedSessions() {
  const accounted = new Set()
  const file = join(homedir(), '.dsh', 'storages', 'workspace.json')
  try {
    const data = JSON.parse(await readFile(file, 'utf8'))
    const global = data && data.global ? data.global : {}
    if (Array.isArray(global.archivedSessionIds)) for (const x of global.archivedSessionIds) accounted.add(x)
    const workspaces = data && data.tables && data.tables.workspaces ? data.tables.workspaces : {}
    for (const wid of Object.keys(workspaces)) {
      const rec = workspaces[wid]
      if (rec === null || typeof rec !== 'object') continue
      if (Array.isArray(rec.sessionIds)) for (const x of rec.sessionIds) accounted.add(x)
      if (Array.isArray(rec.archivedSessionIds)) for (const x of rec.archivedSessionIds) accounted.add(x)
    }
  } catch {
    /* 账目不可读 → 返回空集合（调用方据此保守处理） */
  }
  return accounted
}

/** 目录名（cwd 编码）→ 可读路径，仅用于展示。 */
function decodeCwdDirectory(name) {
  const inner = name.replace(/^--/, '').replace(/--$/, '')
  // 编码形如 `~9662~611F~8BCA~` —— 相邻转义共用波浪号，必须先逐段解码再清掉分隔符。
  return inner
    .replace(/~([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/~/g, '')
    .replace(/-/g, '/')
}

/**
 * 扫描 `~/.dsh/sessions/`，找出既不在工作区账目、也不在归档列表中的会话日志
 * —— 这些是删除工作区/会话后残留、会在 DSH 重建索引或重装后「复活」的数据。
 */
async function scanOrphanSessions() {
  const root = join(homedir(), '.dsh', 'sessions')
  const accounted = await readAccountedSessions()
  const orphans = []
  let scanned = 0
  let encodings
  try {
    encodings = await readdir(root, { withFileTypes: true })
  } catch {
    return { orphans, scanned, accounted: accounted.size }
  }
  for (const entry of encodings) {
    if (!entry.isDirectory()) continue
    const dir = join(root, entry.name)
    let children
    try {
      children = await readdir(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const child of children) {
      if (!child.isDirectory() || !SAFE_ID.test(child.name)) continue
      scanned++
      if (accounted.has(child.name)) continue
      let bytes = 0
      let updatedAt = 0
      try {
        const sessionDir = join(dir, child.name)
        const files = await readdir(sessionDir)
        for (const f of files) {
          try {
            const info = await stat(join(sessionDir, f))
            if (info.isFile()) bytes += info.size
            if (info.mtimeMs > updatedAt) updatedAt = info.mtimeMs
          } catch {
            /* 忽略单个文件 */
          }
        }
      } catch {
        /* 忽略 */
      }
      orphans.push({ sessionId: child.name, cwd: decodeCwdDirectory(entry.name), bytes, updatedAt })
    }
  }
  orphans.sort((a, b) => b.updatedAt - a.updatedAt)
  return { orphans, scanned, accounted: accounted.size }
}

export function apply(ctx) {
  const webServer = ctx.get('webServer')
  if (webServer === undefined) {
    console.error('ostar-dsh-left-sidebar: webServer unavailable')
    return
  }
  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: ROUTE,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'method-not-allowed' })
        return
      }
      let args = {}
      try {
        args = JSON.parse((await readBody(req)) || '{}')
      } catch {
        json(res, 400, { ok: false, error: 'bad-json' })
        return
      }
      const sourceId = args !== null && typeof args === 'object' && typeof args.sourceId === 'string' ? args.sourceId : ''
      const targetWorkspaceId = args !== null && typeof args === 'object' && typeof args.targetWorkspaceId === 'string' ? args.targetWorkspaceId : ''
      const mode = args !== null && typeof args === 'object' && (args.mode === 'move' || args.mode === 'copy') ? args.mode : ''
      if (sourceId === '' || targetWorkspaceId === '' || mode === '') {
        json(res, 400, { ok: false, error: 'bad-args' })
        return
      }
      try {
        const registry = ctx.get('workspaceRegistry')
        const query = ctx.get('sessionQuery')
        const agents = ctx.get('agents')
        if (registry === undefined || query === undefined || agents === undefined) {
          json(res, 503, { ok: false, error: 'services unavailable' })
          return
        }
        const target = registry.get(targetWorkspaceId)
        if (target === undefined) {
          json(res, 404, { ok: false, error: 'target workspace not found' })
          return
        }
        const read = await query.readSession(sourceId)
        const events = read.events
        // 与官方 fork 相同：只复制到最后一个完成的 turn。
        let cut = 0
        for (let i = events.length - 1; i >= 0; i--) {
          if (events[i].type === 'turn/end') {
            cut = events[i].seq + 1
            break
          }
        }
        while (cut < events.length && events[cut] !== undefined && events[cut].type !== 'turn/start') cut++
        const childId = 'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
        await agents.create({
          sessionId: childId,
          seed: events.slice(0, cut),
          meta: {
            cwd: target.path,
            parentSession: sourceId,
            seedLength: cut,
            ...(read.session !== null && typeof read.session === 'object' && read.session.agentPreset !== undefined ? { agentPreset: read.session.agentPreset } : {}),
          },
          agentOptions: {},
        })
        // 与官方 fork 相同:创建后把副本 attach 到目标工作区账目,
        // 触发 domain/changed → host 推送 workspace-changed → client 侧边栏即时显示。
        await target.attachSession(childId)
        if (mode === 'move') await registry.archiveSession(sourceId)
        json(res, 200, { ok: true, childId })
      } catch (reason) {
        json(res, 500, { ok: false, error: String(reason && reason.message ? reason.message : reason) })
      }
    },
  }), 'ostar-dsh-left-sidebar: migrate route')

  // ---- 工作区分组 / 收藏 持久化（GET / POST）----
  const GROUPS_DIR = join(homedir(), '.dsh', 'ostar-dsh-left-sidebar')
  const GROUPS_FILE = join(GROUPS_DIR, 'groups.json')

  async function readGroups() {
    try {
      const raw = await readFile(GROUPS_FILE, 'utf8')
      const data = JSON.parse(raw)
      if (data && Array.isArray(data.favorites) && Array.isArray(data.groups)) {
        return {
          favorites: data.favorites.filter((x) => typeof x === 'string'),
          groups: data.groups,
        }
      }
    } catch {
      /* 文件不存在或损坏 → 返回默认值 */
    }
    return { favorites: [], groups: [] }
  }

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: '/ostar-dsh-left-sidebar/groups',
    handler: async (req, res) => {
      if (req.method === 'GET') {
        const data = await readGroups()
        json(res, 200, { ok: true, favorites: data.favorites, groups: data.groups })
        return
      }
      if (req.method === 'POST') {
        let args = {}
        try {
          args = JSON.parse((await readBody(req)) || '{}')
        } catch {
          json(res, 400, { ok: false, error: 'bad-json' })
          return
        }
        if (args === null || typeof args !== 'object' || !Array.isArray(args.favorites) || !Array.isArray(args.groups)) {
          json(res, 400, { ok: false, error: 'bad-args' })
          return
        }
        const favorites = args.favorites.filter((x) => typeof x === 'string')
        const groups = args.groups
          .filter((g) => g !== null && typeof g === 'object' && typeof g.id === 'string' && typeof g.name === 'string' && Array.isArray(g.workspaceIds))
          .map((g) => ({ id: g.id, name: g.name, workspaceIds: g.workspaceIds.filter((x) => typeof x === 'string') }))
        try {
          await mkdir(GROUPS_DIR, { recursive: true })
          await writeFile(GROUPS_FILE, JSON.stringify({ favorites, groups }, null, 2), 'utf8')
          json(res, 200, { ok: true })
        } catch (reason) {
          json(res, 500, { ok: false, error: String(reason && reason.message ? reason.message : reason) })
        }
        return
      }
      json(res, 405, { ok: false, error: 'method-not-allowed' })
    },
  }), 'ostar-dsh-left-sidebar: groups route')

  // ---- 彻底删除：清理官方删除后残留的本地会话数据 ----
  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: PURGE_ROUTE,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'method-not-allowed' })
        return
      }
      let args = {}
      try {
        args = JSON.parse((await readBody(req)) || '{}')
      } catch {
        json(res, 400, { ok: false, error: 'bad-json' })
        return
      }
      const rawSessions = args !== null && typeof args === 'object' && Array.isArray(args.sessionIds) ? args.sessionIds : []
      const rawWorkspaces = args !== null && typeof args === 'object' && Array.isArray(args.workspaceIds) ? args.workspaceIds : []
      const sessionIds = rawSessions.filter((x) => typeof x === 'string' && SAFE_ID.test(x))
      const workspaceIds = rawWorkspaces.filter((x) => typeof x === 'string' && SAFE_ID.test(x))
      if (sessionIds.length === 0 && workspaceIds.length === 0) {
        json(res, 400, { ok: false, error: 'bad-args' })
        return
      }
      try {
        const logs = await removeSessionLogs(sessionIds)
        const shards = await removeProjcacheShards(sessionIds)
        let registryPruned = false
        try {
          registryPruned = await pruneWorkspaceRegistry(sessionIds, workspaceIds)
        } catch {
          registryPruned = false
        }
        json(res, 200, {
          ok: true,
          sessionsRemoved: logs.removed.length,
          sessionsMissing: logs.missing.length,
          projcacheShardsRemoved: shards,
          workspacesPruned: workspaceIds.length,
          registryPruned,
        })
      } catch (reason) {
        json(res, 500, { ok: false, error: String(reason && reason.message ? reason.message : reason) })
      }
    },
  }), 'ostar-dsh-left-sidebar: purge route')

  // ---- 孤立数据：预览(GET) / 清理(POST) ----
  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: ORPHANS_ROUTE,
    handler: async (req, res) => {
      try {
        if (req.method === 'GET') {
          const result = await scanOrphanSessions()
          const items = result.orphans.slice(0, ORPHAN_PREVIEW_LIMIT)
          const bytes = result.orphans.reduce((sum, item) => sum + item.bytes, 0)
          json(res, 200, {
            ok: true,
            total: result.orphans.length,
            bytes: bytes,
            scanned: result.scanned,
            accounted: result.accounted,
            items: items,
          })
          return
        }
        if (req.method === 'POST') {
          let args = {}
          try {
            args = JSON.parse((await readBody(req)) || '{}')
          } catch {
            json(res, 400, { ok: false, error: 'bad-json' })
            return
          }
          const raw = args !== null && typeof args === 'object' && Array.isArray(args.sessionIds) ? args.sessionIds : []
          const wanted = new Set(raw.filter((x) => typeof x === 'string' && SAFE_ID.test(x)))
          if (wanted.size === 0) {
            json(res, 400, { ok: false, error: 'bad-args' })
            return
          }
          // 二次保险:只删除确实不在官方账目中的会话。
          const accounted = await readAccountedSessions()
          const targets = Array.from(wanted).filter((id) => !accounted.has(id))
          const logs = await removeSessionLogs(targets)
          const shards = await removeProjcacheShards(targets)
          json(res, 200, {
            ok: true,
            requested: wanted.size,
            removed: logs.removed.length,
            skippedAccounted: wanted.size - targets.length,
            missing: logs.missing.length,
            projcacheShardsRemoved: shards,
          })
          return
        }
        json(res, 405, { ok: false, error: 'method-not-allowed' })
      } catch (reason) {
        json(res, 500, { ok: false, error: String(reason && reason.message ? reason.message : reason) })
      }
    },
  }), 'ostar-dsh-left-sidebar: orphans route')
}
