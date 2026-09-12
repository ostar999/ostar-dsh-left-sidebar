# ostar-dsh-left-sidebar

> **DSH 左侧边栏工作区管理器** —— 在官方工作区浏览器上叠加一整套管理能力:批量删除、单选删除、迁移 / 复制会话、拖拽排序、**工作区分组与收藏**。

<!-- Hero -->
<div align="center">
  <b style="font-size: 1.15em;">不牺牲官方体验的工作区管理</b><br />
  官方工作区浏览器的<b>全部功能、样式与交互逐项复刻保留</b>,管理能力以<b>同尺寸按钮</b>叠加在其上<br /><br />
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
  <img alt="version" src="https://img.shields.io/badge/version-0.4.1-4d6bfe" />
  <img alt="纯 JS 无构建" src="https://img.shields.io/badge/build-none%20%28plain%20JS%29-2fbf71" /><br /><br />
  <img alt="批量删除工作区" src="https://img.shields.io/badge/-批量删除工作区-4d6bfe" />
  <img alt="批量·单选删除会话" src="https://img.shields.io/badge/-批量·单选删除会话-4d6bfe" />
  <img alt="迁移·复制会话" src="https://img.shields.io/badge/-迁移·复制会话-4d6bfe" />
  <img alt="拖拽排序" src="https://img.shields.io/badge/-拖拽排序-4d6bfe" />
  <img alt="分组·收藏" src="https://img.shields.io/badge/-分组·收藏-4d6bfe" />
  <img alt="一键折叠·展开全部" src="https://img.shields.io/badge/-一键折叠·展开全部-4d6bfe" />
  <img alt="官方功能完整保留" src="https://img.shields.io/badge/-官方功能完整保留-2fbf71" />
</div>

<div align="center">
  🌏 <a href="./README.md"><b>中文</b></a>
</div>

---

## 📑 目录

