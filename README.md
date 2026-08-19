# ostar-dsh-left-sidebar

<!-- Hero -->
<div align="center">
  <b style="font-size: 1.15em;">DSH 左侧边栏工作区管理器：批量删除 · 单选删除 · 迁移/复制会话 · 一键折叠/展开全部</b><br /><br />
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
  <img alt="批量删除工作区" src="https://img.shields.io/badge/-批量删除工作区-4d6bfe" />
  <img alt="批量·单选删除会话" src="https://img.shields.io/badge/-批量·单选删除会话-4d6bfe" />
  <img alt="迁移·复制会话" src="https://img.shields.io/badge/-迁移·复制会话-4d6bfe" />
  <img alt="一键折叠·展开全部" src="https://img.shields.io/badge/-一键折叠·展开全部-4d6bfe" />
  <img alt="官方功能完整保留" src="https://img.shields.io/badge/-官方功能完整保留-2fbf71" /><br /><br />
  <b>不牺牲官方体验的工作区管理</b> —— 官方工作区浏览器的<b>全部功能、样式与交互逐项复刻保留</b>，<br />
  管理能力以<b>同尺寸按钮</b>叠加在工作区按钮行上。
</div>

---

## 📖 项目简介

`ostar-dsh-left-sidebar` 是一个 **DSH(DeepSeek Harness)Web 客户端插件**,为左侧边栏的「工作区 / 会话」浏览区域补充管理能力:

- **批量删除工作区**(可连同其会话一起删除)
- **批量删除会话** 与 **单选删除会话**(行内删除按钮 / `···` 菜单「删除会话」)
- **迁移会话 / 复制会话** 到其他工作区(含对话、轨迹全部会话数据)
- **一键折叠全部 / 展开全部** 所有工作区与会话组

同时,**官方浏览器的一切都被完整保留**:标题行的 ⌕ 搜索(展开式输入框 + 内容全文搜索)、☰ 视图选项(分组方式:按工作区 / 单列表;排序方式:手动 / 最近更新)、＋ 添加工作区(系统目录选择器);工作区行的文件夹图标(开/合、当前会话高亮)、悬停箭头、`···` 菜单(重命名 / 删除工作区)、＋ 新建会话、悬浮卡片(名称 / 路径 / 创建日期);会话行的官方状态点(空闲=绿色圆环、进行中=蓝色矩阵追逐动画、等待=橙色圆环)、相对时间、`···` 菜单(重命名 / 分叉 / 归档 / 迁移 / 复制 / 删除会话)、悬浮卡片(名称 / 时间 / 工作状态);以及点击外部关闭菜单、行悬停操作、视口级悬浮定位等全部交互。

> 技术背景:侧边栏「工作区」浏览区域在 DSH 中是一个单插槽(`sidebar.workspaces`),由官方 ui-workspace 浏览器整体渲染。本插件以外部插件的负优先级注册方式接管该区域,并在其中**逐项复刻官方浏览器的行为**,再叠加管理功能 —— 因此使用体验与官方一致,同时获得官方没有的管理能力。

## ✨ 功能一览

| 能力 | 说明 |
| --- | --- |
| 🗑️ **批量删除工作区** | 批量选中模式:每个工作区行复选框 + 「全选」+「删除选中」;可选「连同会话删除」(默认开启) |
| 💬 **批量删除会话** | 每个会话行复选框,支持多选后一次性删除 |
| 🎯 **单选删除会话** | 会话行内「删除」按钮;会话 `···` 菜单新增「删除会话」项(红色,二次确认) |
| 🔀 **迁移会话** | 会话 `···` 菜单「迁移会话」:选择目标工作区,完整复制对话/轨迹数据后归档原会话(从列表隐藏) |
| 📋 **复制会话** | 会话 `···` 菜单「复制会话」:选择目标工作区,在目标工作区生成完整副本,原会话不变 |
| ⏷ **一键展开全部** | 展开所有工作区与会话组(含「未分组」) |
| ⏶ **一键折叠全部** | 折叠所有工作区与会话组 |
| 🛡️ **删除确认** | 所有删除操作均有二次确认条,展示将删除的工作区 / 会话数量 |
| 🔄 **状态同步** | 删除走官方客户端服务(`workspaces.delete` / `workspaces.archiveSession`),与产品自带 UI 同一路径,删除后列表自动同步;复制/迁移成功后自动刷新列表 |
| 🖥️ **官方复刻** | 搜索 / 视图选项 / 添加工作区 / 行菜单 / 悬浮卡片 / 状态点 / 字体(标题 14px、时间 12px)/ 行高(工作区 34px、会话 32px)与官方逐项一致 |
| 🎨 **主题一致** | 全部使用官方主题 token(`--dsw-alias-*`、`--dsw-static-*`),明暗主题自动适配 |

## 🏗️ 工作原理

