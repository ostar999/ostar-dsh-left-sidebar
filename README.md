# ostar-dsh-left-sidebar

<!-- Hero -->
<div align="center">
  <b style="font-size: 1.15em;">DSH 左侧边栏工作区管理器：批量删除 · 单选删除 · 一键折叠/展开全部</b><br /><br />
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
  <img alt="批量删除工作区" src="https://img.shields.io/badge/-批量删除工作区-4d6bfe" />
  <img alt="批量·单选删除会话" src="https://img.shields.io/badge/-批量·单选删除会话-4d6bfe" />
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
- **一键折叠全部 / 展开全部** 所有工作区与会话组

同时,**官方浏览器的一切都被完整保留**:标题行的 ⌕ 搜索(展开式输入框 + 内容全文搜索)、☰ 视图选项(分组方式:按工作区 / 单列表;排序方式:手动 / 最近更新)、＋ 添加工作区(系统目录选择器);工作区行的文件夹图标(开/合、当前会话高亮)、悬停箭头、`···` 菜单(重命名 / 删除工作区)、＋ 新建会话、悬浮卡片(名称 / 路径 / 创建日期);会话行的官方状态点(空闲=绿色圆环、进行中=蓝色矩阵追逐动画、等待=橙色圆环)、相对时间、`···` 菜单(重命名 / 分叉 / 归档 / 删除会话)、悬浮卡片(名称 / 时间 / 工作状态);以及点击外部关闭菜单、行悬停操作、视口级悬浮定位等全部交互。

> 技术背景:侧边栏「工作区」浏览区域在 DSH 中是一个单插槽(`sidebar.workspaces`),由官方 ui-workspace 浏览器整体渲染。本插件以动态插件优先级的注册方式接管该区域,并在其中**逐项复刻官方浏览器的行为**,再叠加管理功能 —— 因此使用体验与官方一致,同时获得官方没有的管理能力。

## ✨ 功能一览

| 能力 | 说明 |
| --- | --- |
| 🗑️ **批量删除工作区** | 批量选中模式:每个工作区行复选框 + 「全选」+「删除选中」;可选「连同会话删除」(默认开启) |
| 💬 **批量删除会话** | 每个会话行复选框,支持多选后一次性删除 |
| 🎯 **单选删除会话** | 会话行内「删除」按钮;会话 `···` 菜单新增「删除会话」项(红色,二次确认) |
| ⏷ **一键展开全部** | 展开所有工作区与会话组(含「未分组」) |
| ⏶ **一键折叠全部** | 折叠所有工作区与会话组 |
| 🛡️ **删除确认** | 所有删除操作均有二次确认条,展示将删除的工作区 / 会话数量 |
| 🔄 **状态同步** | 删除走官方客户端服务(`workspaces.delete` / `workspaces.archiveSession`),与产品自带 UI 同一路径,删除后列表自动同步 |
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
- **UI**:官方 SVG 图标以数据形式内联复刻(插件运行时无法 `import` 官方图标组件);样式使用官方主题 token。

## 📁 目录结构

```
ostar-dsh-left-sidebar/
├── src/
│   ├── index.js          # Host 半区(纯 Client 插件,空 apply)
│   └── client.js         # Client 半区:完整浏览器 + 管理功能(全部逻辑)
├── dsh.plugin.json       # 插件清单(id / main / client.main / contributes)
├── cordis.patch.yml      # bundle patch:CLI 安装时自动追加挂载行
├── package.json          # npm 包元数据(dsh.bundle.patch / client.platform)
├── README.md             # 本文档
└── LICENSE               # MIT
```

## 🚀 安装

**前置**:已安装 DSH(`dsh web` 可正常运行),Node.js ≥ 20。

### 方式一:官方 CLI(已发布 npm 时)

```sh
dsh plugin --profile web add ostar-dsh-left-sidebar@latest
```

装完**硬刷新浏览器**(Cmd/Ctrl+Shift+R)即可看到效果(DSH 对 client 改动热加载,无需重启;仅 host 半更新时需要重启)。