- [📖 项目简介](#-项目简介)
- [✨ 功能一览](#-功能一览)
- [🖼️ 官方复刻清单](#️-官方复刻清单)
- [🚀 安装](#-安装)
- [🔄 更新](#-更新)
- [🗑️ 卸载](#️-卸载)
- [🖱️ 交互速查](#️-交互速查)
- [🏗️ 工作原理](#️-工作原理)
- [📁 目录结构](#-目录结构)
- [🛠️ 开发与调试](#️-开发与调试)
- [🌿 分支与发布](#-分支与发布)
- [❓ 常见问题](#-常见问题)
- [⚠️ 已知限制](#️-已知限制)
- [📄 许可证](#-许可证)

## 📖 项目简介

`ostar-dsh-left-sidebar` 是一个 **DSH(DeepSeek Harness)Web 客户端外部插件**,作用于左侧边栏的「工作区 / 会话」浏览区域。

官方浏览器只提供最基础的操作(新建会话、重命名、删除单个工作区/会话),缺少日常高频需要的管理能力:清理一堆不再用的工作区、删掉误建的会话、把会话搬到别的工作区、在几十个工作区里快速定位常用的几个。本插件补齐这些能力,并且**不改变任何官方既有交互**:

- **批量删除工作区**(可连同其会话一起删除)、**批量删除会话**、**单选删除会话**
- **彻底删除本地数据** —— 官方「删除」只是归档,本项目会把会话日志与缓存一并清掉,重装后不会“复活”
- **清理孤立数据** —— 一键扫描并清理历史遗留、已不在任何工作区中的会话日志
- **迁移会话 / 复制会话** 到其他工作区(对话与轨迹数据完整)
- **工作区分组与收藏** —— 自定义分组、星标收藏、按组筛选、记住上次所选分组
- **拖拽排序** —— 工作区行与会话行的手动排序(与官方一致,仅手动排序模式持久化)
- **定位到当前会话** —— 搜索按钮左侧一键跳回当前会话所在行,自动展开折叠的工作区 / 切回「全部」分组并高亮
- **一键折叠 / 展开全部** 工作区与会话组

> **技术背景**:侧边栏「工作区」浏览区域在 DSH 中是一个**单插槽**(`sidebar.workspaces`),由官方 `ui-workspace` 浏览器整体渲染。本插件以外部插件的**负优先级**(`priority: -100`)注册方式接管该区域,在其中**逐项复刻官方浏览器的行为与样式**,再叠加管理功能 —— 因此视觉与交互和官方一致,同时获得官方没有的能力。所有官方服务的调用路径(`ctx.workspaces` / `ctx.sessions`)与官方浏览器完全相同,不绕过、不改写官方数据模型。

## ✨ 功能一览

| 能力 | 说明 |
| --- | --- |
| 🗑️ **批量删除工作区** | 批量选中模式:每个工作区行复选框 + 「全选」+「删除选中」;可选「连同会话删除」(默认开启) |
| 💬 **批量删除会话** | 每个会话行复选框,支持多选后一次性删除 |
| 🎯 **单选删除会话** | 会话行 hover 出现「删除」按钮;会话 `···` 菜单含「删除会话」项(红色,二次确认) |
| 🧹 **彻底删除本地数据** | 官方「删除」= 归档 + 移除注册,会话日志(`~/.dsh/sessions/<cwd编码>/<id>/`)与投影缓存分片会留在磁盘上,重装 DSH / 重建索引后会重新登记(列表“复活”)。插件默认在删除后一并清除这些残留,并摘除 `workspace.json` 中的悬挂引用(批量工具条可关闭) |
| 🧽 **清理孤立数据** | 批量工具条「清理孤立数据」:扫描所有不在工作区账目中的遗留会话日志,预览「数量 / 总大小 / 最近项路径」后一键清理 —— 用于收拾历史上已经“删过但没删干净”的数据 |
| 🔀 **迁移会话** | 会话 `···` 菜单「迁移会话」:选择目标工作区 → 完整复制对话/轨迹 → 归档原会话 |
| 📋 **复制会话** | 会话 `···` 菜单「复制会话」:在目标工作区生成完整副本,原会话保持不变 |
| ⭐ **收藏工作区** | 工作区行 hover 出现星标按钮(空心 → 实心金色);「收藏」标签一键筛出常用工作区 |
| 🗂️ **工作区分组** | `+` 新建自定义分组;`···` 菜单「加入分组…」勾选归属(一个工作区可属多个分组,一个分组可含多个工作区) |
| 📤 **移出分组** | `···` 菜单「移出分组…」列出所属分组,点击即移出;「加入分组…」浮层里取消勾选同样可移出 |
| ⚙️ **分组管理** | 标签条最左齿轮按钮打开管理浮层:分组名称 + 成员数 + 删除按钮(两段确认,删除分组**不会**删除工作区) |
| 🧭 **记住所选分组** | 当前分组写入 `localStorage`,刷新页面自动恢复;分组被删除时自动回退到「全部」 |
| ↕️ **拖拽排序** | 工作区行拖拽重排(`workspaces.insertBefore`)、会话行同组内拖拽重排(`insertSessionBefore`),带官方同款上下指示线;仅「手动排序」模式生效并持久化 |
| 🎯 **定位到当前会话** | 搜索按钮左侧的定位按钮:跳到当前会话所在行并短暂高亮;若其工作区被折叠会自动展开,若当前分组视图不含它则自动切回「全部」 |
| ⏷ **一键展开全部** | 展开所有工作区与会话组 |
| ⏶ **一键折叠全部** | 折叠所有工作区与会话组 |
| 🛡️ **删除确认** | 所有删除操作都有二次确认条,展示将删除的工作区 / 会话数量 |
| 🔄 **列表自动同步** | 删除走官方客户端服务,列表自动同步;复制 / 迁移成功后主动 `refresh()` 兜底刷新 |
| 🎨 **主题一致** | 全部使用官方主题 token(`--dsw-alias-*` / `--dsw-static-*`),明暗主题自动适配 |

## 🖼️ 官方复刻清单

插件接管 `sidebar.workspaces` 后,以下官方元素被逐项复刻(样式取自官方 Web bundle 的 CSS 变量与哈希类实测值):

- **标题行**:⌕ 搜索(展开式输入框 + 会话内容全文搜索,`Escape` 清除)、☰ 视图选项(分组方式:按工作区 / 单列表;排序方式:手动 / 最近更新)、＋ 添加工作区(系统目录选择器)
- **工作区行**(34px):文件夹图标(展开=打开态、折叠=闭合态、含当前会话时高亮)、悬停箭头、名称、hover 操作区(`···` 菜单、＋ 新建会话;本插件追加星标按钮)
- **会话行**(32px):官方状态点(空闲=绿色圆环、进行中=蓝色矩阵追逐动画、等待审批/回答=橙色圆环)、标题、相对时间(刚刚 / N 分钟前 / …)、`···` 菜单、hover 删除按钮(批量模式)
- **悬浮卡片(HoverCard)**:工作区卡(名称 / 路径 / 创建日期)、会话卡(名称 / 相对时间 / 工作状态),官方配色 `#2C2C2E`、宽 244px、padding `12px 16px`、圆角 12px、阴影 `--dsw-shadow-lv3`
- **Tooltip**:padding `3px 7px`、圆角 8px、13px/20px、`--dsw-alias-tooltip-bg`;`···` 按钮与官方一致**不显示**悬浮提示(仅保留 aria-label),500ms 延迟、按钮下方 8px、边缘自动翻转
- **菜单**:官方 Menu 样式(圆角 12px、`--dsw-specific-menu` 背景、26px 行高、danger 项红色)、点击外部关闭、菜单打开期间该行不再显示悬浮卡片
- **交互细节**:行悬停才显示操作区、点击行打开会话、`···` 二次点击收起、视口级 fixed 定位 + 边缘避让、拖拽 before/after 锚定与指示线

## 🚀 安装

**前置**:已安装 DSH(`dsh web` 可正常运行),Node.js ≥ 20、pnpm ≥ 10。插件是**纯 JavaScript、无构建步骤**,不需要编译工具链。

### 方式一:官方 CLI(推荐,直接从 GitHub 安装)

```sh
dsh plugin --profile web add github:ostar999/ostar-dsh-left-sidebar
```

- pnpm 原生支持 `github:user/repo` 形式;CLI 会把依赖写入 profile 的 `package.json`,并依据包内 `cordis.patch.yml`(`dsh.bundle.patch` 声明)自动对账进 `dsh.profile.bundles`,**无需手动改任何 profile 文件**。
- 本包**没有构建脚本**,因此不受 pnpm 的 `Ignored build scripts` / `pnpm approve-builds` 拦截影响。
- 装完**完全重启 DSH**(host 半区变更需要重启)→ 浏览器硬刷新(Cmd/Ctrl+Shift+R)。
- 提示 `✕ missing peer ...` 是其它插件的 peer 依赖**警告**(react / cordis 等由 DSH 运行时提供),不影响本插件安装与运行。

**跟随开发线(dev 分支)**:

```sh
dsh plugin --profile web add github:ostar999/ostar-dsh-left-sidebar#dev
```

### 方式二:从源码安装(本地开发 / link 调试)

```text
1. git clone https://github.com/ostar999/ostar-dsh-left-sidebar.git
   cd ostar-dsh-left-sidebar

2. 在 DSH profile 的 package.json 中把依赖指向本地克隆:
   ~/.dsh/profiles/web/package.json
     "dependencies": {
       "ostar-dsh-left-sidebar": "link:<克隆目录的绝对路径>"
     }

3. 在 ~/.dsh/profiles/web/cordis.patch.yml 追加挂载行:
   - insert:
       - id: left-sidebar-manager
         name: 'ostar-dsh-left-sidebar'

4. 在 ~/.dsh/profiles/web 目录执行:
   pnpm install

5. 重启 DSH + 硬刷新浏览器。
```

> 找不到 `~/.dsh/profiles/web`?先跑一次 `dsh web` 初始化 profile。

### 方式三:让 DSH 自己装

把下面这段提示词发给任意一个 DSH 会话:

```text
帮我安装 ostar-dsh-left-sidebar 插件(DSH 左侧边栏工作区管理器),步骤:
1. 执行 dsh plugin --profile web add github:ostar999/ostar-dsh-left-sidebar
2. 确认 ~/.dsh/profiles/web/package.json 的 dependencies 与该 profile 的 dsh.profile.bundles 都含 ostar-dsh-left-sidebar
3. 完全重启 DSH,然后提醒我硬刷新浏览器(Cmd/Ctrl+Shift+R)
遇到报错先查 https://github.com/ostar999/ostar-dsh-left-sidebar README 的常见问题表。
```

## 🔄 更新

**CLI 方式(推荐)**:

```sh
dsh plugin --profile web add github:ostar999/ostar-dsh-left-sidebar
```

**从源码方式**:

```sh
cd <克隆目录> && git pull
# host 半区(src/index.js)有改动时,在 ~/.dsh/profiles/web 下执行 pnpm install
```

**github: 依赖的更新注意**:`pnpm update` / `pnpm install --force` 有时会把 `github:` 依赖行从 lock 中剔除或保留旧 commit。若发现版本没变化,用下面的显式重装:

```sh
cd ~/.dsh/profiles/web
rm -rf node_modules/ostar-dsh-left-sidebar
pnpm install            # 重新拉取远端最新 commit
```

然后**硬刷新浏览器**(client 改动热加载生效,无需重启 DSH;**host 半更新才需重启**)。

> 本机开发时如已把源码手动拷进 profile 包目录,`git pull` 后记得重新拷贝 `src/`,或直接改用「方式二」的 `link:` 依赖,避免两份源码不一致。

## 🗑️ 卸载

**CLI 方式(推荐)**:

```sh
dsh plugin --profile web remove ostar-dsh-left-sidebar
```

**手动方式**:从 `~/.dsh/profiles/web/package.json` 删除 `dependencies` 中的依赖行与 `dsh.profile.bundles` 中的条目 → `pnpm install` → 重启 DSH。

可选清理插件的分组数据(卸载后不再使用):

```sh
rm -rf ~/.dsh/ostar-dsh-left-sidebar          # 分组 / 收藏数据(groups.json)
```

> **卸载不会删除任何工作区或会话数据** —— 插件只操作官方注册表与归档集合,不触碰会话日志;迁移 / 复制产生的副本是真实会话,卸载后仍然保留。清理 `localStorage` 里的分组记忆:浏览器开发者工具 → Application → Local Storage → 删除 `ostar-dsh-left-sidebar.activeGroup`。

## 🖱️ 交互速查

| 操作 | 入口 |
| --- | --- |
| 进入 / 退出批量选中 | 标题行 ☑ 按钮(窄侧边栏会自动展开侧边栏) |
| 全选 / 清空选择 | 批量工具条「全选」「清空」 |
| 连同会话删除工作区 | 批量工具条「连同会话删除」勾选框(默认开启) |
| 彻底删除 / 仅移除注册 | 批量工具条「彻底删除本地日志」勾选框(默认开启;关闭则保留 `~/.dsh/sessions/` 日志) |
| 清理历史遗留数据 | 批量工具条「清理孤立数据」→ 预览 → 「清理这 N 项」 |
| 删除选中项 | 批量工具条「删除选中」→ 确认条「确认删除」 |
| 快速删除单个会话 | 会话行 hover「删除」按钮,或会话 `···` 菜单「删除会话」 |
| 迁移 / 复制会话 | 会话 `···` 菜单「迁移会话」「复制会话」→ 选目标工作区 |
| 定位到当前会话 | 搜索按钮左侧的定位(靶心)按钮 |
| 折叠 / 展开全部 | 标题行 ⏶ / ⏷ 按钮 |
| 收藏 / 取消收藏工作区 | 工作区行 hover 星标按钮 |
| 加入 / 移出分组 | 工作区 `···` 菜单「加入分组…」勾选 / 「移出分组…」点击分组行 |
| 新建分组 | 分组标签条「+」回车创建(创建后自动切换到该分组) |
| 管理 / 删除分组 | 分组标签条最左 ⚙ 按钮 → 分组管理(删除需两次点击确认) |
| 切换分组 | 分组标签条「全部」「收藏」或自定义分组名 |
| 手动排序 | 直接拖拽工作区行 / 会话行(排序方式需为「手动排序」) |

## 🏗️ 工作原理

```
┌──────────────────────────────────────────────────────────┐
│ 侧边栏                                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 工作区浏览区域(sidebar.workspaces 单槽)           │  │
│  │  ⌕ 搜索 · ☰ 视图选项 · ＋ 添加工作区 · ⏷ ⏶ ☑      │  │
│  │  ⚙ 全部 收藏 分组A 分组B  +            ← 分组标签条 │  │
│  │  ┌ 工作区 ────────── ★  ···  ＋ ┐                  │  │
│  │  │  • 会话        ● 5 分钟前  ··· │                 │  │
│  │  └───────────────────────────────┘                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
             │ client 半区                    │ host 半区
             ▼                                ▼
   ctx.workspaces / ctx.sessions      webServer 路由
   (官方服务,与官方 UI 同路径)        /ostar-dsh-left-sidebar/migrate
                                      /ostar-dsh-left-sidebar/groups
```

- **官方入口**:新建会话(`uiWorkspace.startSession`)、打开会话(`openSession`)、分叉(`forkSession`)、归档(`archiveSession`)、选目录(`pickDirectory`)都走 `uiWorkspace` 客户端服务 —— 与官方浏览器同一入口(内部处理工作区连接与 layout 导航);`ctx.workspaces` 只用于该服务未覆盖的注册表操作(创建 / 重命名 / 删除 / 排序)。
- **数据**:消费槽标准 hooks(`useSessions` / `useWorkspaces`,官方 session / workspace 快照 store)。会话标题、分组归属、归档标记、运行状态全部来自官方数据流,插件不维护会话副本。
- **删除**:调用官方客户端服务 `ctx.workspaces.delete(workspaceId)` 与 `ctx.workspaces.archiveSession(sessionId)` —— 与官方浏览器完全相同,store 自动同步(工作区删除 = 注册移除;会话删除 = 归档)。
- **彻底删除(本地数据清理)**:官方删除只在注册表层面生效,磁盘上仍留三处残留 —— 会话日志目录 `~/.dsh/sessions/<cwd编码>/<sessionId>/`、投影缓存分片 `~/.dsh/storages/session_projcache/sessions/<sessionId>.json`、以及 `workspace.json` 里悬挂的会话引用。DSH 重建索引或重装后会依据这些残留把工作区 / 会话重新登记出来(“复活”)。因此删除后由 host 路由 `POST /ostar-dsh-left-sidebar/purge` 清理上述残留(`workspace.json` 采用「临时文件 + rename」原子写回)。
- **清理孤立数据**:host 路由 `GET/POST /ostar-dsh-left-sidebar/orphans` —— GET 扫描 `~/.dsh/sessions/` 下所有会话目录,凡是既不在工作区 `sessionIds`、也不在 `archivedSessionIds` 中的即为孤立数据,返回数量 / 大小 / 最近项;POST 只接受客户端传来的 id 列表,并在 host 侧**再次校验**这些 id 确实不在账目中才删除。
- **迁移 / 复制**:官方模型里工作区归属 = 会话创建时的 cwd 目录,官方没有跨工作区移动 / 复制会话的 API(`insertSessionBefore` 仅支持同工作区排序、`fork` 副本继承原 cwd)。因此 **host 半区**提供同源路由 `/ostar-dsh-left-sidebar/migrate`,按官方 fork 的实现路径完成日志级复制:
  1. `sessionQuery.readSession(sourceId)` 读取完整事件日志;
  2. 截断到最后一个完成的 `turn/end`(与官方 fork 一致,进行中的 turn 无法复制);
  3. `agents.create({ sessionId, seed, meta: { cwd: 目标工作区路径, parentSession, seedLength, agentPreset } })` 在目标路径下创建新会话;
  4. `target.attachSession(childId)` 把副本挂进目标工作区账目;
  5. 「迁移」再 `archiveSession(sourceId)` 归档原会话。
  复制成功返回 `{ ok: true, childId }`,client 侧再调用运行时 `sessions.refresh()` / `workspaces.refresh()` 兜底刷新列表。
- **分组 / 收藏**:纯展示层数据,存在 `~/.dsh/ostar-dsh-left-sidebar/groups.json`(`host` 半区 `GET/POST /ostar-dsh-left-sidebar/groups` 读写),**不改动官方工作区 / 会话账目**;当前所选分组存在浏览器 `localStorage`。切换分组只是过滤渲染,不影响官方列表数据本身。
- **样式与图标**:官方 SVG path 以数据形式内联复刻(插件运行期无法 `import` 官方组件);样式全部走官方主题 token 并带 fallback;悬浮元素用 `position: fixed` + 视口边缘避让(侧边栏容器 `overflow: hidden` 会裁剪行内绝对定位)。

## 📁 目录结构

```
ostar-dsh-left-sidebar/
├── src/
│   ├── index.js          # Host 半区:迁移/复制 + 分组持久化 + 彻底删除/孤立数据清理路由
│   └── client.js         # Client 半区:浏览器复刻 + 全部管理功能(单文件 UI 逻辑)
├── dsh.plugin.json       # 插件清单(id / main / client.main / contributes)
├── cordis.patch.yml      # bundle patch:CLI 安装时自动追加挂载行
├── package.json          # npm 包元数据(dsh.bundle.patch / dsh.client.platform)
├── README.md             # 本文档
└── LICENSE               # MIT
```

## 🛠️ 开发与调试

### 环境

```sh
git clone https://github.com/ostar999/ostar-dsh-left-sidebar.git
cd ostar-dsh-left-sidebar
# 纯 JS 源码,无构建步骤、无依赖安装;按「方式二」link 到 profile 即可迭代
node --check src/client.js && node --check src/index.js   # 语法自检
```

### 修改与验证循环

1. 改 `src/client.js`(浏览器与全部 UI / 管理逻辑)或 `src/index.js`(host 路由);
2. 浏览器 **硬刷新**(Cmd/Ctrl+Shift+R)加载新 client 代码 —— **client 改动不需要重启 DSH**;
3. **host 半区改动必须重启 DSH**(路由在进程启动时注册);
4. 用 `link:` 依赖时改动立即生效;若手工拷贝到 `~/.dsh/profiles/web/node_modules/ostar-dsh-left-sidebar/`,每次改完记得重新拷贝 `src/`。

### 架构约束(改代码前必读)

- **注册方式**:client 通过 `slots.inject('sidebar.workspaces', () => slots.register({ name: 'sidebar.workspaces', priority: -100 }, ...))` 注册。`sidebar.workspaces` 是 **single 槽**,必须用负优先级压过官方浏览器的 `priority: 0`,否则会报 `already has a registration at priority 0`。
- **不要声明 `children` 子槽**:`sidebar.workspaces.directoryFlow` 已由官方声明,重复声明会报 `slot "..." is already declared`。
- **client 入口格式**:必须是 `window.__ModuleLoader__.load({ id, factory })`,在 factory 内 `require('react')`;写成普通 ESM 导出会报 `loaded without registering ... via __ModuleLoader__.load`。
- **不使用 TS / JSX / 打包器**:外部插件的 client 代码不做转换;React 元素一律 `React.createElement(...)`,`return`/`class` 等用 `var`/函数式写法。
- **样式注入**:外部插件环境下没有全局 `styles` 服务,用 `document.createElement('style')` 注入并带插件戳记。
- **状态点 / 图标 / 菜单 / 悬浮卡**:都是从官方 Web bundle 实测的哈希类样式与 SVG path 复刻,改动时请对照官方实现保持一致(用户对「与官方一致」非常敏感)。
- **分组数据契约**:`{ favorites: string[], groups: [{ id, name, workspaceIds: string[] }] }`;host 侧对非法结构做丢弃式校验,写入前 `mkdir -p`。改动字段时记得同步 host 校验与 client 读取。

### 调试技巧

```sh
# host 路由是否注册(400 bad-args = 路由正常,404 = 进程未加载新代码)
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:3080/ostar-dsh-left-sidebar/migrate
curl -s http://127.0.0.1:3080/ostar-dsh-left-sidebar/groups

# 分组数据文件
cat ~/.dsh/ostar-dsh-left-sidebar/groups.json

# profile 中已安装的插件与 bundle 挂载
cat ~/.dsh/profiles/web/package.json
```

浏览器侧可用开发者工具观察 `document.querySelector('.wsmgr-root')` 结构与 `.wsmgr-*` 类的计算样式;插件所有 UI 类名都以 `wsmgr-` 前缀命名,便于与官方元素区分。

## 🌿 分支与发布

| 分支 | 用途 |
| --- | --- |
| `main` | 稳定线,默认分支。README、功能与发布说明以此为准 |
| `dev` | 开发线。新功能先在此迭代,验证通过后合并回 `main` |

**发布流程(纯 JS,无构建)**:

1. 在 `dev` 完成功能与自测(硬刷新 + host 重启验证);
2. 更新 `package.json` 与 `dsh.plugin.json` 的 `version` / `description`;
3. 更新 README 的功能表与「常见问题」;
4. `git commit` → `git push origin dev`;
5. 合并到 `main`(`git checkout main && git merge --ff-only dev`)→ `git push origin main`;
6. 使用方按「🔄 更新」重装即可。

> 本包未发布 npm,统一走 `github:` 依赖安装;若将来发布 npm,`package.json` 的 `files` 字段已声明需要随包分发的内容(`src`、`cordis.patch.yml`、`dsh.plugin.json`、`README.md`、`LICENSE`)。

## ❓ 常见问题

| 现象 | 原因与解决 |
| --- | --- |
| 报 `single slot "sidebar.workspaces" already has a registration at priority 0` | 注册 `sidebar.workspaces` 时必须显式 `priority: -100` 压过官方浏览器 |
| 报 `slot "sidebar.workspaces.directoryFlow" is already declared` | 注册时带了 `children` 声明,删掉(子槽由官方声明) |
| 报 `loaded without registering ... via __ModuleLoader__.load` | client 入口必须是 `window.__ModuleLoader__.load({ id, factory })` 形式 |
| 页面出现两个工作区列表 | 双挂载:profile 的 `cordis.patch.yml` 有旧的手动挂载行,同时 bundle patch 也生效 —— 删除手动挂载行 |
| 分组标签条 / 星标按钮不出现,`curl .../groups` 返回 404 | 运行的 DSH 进程还是旧代码:host 半区新增路由需要**重启 DSH**(仅刷新浏览器不够) |
| 设置分组后刷新网页又回到「全部」 | 浏览器禁用了 `localStorage`(隐私模式 / 站点数据被清),或分组已被删除(此时按设计回退到「全部」) |
| 删除会话/工作区后,重装 DSH 或重建索引时又出现 | 官方删除只归档、日志仍留在 `~/.dsh/sessions/`。更新到 0.3.0+,删除时保持「彻底删除本地日志」勾选(默认开启);历史残留用批量工具条「清理孤立数据」一次清掉 |
| 「清理孤立数据」显示的数量很大 | 孤立 = 不在当前 `workspace.json` 账目中。账目被重置 / 回滚过时会偏多;预览里能看到路径与大小,确认无误再清理 |
| 复制 / 迁移成功但列表不显示新会话 | 更新到最新版(client 成功后自动 `refresh()`);仍不显示则硬刷新浏览器 |
| 迁移会话报 `workspace-move-invalid: the session is not accounted` | 旧版本误用 `insertSessionBefore` 跨工作区移动(官方仅支持同工作区排序);更新到最新版(走 host 日志级复制) |
| 无法手动排序 | 排序方式需为「手动排序」(视图选项 ☰ 里切换);「最近更新」模式下拖拽不生效(与官方一致) |
| 复制请求失败(响应:空) | host 路由未注册(见上一条 `404` 项);或 DSH 版本变化导致 `agents.create` / `attachSession` 签名变化,查浏览器 Network 面板与 DSH 控制台 |
| 安装时出现 `✕ missing peer ...` | 其它插件的 peer 依赖**警告**(react / cordis 由 DSH 运行时提供),不影响安装与运行 |
| 点「添加工作区」报 `svc.pickDirectory is not a function` | 0.4.1 前误把目录选择器当成 `ctx.workspaces` 的方法。目录选择与新建会话其实都在 `uiWorkspace` 客户端服务上(`ui-workspace` 插件提供)。更新到 0.4.1+ |
| 点工作区行右侧「＋」没有反应 | 同上:`startSession` 属 `uiWorkspace.startSession`。0.4.1+ 已按官方入口调用(内部完成工作区连接与导航) |
| 改了代码没效果 | client 改动需硬刷新;host 改动需重启 DSH;`link:`/拷贝方式确认源码已同步到 profile 包目录 |
| 提示 `dsh: command not found` | 先安装 DSH;或 `npx -y --package @deepseek-ai/dsh dsh plugin --profile web add github:ostar999/ostar-dsh-left-sidebar` |

## ⚠️ 已知限制

- **删除默认彻底**:勾选「彻底删除本地日志」(默认开启)时会物理删除会话日志与缓存,**不可恢复**;关闭该勾选则退化为官方语义(归档 / 移除注册,日志保留)。「迁移会话」仍为「复制 + 归档原会话」,原会话日志保留。
- **孤立数据的判定依据是当前账目**:`清理孤立数据` 以 `workspace.json` 为准 —— 如果该文件曾被重置 / 回滚,原本正常的会话也可能被判为孤立,因此清理前务必看预览(数量、大小、路径)再确认。
- **迁移 = 复制 + 归档原会话**,不是官方数据模型里的「移动」。副本是全新会话(新 id),原会话被归档而非删除。
- **只复制到最后一个完成的 turn**:进行中的 turn 无法复制(与官方 fork 行为一致)。
- **拖拽排序仅「手动排序」模式持久化**:与官方一致;「最近更新」模式下顺序由更新时间决定。
- **分组是展示层数据**:不改变会话归属,因此同一工作区不会因为「不在当前分组」而在官方列表中消失 —— 只是当前视图不渲染它;删除分组只删分组记录,工作区原样保留。
- **窄侧边栏(rail 模式)下分组标签条不显示**(需要宽度才能放下),此时视图为「全部」;会话管理按钮仍可用。
- 分组标签条的行内新建输入框不支持中文输入法组合态的特殊处理,回车提交(输入法候选框内的回车可能被当作提交,建议先确认候选再回车)。

## 📄 许可证

[MIT](./LICENSE) © ostar999

---

<div align="center">
  <sub>为 <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a> 生态构建 · 官方体验优先,管理能力叠加</sub>
</div>