```
┌─────────────────────────────────────────────────┐
│ 侧边栏 (sidebar)                                │
│  ┌───────────────────────────────────────────┐ │
│  │ 工作区浏览区域 (sidebar.workspaces 槽)     │ │
│  │  ⌕ 搜索 · ☰ 视图选项 · ＋ 添加工作区        │ │
│  │  ⏷ 展开全部 · ⏶ 折叠全部 · ☑ 批量选中  ←新增│ │
│  │  ┌ 工作区 ──────────── ···  ＋ ┐           │ │
│  │  │  • 会话  ● 5 分钟前   ···  │           │ │
│  │  └─────────────────────────────┘           │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- **数据**:消费槽标准 hooks(`useSessions` / `useWorkspaces`,官方 session/workspace 快照 store),会话标题、分组、归档标记、运行状态全部来自官方数据流,无需额外 RPC。
- **删除**:客户端 `ctx.workspaces.delete(workspaceId)` 与 `ctx.workspaces.archiveSession(sessionId)` —— 与官方浏览器完全相同,客户端 store 自动同步。
- **迁移 / 复制**:官方模型里工作区归属 = 会话创建时的 cwd 目录,官方没有跨工作区移动/复制会话的 API(`insertSessionBefore` 仅限同工作区排序,`fork` 副本继承原 cwd)。因此 Host 半区提供同源路由 `/ostar-dsh-left-sidebar/migrate`,按官方 fork 的实现路径(`agents.create` + `seed` 完整事件日志)在目标工作区路径下创建副本,再 `attachSession` 更新目标工作区账目 —— 对话、轨迹数据完整复制;「迁移」在复制后归档原会话。复制成功后 client 调用运行时 `refresh()` 强制刷新列表。
- **UI**:官方 SVG 图标以数据形式内联复刻(插件运行时无法 `import` 官方图标组件);样式使用官方主题 token。

## 📁 目录结构

```
ostar-dsh-left-sidebar/
├── src/
│   ├── index.js          # Host 半区:迁移/复制会话路由(/ostar-dsh-left-sidebar/migrate)
│   └── client.js         # Client 半区:完整浏览器 + 管理功能(全部 UI 逻辑)
├── dsh.plugin.json       # 插件清单(id / main / client.main / contributes)
├── cordis.patch.yml      # bundle patch:CLI 安装时自动追加挂载行
├── package.json          # npm 包元数据(dsh.bundle.patch / client.platform)
├── README.md             # 本文档
└── LICENSE               # MIT
```

## 🚀 安装

**前置**:已安装 DSH(`dsh web` 可正常运行),Node.js ≥ 20。

### 方式一:官方 CLI(推荐,直接从 GitHub 安装)

```sh
dsh plugin --profile web add github:ostar999/ostar-dsh-left-sidebar
```

- pnpm 原生支持 `github:user/repo` 形式;CLI 会自动把依赖写入 profile 的 `package.json`,并依据包的 `cordis.patch.yml`(`dsh.bundle` 声明)自动对账进 `dsh.profile.bundles`,无需手动改文件。
- 装完**完全重启 DSH**(host 半区变更需要重启)→ 浏览器硬刷新(Cmd/Ctrl+Shift+R)。
- 提示:`✕ missing peer ...` 是 peer 依赖**警告**(其它插件声明的 react/cordis 等由 DSH 运行时提供),不影响安装与运行。

### 方式二:从源码安装(本地开发调试)

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

5. 重启 DSH + 硬刷新浏览器,即可在工作区按钮行看到新增按钮。
```

> 找不到 `~/.dsh/profiles/web`?先跑一次 `dsh web` 初始化 profile。

## 🔄 更新

**CLI 方式(推荐)**:

```sh
dsh plugin --profile web add github:ostar999/ostar-dsh-left-sidebar@latest
```

**从源码方式**:

```sh
cd <克隆目录>
git pull
# host 半区有改动时,在 ~/.dsh/profiles/web 下 pnpm install
```

然后硬刷新浏览器即可(client 改动热加载生效,无需重启 DSH;host 半改动才需重启)。

## 🗑️ 卸载

**CLI 方式(推荐)**:

```sh
dsh plugin --profile web remove ostar-dsh-left-sidebar
```

**手动方式**:从 `~/.dsh/profiles/web/package.json` 删除依赖行与 `dsh.profile.bundles` 中的条目 → `pnpm install` → 重启 DSH。

> 卸载不会删除任何工作区或会话数据 —— 插件只操作官方注册表 / 归档集合,不触碰会话日志;迁移/复制产生的副本是真实会话,卸载后仍保留。

## 🛠️ 开发

### 环境

```sh
git clone https://github.com/ostar999/ostar-dsh-left-sidebar.git
cd ostar-dsh-left-sidebar
# 纯 JS 源码,无需构建;按「方式二」link 到 profile 即可迭代
```

### 修改与验证

1. 修改 `src/client.js`(浏览器与全部管理逻辑)或 `src/index.js`(Host 半区);
2. 浏览器 **硬刷新**(Cmd/Ctrl+Shift+R)加载新 client 代码 —— client 改动无需重启 DSH;
3. Host 半区改动需要重启 DSH。