> 当前版本尚未发布到 npm 时,请使用「方式二」从源码安装。

### 方式二:从源码安装(推荐,本仓库当前方式)

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

5. 硬刷新浏览器(Cmd/Ctrl+Shift+R),即可在工作区按钮行看到新增按钮。
```

> 找不到 `~/.dsh/profiles/web`?先跑一次 `dsh web` 初始化 profile。

## 🔄 更新

**从源码方式**:

```sh
cd <克隆目录>
git pull
# 若 host 半区有改动:
# 在 ~/.dsh/profiles/web 下 pnpm install
```

然后硬刷新浏览器即可(client 改动热加载生效,无需重启 DSH;host 半改动才需重启)。

**CLI 方式(已发布 npm 时)**:

```sh
dsh plugin --profile web add ostar-dsh-left-sidebar@latest
```

## 🗑️ 卸载

**从源码方式**:

```text
1. 从 ~/.dsh/profiles/web/package.json 删除 "ostar-dsh-left-sidebar" 依赖行
2. 从 ~/.dsh/profiles/web/cordis.patch.yml 删除对应的
   - insert:
       - id: left-sidebar-manager
         name: 'ostar-dsh-left-sidebar'
3. 在 ~/.dsh/profiles/web 下执行 pnpm install
4. 硬刷新浏览器
```

**CLI 方式(已发布 npm 时)**:`dsh plugin --profile web remove ostar-dsh-left-sidebar`,或手动删除 profile 中的依赖与挂载行。

> 卸载不会删除任何工作区或会话数据 —— 插件只操作官方注册表 / 归档集合,不触碰会话日志。

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
- **React 环境**:Client 半区代码使用运行时注入的全局 `React`(与 DSH 动态插件运行环境一致),不 `import` 任何包;若改为独立打包发布,需按 DSH 外部插件规范显式声明 `react` peerDependency 并构建。
- **图标**:全部为官方 SVG path 的内联复刻(搜索 / 视图选项 / 添加工作区 / 文件夹 / 箭头 / 省略号 / 加号 / 编辑 / 删除 / 分叉 / 归档 / 展开 / 折叠 / 批量选中)。
- **状态点**:官方 StateDot 的复刻 —— 空闲=绿色圆环(`:before` 10% 外圈 + `:after` 60% 内核)、进行中=3×3 矩阵追逐动画(8 个 2px 格,125ms 负延迟)、等待=橙色圆环。
- **悬浮元素**:菜单 / 悬浮卡片 / tooltip 一律 `position: fixed` 视口定位 + 自动避让边缘 —— 侧边栏浏览容器是 `overflow: hidden`,行内绝对定位会被裁剪;菜单打开时渲染全屏透明遮罩实现「点击外部关闭」。
- **主题**:只用官方 token(`--dsw-alias-*` / `--dsw-static-*`),并带 fallback,保证明暗主题一致。
- **删除语义**:工作区删除 = 注册移除(会话落入「未分组」);会话删除 = 归档(从分组面隐藏,日志保留)。如需真正物理删除会话,需另行扩展 Host 半区。

### 常见问题

| 现象 | 原因与解决 |
| --- | --- |
| 报 `slot "sidebar.workspaces.directoryFlow" is already declared` | 注册 `sidebar.workspaces` 时带了 `children` 声明。删除注册选项中的 `children`(子槽由官方声明)。 |
| 页面出现两个工作区列表 | 双挂载:profile 的 `cordis.patch.yml` 有旧挂载行 + bundle patch 同时生效。删除旧的手动挂载行。 |
| 改了代码没效果 | client 改动需硬刷新(Cmd/Ctrl+Shift+R);host 改动需重启 DSH。 |
| 报 `Ignored build scripts` | pnpm 11 拦截构建脚本,在 profile 目录跑 `pnpm approve-builds --all`。 |
| 提示 `dsh: command not found` | 先安装 DSH;或 `npx -y --package @deepseek-ai/dsh dsh plugin ...`。 |

## 📄 许可证

[MIT](./LICENSE) © ostar999
