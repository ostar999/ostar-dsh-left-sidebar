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
 */

export const name = 'ostar-dsh-left-sidebar'

/** webServer 为硬依赖:Cordis 等待其就绪后再 apply,确保路由注册。 */
export const inject = ['webServer']

const ROUTE = '/ostar-dsh-left-sidebar/migrate'

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
}