### 架构要点(改代码前必读)

- **注册方式**:Client 半区通过 `slots.inject('sidebar.workspaces', ...)` 注册浏览器组件;`sidebar.workspaces` 是 single 槽,动态插件负优先级胜出,替换官方浏览器。⚠️ **不要在该注册中声明 `children` 子槽**(`sidebar.workspaces.directoryFlow` 已由官方声明,重复声明会报 `slot "..." is already declared`)。
- **React 环境**:Client 半区以 DSH 外部插件规范提供 —— `window.__ModuleLoader__.load({ id, factory })`,工厂内 `require('react')` 解析到 shell 共享的 React,不 `import` 任何包;若改为独立打包发布,需按外部插件规范显式声明 peerDependencies 并构建。
- **图标**:全部为官方 SVG path 的内联复刻(搜索 / 视图选项 / 添加工作区 / 文件夹 / 箭头 / 省略号 / 加号 / 编辑 / 删除 / 分叉 / 归档 / 展开 / 折叠 / 批量选中)。
- **状态点**:官方 StateDot 的复刻 —— 空闲=绿色圆环(`:before` 10% 外圈 + `:after` 60% 内核)、进行中=3×3 矩阵追逐动画(8 个 2px 格,125ms 负延迟)、等待=橙色圆环。
- **悬浮元素**:菜单 / 悬浮卡片 / tooltip 一律 `position: fixed` 视口定位 + 自动避让边缘 —— 侧边栏浏览容器是 `overflow: hidden`,行内绝对定位会被裁剪;菜单打开时渲染全屏透明遮罩实现「点击外部关闭」。
- **··· 菜单交互**:`···` 按钮不显示悬浮提示(`noTip`,与官方一致仅保留 aria-label);点击打开菜单时立即清除该行悬浮卡片,且菜单打开期间该行不再显示悬浮卡片(官方 HoverCard 的 `disabled: menuOpen` 行为)。
- **迁移/复制(Host 半区)**:路由 `/ostar-dsh-left-sidebar/migrate` 处理跨工作区复制 —— `sessionQuery.readSession` 读完整日志 → `agents.create({ seed, meta: { cwd: 目标工作区路径, parentSession, seedLength, agentPreset } })`(与官方 fork 同路径)→ `target.attachSession(childId)` 更新账目(触发 client 实时同步)→ 「迁移」再 `archiveSession(源)`。与官方 fork 一致:仅复制到最后一个完成的 turn;副本标题继承日志内 title 事件。client 成功后调用运行时 `sessions.refresh()` / `workspaces.refresh()` 兜底刷新列表。
- **主题**:只用官方 token(`--dsw-alias-*` / `--dsw-static-*`),并带 fallback,保证明暗主题一致。
- **删除语义**:工作区删除 = 注册移除(会话落入「未分组」);会话删除 = 归档(从分组面隐藏,日志保留)。如需真正物理删除会话,需另行扩展 Host 半区。

### 常见问题

| 现象 | 原因与解决 |
| --- | --- |
| 报 `slot "sidebar.workspaces.directoryFlow" is already declared` | 注册 `sidebar.workspaces` 时带了 `children` 声明。删除注册选项中的 `children`(子槽由官方声明)。 |
| 报 `loaded without registering ... via __ModuleLoader__.load` | client 入口必须是 `window.__ModuleLoader__.load({ id, factory })` 形式(参见 `src/client.js`),不能是普通 ESM 导出。 |
| 报 `single slot "sidebar.workspaces" already has a registration at priority 0` | 注册 `sidebar.workspaces` 时必须显式 `priority: -100` 压过官方浏览器。 |
| 页面出现两个工作区列表 | 双挂载:profile 的 `cordis.patch.yml` 有旧挂载行 + bundle patch 同时生效。删除旧的手动挂载行。 |
| 安装时出现 `✕ missing peer ...` | peer 依赖**警告**(其它插件声明的 react/cordis/dsh-* 由 DSH 运行时提供),不影响安装与运行。 |
| 复制/迁移成功但列表不显示新会话 | 旧版本缺少列表刷新。更新到最新版(client 成功后自动调用 `refresh()`);仍不显示则硬刷新浏览器。 |
| 迁移会话报 `workspace-move-invalid: the session is not accounted` | 旧版本误用 `insertSessionBefore` 跨工作区移动(官方仅支持同工作区排序)。更新到最新版(走 host 日志级复制)。 |
| 改了代码没效果 | client 改动需硬刷新(Cmd/Ctrl+Shift+R);host 改动需重启 DSH。 |
| 报 `Ignored build scripts` | pnpm 拦截构建脚本,在 profile 目录跑 `pnpm approve-builds --all`(本插件纯 JS 无构建脚本,通常不受影响)。 |
| 提示 `dsh: command not found` | 先安装 DSH;或 `npx -y --package @deepseek-ai/dsh dsh plugin ...`。 |

## 📄 许可证

[MIT](./LICENSE) © ostar999
