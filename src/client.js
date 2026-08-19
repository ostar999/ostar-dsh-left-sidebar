/**
 * ostar-dsh-left-sidebar —— Client 半区。
 *
 * 侧边栏「工作区」浏览区域的完整浏览器 + 工作区管理功能：
 *
 * 1. 官方功能复刻（与官方 ui-workspace 浏览器逐项对齐）：
 *    - 标题行：⌕ 搜索（展开输入框 + 内容搜索）、☰ 视图选项（分组/排序菜单）、＋ 添加工作区（系统目录选择器）
 *    - 工作区行：文件夹图标（开/合、当前会话高亮）、悬停箭头、14px 标题、
 *      ··· 菜单（重命名 / 删除工作区）、＋ 新建会话、悬浮卡片（名称/路径/创建日期）
 *    - 会话行：官方 StateDot（空闲=绿色圆环、进行中=蓝色矩阵追逐动画、等待=橙色圆环）、
 *      14px 标题、12px 相对时间、··· 菜单（重命名/分叉/归档/删除会话）、
 *      悬浮卡片（名称/时间/工作状态）
 *    - 交互：点击行打开/折叠、悬停显示行操作、点击外部关闭菜单、
 *      菜单/悬浮卡片/tooltip 全部视口级定位（不被侧边栏 overflow 裁剪）
 *
 * 2. 新增功能（叠加在工作区按钮行，28×28 与官方按钮同尺寸）：
 *    - ⏷ 展开全部 / ⏶ 折叠全部：一键展开/折叠所有工作区与会话组
 *    - ☑ 批量选中：管理模式（每行复选框 + 行内删除按钮 + 工具条：
 *      退出/全选/清空/连同会话删除/已选计数/删除选中，删除前二次确认）
 *
 * 删除统一走官方客户端服务：
 *   - 工作区：`ctx.workspaces.delete(workspaceId)`（注册移除，会话落入未分组）
 *   - 会话：`ctx.workspaces.archiveSession(sessionId)`（归档，从分组面隐藏）
 * 与官方自带 UI 同一路径，删除后列表自动同步。
 *
 * 实现说明：浏览器注册到 `sidebar.workspaces`（single 槽，动态插件负优先级
 * 胜出，替换官方浏览器）；所有图标为官方 SVG path 的内联复刻（不可 import）；
 * 全部样式使用官方主题 token（--dsw-alias-* / --dsw-static-*）。
 */
window.__ModuleLoader__.load({
  id: "ostar-dsh-left-sidebar",
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require("react")

    const byRecency = (a, b) => b.updatedAt - a.updatedAt

const ICONS = {
  search: { vb: '0 0 16 16', paths: [
    { d: 'M11.894845 6.647401C11.894845 3.725463 9.534486 1.356779 6.623219 1.35657C3.711786 1.35657 1.351635 3.725338 1.351635 6.647401C1.351843 9.569296 3.711911 11.938273 6.623219 11.938273C9.534361 11.938064 11.894637 9.569171 11.894845 6.647401ZM13.245462 6.647401C13.245254 10.317935 10.280401 13.293613 6.623219 13.293821C2.965871 13.293821 0.000204 10.31806 0 6.647401C0 2.976574 2.965746 0 6.623219 0C10.280526 0.000205 13.245462 2.9767 13.245462 6.647401Z' },
    { d: 'M16.000417 15.041079L15.044449 16.000433L11.530434 12.473588L12.486298 11.514234L16.000417 15.041079Z' },
  ] },
  projectAdd: { vb: '0 0 16 16', paths: [
    { t: 'translate(9.52 2.52)', d: 'M3.55246 0L3.55246 2.44252L6 2.44252L6 3.55748L3.55246 3.55748L3.55246 6L2.43834 6L2.43834 3.55748L0 3.55748L0 2.44252L2.43834 2.44252L2.43834 0L3.55246 0Z' },
    { t: 'translate(0.3496 2.35)', d: 'M4.76367 0C5.36861 1.80598e-05 5.93113 0.310294 6.25488 0.821289L6.78027 1.64941C6.79685 1.67558 6.81791 1.69775 6.83887 1.71973C6.72186 2.15521 6.65702 2.61192 6.65137 3.08301C6.25601 2.96045 5.90909 2.70478 5.68164 2.3457L5.15723 1.5166C5.07183 1.38189 4.92318 1.3008 4.76367 1.30078L2.32422 1.30078C1.7589 1.30078 1.30078 1.7589 1.30078 2.32422L1.30078 10.1338C1.30078 10.6991 1.7589 11.1572 2.32422 11.1572L11.9766 11.1572C12.5419 11.1572 13 10.6991 13 10.1338L13 8.58398C13.4545 8.5135 13.8903 8.38748 14.3008 8.21289L14.3008 10.1338C14.3008 11.4171 13.2598 12.458 11.9766 12.458L2.32422 12.458C1.04093 12.458 0 11.4171 0 10.1338L0 2.32422C0 1.04093 1.04093 0 2.32422 0L4.76367 0Z' },
  ] },
  personal: { vb: '0 0 16 16', paths: [
    { t: 'translate(1.292 1.3)', d: 'M10.3232 9.18164C11.2868 9.18164 12.0985 9.82833 12.3506 10.7109L13.415 10.7109L13.415 11.8711L12.3496 11.8711C12.0971 12.7532 11.2864 13.3994 10.3232 13.3994C9.36031 13.3992 8.55012 12.7531 8.29785 11.8711L0 11.8711L0 10.7109L8.29688 10.7109C8.54876 9.82845 9.35988 9.18186 10.3232 9.18164ZM10.3232 10.3418C9.7999 10.3421 9.37534 10.7667 9.375 11.29C9.375 11.8137 9.79969 12.239 10.3232 12.2393C10.847 12.2393 11.2725 11.8138 11.2725 11.29C11.2721 10.7666 10.8468 10.3418 10.3232 10.3418ZM12.4326 11.291C12.4326 11.3549 12.4284 11.418 12.4229 11.4805C12.4287 11.4181 12.4326 11.355 12.4326 11.291ZM8.21484 11.2832C8.21484 11.2856 8.21484 11.2886 8.21484 11.291L8.21484 11.29C8.21484 11.2878 8.21484 11.2855 8.21484 11.2832ZM3.08301 4.59082C4.04605 4.59095 4.85696 5.23717 5.10938 6.11914L13.415 6.11914L13.415 7.2793L5.11035 7.2793C4.85833 8.16202 4.04648 8.80846 3.08301 8.80859C2.11972 8.80843 1.30963 8.16179 1.05762 7.2793L0 7.2793L0 6.11914L1.05762 6.11914C1.30994 5.23728 2.12006 4.59098 3.08301 4.59082ZM3.08301 5.75098C2.55962 5.75117 2.13512 6.17587 2.13477 6.69922C2.13477 7.22287 2.5594 7.64824 3.08301 7.64844C3.60665 7.64828 4.03223 7.2229 4.03223 6.69922C4.03187 6.17585 3.60643 5.75113 3.08301 5.75098ZM5.19238 6.69922C5.19238 6.763 5.18816 6.82633 5.18262 6.88867C5.18846 6.82629 5.19238 6.76313 5.19238 6.69922C5.19236 6.63495 5.18853 6.57152 5.18262 6.50879C5.18826 6.57154 5.19236 6.635 5.19238 6.69922ZM0.982422 6.52344C0.977382 6.58136 0.97463 6.63999 0.974609 6.69922C0.974609 6.75775 0.977496 6.81579 0.982422 6.87305C0.977758 6.81579 0.974609 6.75767 0.974609 6.69922C0.974628 6.64 0.977618 6.58142 0.982422 6.52344ZM10.3232 0C11.2869 0 12.0986 0.646596 12.3506 1.5293L13.415 1.5293L13.415 2.68945L12.3496 2.68945C12.363 2.64266 12.3754 2.59488 12.3857 2.54688C12.1838 3.50118 11.3376 4.21777 10.3232 4.21777C9.36037 4.21756 8.55018 3.57139 8.29785 2.68945L0 2.68945L0 1.5293L8.29688 1.5293C8.5487 0.646717 9.35981 0.00021854 10.3232 0ZM10.3232 1.16016C9.79984 1.16042 9.37524 1.58499 9.375 2.1084C9.375 2.63201 9.79969 3.05735 10.3232 3.05762C10.847 3.05762 11.2725 2.63217 11.2725 2.1084C11.2722 1.58483 10.8469 1.16016 10.3232 1.16016ZM12.4229 2.29883C12.4287 2.23641 12.4326 2.17331 12.4326 2.10938C12.4326 2.17327 12.4284 2.23638 12.4229 2.29883ZM8.21484 2.10938L8.21484 2.1084L8.21484 2.10938ZM8.22266 1.93359C8.21785 1.98897 8.21506 2.04499 8.21484 2.10156C8.21503 2.04501 8.2181 1.98902 8.22266 1.93359ZM8.22266 11.1162C8.2179 11.1713 8.21507 11.227 8.21484 11.2832C8.21504 11.227 8.21814 11.1713 8.22266 11.1162Z' },
  ] },
  chevronDown: { vb: '0 0 14 14', paths: [
    { d: 'M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z' },
  ] },
  chevronUp: { vb: '0 0 14 14', paths: [
    { d: 'M2.15137 8.5L2.57617 8.07617L5.30273 5.34863C5.55843 5.09294 5.78438 4.86618 5.98828 4.70215C6.20088 4.53117 6.44405 4.38244 6.75 4.33398C6.91565 4.30778 7.08435 4.30778 7.25 4.33398C7.55595 4.38244 7.79912 4.53117 8.01172 4.70215C8.21561 4.86618 8.44157 5.09294 8.69727 5.34863L11.4238 8.07617L11.8486 8.5L11 9.34863L10.5762 8.92383L7.84863 6.19727C7.57405 5.92269 7.40124 5.75152 7.25977 5.6377C7.12709 5.53096 7.07728 5.52187 7.0625 5.51953C7.02105 5.51297 6.97895 5.51297 6.9375 5.51953C6.92272 5.52187 6.87291 5.53096 6.74023 5.6377C6.59876 5.75152 6.42595 5.92268 6.15137 6.19727L3.42383 8.92383L3 9.34863L2.15137 8.5Z' },
  ] },
  checklist: { vb: '0 0 14 14', paths: [
    { d: 'M13.3277 9.69629V10.976H7.28086V9.69629H13.3277Z' },
    { d: 'M13.3277 2.97256V4.25225H7.28086V2.97256H13.3277Z' },
    { d: 'M4.64512 10.336C4.64505 9.62755 4.07081 9.05322 3.3623 9.05322C2.65386 9.05329 2.07956 9.62759 2.07949 10.336C2.07949 11.0445 2.65382 11.6188 3.3623 11.6188C4.07085 11.6188 4.64512 11.0446 4.64512 10.336ZM5.92559 10.336C5.92559 11.7515 4.77777 12.8993 3.3623 12.8993C1.94689 12.8993 0.799805 11.7515 0.799805 10.336C0.799871 8.92066 1.94693 7.7736 3.3623 7.77354C4.77773 7.77354 5.92552 8.92062 5.92559 10.336Z' },
    { d: 'M4.64531 3.6123C4.6453 2.90382 4.07098 2.32949 3.3625 2.32949C2.65403 2.32951 2.0797 2.90383 2.07969 3.6123C2.07969 4.32079 2.65402 4.8951 3.3625 4.89512C4.07099 4.89512 4.64531 4.3208 4.64531 3.6123ZM5.925 3.6123C5.925 5.02772 4.77792 6.1748 3.3625 6.1748C1.9471 6.17479 0.8 5.02771 0.8 3.6123C0.800013 2.19691 1.9471 1.04982 3.3625 1.0498C4.77791 1.0498 5.92499 2.1969 5.925 3.6123Z' },
  ] },
  close: { vb: '0 0 14 14', paths: [
    { d: 'M10.6074 4.40278L8.00975 6.99973L10.6074 9.59739L9.59736 10.6074L6.9997 8.00978L4.40274 10.6074L3.3927 9.59739L5.98966 6.99973L3.3927 4.40278L4.40274 3.39273L6.9997 5.98969L9.59736 3.39273L10.6074 4.40278Z' },
  ] },
  folderOpen: { vb: '0 0 16 16', paths: [
    { d: 'M5.19629 1.57104C5.81144 1.5711 6.38623 1.8786 6.72754 2.39038L7.19922 3.09839C7.28454 3.22635 7.42824 3.30344 7.58203 3.30347H12.1699C13.5039 3.30348 14.5859 4.38548 14.5859 5.71948V6.62671C15.2694 7.02689 15.6605 7.85012 15.4385 8.68726L14.3848 12.658C14.1037 13.7164 13.1449 14.4527 12.0498 14.4529H2.91699C1.51651 14.4529 0.451662 13.2814 0.501954 11.9519V3.98706C0.501954 2.65305 1.58396 1.57104 2.91797 1.57104H5.19629ZM3.7793 7.75562C3.30994 7.75562 2.89883 8.07153 2.77832 8.52515L1.91602 11.7722C1.74167 12.4291 2.23734 13.073 2.91699 13.073H12.0498C12.5191 13.0728 12.9304 12.757 13.0508 12.3035L14.1045 8.33374C14.1819 8.04202 13.9619 7.756 13.6602 7.75562H3.7793ZM2.91797 2.9519C2.34625 2.9519 1.88281 3.41534 1.88281 3.98706V7.2937C2.33068 6.7269 3.02249 6.37476 3.7793 6.37476H13.2051V5.71948C13.2051 5.14777 12.7416 4.68434 12.1699 4.68433H7.58203C6.96675 4.6843 6.39209 4.37595 6.05078 3.86401L5.5791 3.15601C5.49379 3.02821 5.34995 2.95196 5.19629 2.9519H2.91797Z' },
    { opacity: '0.2', d: 'M13.6602 7.75525C13.9618 7.7556 14.1815 8.04179 14.1045 8.33337L13.0508 12.3031C12.9304 12.7567 12.5191 13.0725 12.0498 13.0726H2.91701C2.23744 13.0725 1.7417 12.4287 1.91603 11.7719L2.77834 8.52478C2.89898 8.07146 3.31018 7.75532 3.77931 7.75525H13.6602ZM5.1963 2.95154C5.34985 2.95159 5.49377 3.02803 5.57912 3.15564L6.0508 3.86365C6.39205 4.37553 6.96685 4.68385 7.58205 4.68396H12.1699C12.7416 4.68396 13.2049 5.14754 13.2051 5.71912V6.37439H3.77931C3.02267 6.37444 2.33067 6.72671 1.88283 7.29333V3.98669C1.88299 3.4152 2.34649 2.95168 2.91798 2.95154H5.1963Z' },
  ] },
  folderClose: { vb: '0 0 16 16', paths: [
    { t: 'translate(1.5 2.429)', d: 'M5.05582 0.518756L4.50669 0.86654L5.05582 0.518756ZM13 9.4837L13.65 9.4837L13.65 3.53962L13 3.53962L12.35 3.53962L12.35 9.4837L13 9.4837ZM11.3264 1.86603L11.3264 1.21603L6.52313 1.21603L6.52313 1.86603L6.52313 2.51603L11.3264 2.51603L11.3264 1.86603ZM5.58054 1.34727L6.12968 0.999489L5.60495 0.170972L5.05582 0.518756L4.50669 0.86654L5.03141 1.69506L5.58054 1.34727ZM4.11323 1.23058e-13L4.11323 -0.65L1.67359 -0.65L1.67359 5.00699e-14L1.67359 0.65L4.11323 0.65L4.11323 1.23058e-13ZM0 1.67359L-0.65 1.67359L-0.65 9.4837L0 9.4837L0.65 9.4837L0.65 1.67359L0 1.67359ZM11.3264 11.1573L11.3264 10.5073L1.67359 10.5073L1.67359 11.1573L1.67359 11.8073L11.3264 11.8073L11.3264 11.1573ZM0 9.4837L-0.65 9.4837C-0.65 10.767 0.390308 11.8073 1.67359 11.8073L1.67359 11.1573L1.67359 10.5073C1.10828 10.5073 0.65 10.049 0.65 9.4837L0 9.4837ZM1.67359 5.00699e-14L1.67359 -0.65C0.390307 -0.65 -0.65 0.390309 -0.65 1.67359L0 1.67359L0.65 1.67359C0.65 1.10828 1.10828 0.65 1.67359 0.65L1.67359 5.00699e-14ZM5.05582 0.518756L5.60495 0.170972C5.28121 -0.340193 4.71829 -0.65 4.11323 -0.65L4.11323 1.23058e-13L4.11323 0.65C4.27282 0.65 4.4213 0.731715 4.50669 0.86654L5.05582 0.518756ZM6.52313 1.86603L6.52313 1.21603C6.36354 1.21603 6.21507 1.13431 6.12968 0.999489L5.58054 1.34727L5.03141 1.69506C5.35515 2.20622 5.91808 2.51603 6.52313 2.51603L6.52313 1.86603ZM13 3.53962L13.65 3.53962C13.65 2.25634 12.6097 1.21603 11.3264 1.21603L11.3264 1.86603L11.3264 2.51603C11.8917 2.51603 12.35 2.97431 12.35 3.53962L13 3.53962ZM13 9.4837L12.35 9.4837C12.35 10.049 11.8917 10.5073 11.3264 10.5073L11.3264 11.1573L11.3264 11.8073C12.6097 11.8073 13.65 10.767 13.65 9.4837L13 9.4837Z' },
  ] },
  triangle: { vb: '0 0 14 14', paths: [
    { d: 'M4.25 2.82782L4.25 11.1722C4.25 11.6622 4.84243 11.9076 5.18891 11.5611L9.36109 7.38891C9.57588 7.17412 9.57588 6.82588 9.36109 6.61109L5.18891 2.43891C4.84243 2.09243 4.25 2.33782 4.25 2.82782Z' },
  ] },
  ellipsis: { vb: '0 0 16 16', paths: [
    { d: 'M4.55146 8.00001C4.55146 8.63513 4.03659 9.15001 3.40146 9.15001C2.76634 9.15001 2.25146 8.63513 2.25146 8.00001C2.25146 7.36488 2.76634 6.85001 3.40146 6.85001C4.03659 6.85001 4.55146 7.36488 4.55146 8.00001Z' },
    { d: 'M9.1476 8.00001C9.1476 8.63513 8.63273 9.15001 7.9976 9.15001C7.36248 9.15001 6.8476 8.63513 6.8476 8.00001C6.8476 7.36488 7.36248 6.85001 7.9976 6.85001C8.63273 6.85001 9.1476 7.36488 9.1476 8.00001Z' },
    { d: 'M13.7486 8.00001C13.7486 8.63513 13.2338 9.15001 12.5986 9.15001C11.9635 9.15001 11.4486 8.63513 11.4486 8.00001C11.4486 7.36488 11.9635 6.85001 12.5986 6.85001C13.2338 6.85001 13.7486 7.36488 13.7486 8.00001Z' },
  ] },
  plus: { vb: '0 0 16 16', paths: [
    { d: 'M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z' },
  ] },
  edit: { vb: '0 0 16 16', paths: [
    { d: 'M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z' },
  ] },
  trash: { vb: '0 0 16 16', paths: [
    { d: 'M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 13.9714 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z' },
  ] },
  branch: { vb: '0 0 16 16', paths: [
    { fr: 'evenodd', cr: 'evenodd', d: 'M13.0762 1.37207C14.0846 1.37228 14.9021 2.19077 14.9023 3.19922C14.9022 4.20772 14.0847 5.02518 13.0762 5.02539C12.2967 5.02539 11.6325 4.53691 11.3701 3.84961H4.35547C4.79397 4.26458 5.15861 4.7644 5.41699 5.33496L7.10645 9.06738C7.88526 10.7875 9.55104 11.9228 11.4189 12.0371C11.7085 11.4109 12.3411 10.9756 13.0762 10.9756C14.0843 10.9759 14.9023 11.7936 14.9023 12.8018C14.9023 13.81 14.0843 14.6277 13.0762 14.6279C12.2534 14.6279 11.5574 14.0832 11.3291 13.335C8.9868 13.1879 6.89981 11.7612 5.92285 9.60352L4.23242 5.87109C3.67503 4.64033 2.44878 3.84961 1.09766 3.84961V2.54883C1.10665 2.54883 1.11601 2.54975 1.125 2.5498L11.3701 2.54883C11.6326 1.86151 12.2969 1.37207 13.0762 1.37207ZM13.0762 12.2764C12.7858 12.2764 12.5508 12.5114 12.5508 12.8018C12.5508 13.0921 12.7858 13.3281 13.0762 13.3281C13.3664 13.3279 13.6025 13.092 13.6025 12.8018C13.6025 12.5115 13.3664 12.2766 13.0762 12.2764ZM13.0762 2.67285C12.7855 2.67285 12.55 2.90861 12.5498 3.19922C12.5499 3.48987 12.7855 3.72559 13.0762 3.72559C13.3667 3.72538 13.6024 3.48975 13.6025 3.19922C13.6023 2.90874 13.3666 2.67306 13.0762 2.67285Z' },
  ] },
  archive: { vb: '0 0 20 20', paths: [
    { fr: 'evenodd', cr: 'evenodd', d: 'M15.8659 2.05975C17.2603 2.05995 18.3913 3.19096 18.3914 4.58527V5.4874C18.3914 6.02747 18.2192 6.52672 17.9303 6.93735C17.9336 6.96524 17.9388 6.99318 17.9388 7.02195V12.8884C17.9388 13.6345 17.9395 14.2379 17.8996 14.7254C17.8642 15.1593 17.7936 15.5499 17.6373 15.9141L17.5654 16.0685C17.278 16.6328 16.8405 17.1046 16.3038 17.434L16.0679 17.5661C15.66 17.7739 15.2196 17.8598 14.7237 17.9003C14.2362 17.9401 13.6327 17.9405 12.8867 17.9405H7.11122C6.36511 17.9405 5.76171 17.9401 5.27418 17.9003C4.84051 17.8649 4.44949 17.7952 4.08545 17.6391L3.93104 17.5661C3.36673 17.2785 2.89392 16.8414 2.56465 16.3044L2.43245 16.0685C2.22473 15.6608 2.13878 15.2211 2.09825 14.7254C2.05841 14.2379 2.05912 13.6345 2.05912 12.8884V7.02195C2.05912 6.99284 2.06422 6.96449 2.06758 6.93629C1.77931 6.52592 1.60858 6.02687 1.60858 5.4874V4.58527C1.60876 3.19084 2.73962 2.05975 4.1341 2.05975H15.8659ZM16.4984 7.92936C16.296 7.98169 16.0847 8.01288 15.8659 8.01291H4.1341C3.91478 8.01291 3.70246 7.98194 3.49955 7.92936V12.8884C3.49955 13.6582 3.50053 14.1927 3.53445 14.608C3.56769 15.0146 3.62923 15.244 3.71635 15.415L3.7925 15.5514C3.98339 15.8627 4.25749 16.1165 4.58464 16.2833L4.72529 16.3435C4.88095 16.3993 5.08638 16.4402 5.39158 16.4651C5.80685 16.4991 6.34138 16.5001 7.11122 16.5001H12.8867C13.6564 16.5001 14.1911 16.499 14.6063 16.4651C15.0128 16.432 15.2423 16.3703 15.4133 16.2833L15.5508 16.2061C15.8618 16.0152 16.116 15.7419 16.2827 15.415L16.3429 15.2732C16.3985 15.1177 16.4396 14.9128 16.4645 14.608C16.4985 14.1927 16.4984 13.6583 16.4984 12.8884V7.92936ZM4.1341 3.50019C3.53511 3.50019 3.0492 3.98631 3.04902 4.58527V5.4874C3.04902 6.08649 3.535 6.57248 4.1341 6.57248H15.8659C16.4648 6.57228 16.951 6.08638 16.951 5.4874V4.58527C16.9509 3.98644 16.4647 3.50038 15.8659 3.50019H4.1341Z' },
  ] },
}

const MATRIX_CELLS = [[0, 0], [4, 0], [8, 0], [8, 4], [8, 8], [4, 8], [0, 8], [0, 4]]

const icon = (name, size) => {
  const def = ICONS[name]
  if (!def) return null
  return React.createElement('svg', { width: size, height: size, viewBox: def.vb, fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    def.paths.map((p, i) => React.createElement('path', { key: i, d: p.d, fill: 'currentColor', opacity: p.opacity ? p.opacity : undefined, transform: p.t ? p.t : undefined, fillRule: p.fr ? p.fr : undefined, clipRule: p.cr ? p.cr : undefined })),
  )
}

const stateDot = (state) => state === 'ongoing'
  ? React.createElement('svg', { width: 10, height: 10, viewBox: '0 0 10 10', shapeRendering: 'crispEdges', className: 'wsmgr-sdot ongoing', 'aria-hidden': 'true' },
      MATRIX_CELLS.map((c, i) => React.createElement('rect', { key: i, x: c[0], y: c[1], width: 2, height: 2, className: 'wsmgr-mcell', style: { animationDelay: ((i - MATRIX_CELLS.length) * 125) + 'ms' } })),
    )
  : React.createElement('span', { className: 'wsmgr-sdot ' + state, 'aria-hidden': 'true' })

const relativeTime = (updatedAt, now) => {
  const MIN = 6e4, HOUR = 36e5, DAY = 864e5
  const diff = Math.max(0, now - updatedAt)
  if (diff < MIN) return { unit: 'now', n: 0 }
  if (diff < HOUR) return { unit: 'minutes', n: Math.floor(diff / MIN) }
  if (diff < DAY) return { unit: 'hours', n: Math.floor(diff / HOUR) }
  if (diff < 30 * DAY) return { unit: 'days', n: Math.floor(diff / DAY) }
  if (diff < 365 * DAY) return { unit: 'months', n: Math.floor(diff / (30 * DAY)) }
  return { unit: 'years', n: Math.floor(diff / (365 * DAY)) }
}
const timeText = (updatedAt, now) => {
  const r = relativeTime(updatedAt, now)
  if (r.unit === 'now') return '刚刚'
  return r.n + { minutes: ' 分钟前', hours: ' 小时前', days: ' 天前', months: ' 个月前', years: ' 年前' }[r.unit]
}
const createdLabel = (createdAt) => {
  if (!createdAt) return ''
  const d = new Date(createdAt)
  const p2 = (v) => String(v).padStart(2, '0')
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + p2(d.getHours()) + ':' + p2(d.getMinutes())
}

    exports.name = "ostar-dsh-left-sidebar"
    exports.inject = ["slots", "workspaces", "sessions"]

    exports.apply = function apply(ctx) {
  // web2 运行时不再注入全局 styles，按官方插件模式自行注入 <style>（data-plugin 戳记由模块系统认领）
  const styles = {
    insert(css) {
      if (typeof document === 'undefined') return
      const tagId = 'ostar-dsh-left-sidebar/client.css'
      if (document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']')) return
      const tag = document.createElement('style')
      tag.dataset.plugin = 'ostar-dsh-left-sidebar'
      tag.dataset.pluginCss = tagId
      tag.textContent = css
      document.head.appendChild(tag)
    }
  }

  const slots = ctx.get('slots')
  if (slots === undefined) return

  const CSS = `
.wsmgr-root{display:flex;flex-direction:column;flex:1;min-height:0}
.wsmgr-header{box-sizing:border-box;height:36px;display:flex;justify-content:flex-end;align-items:center;gap:4px;margin-bottom:4px;padding-left:4px;position:relative;overflow:visible}
.wsmgr-hlabel{white-space:nowrap;flex:none;line-height:20px;max-width:45%;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-tertiary,#8a8a8a)}
.wsmgr-searchSlot{box-sizing:border-box;min-width:0;max-width:28px;flex:1;align-items:center;margin-left:auto;padding-left:0;display:flex;transition:max-width .18s}
.wsmgr-searchSlot.open{max-width:100%}
.wsmgr-search{display:flex;align-items:center;gap:0;width:100%;height:28px;border-radius:50%;padding:0;margin:0;overflow:hidden;cursor:text;transition:width .18s,padding .18s,border-color .18s,background-color .18s}
.wsmgr-search.open{border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.5));border-radius:10px;padding:0 4px 0 0}
.wsmgr-search-input{opacity:0;pointer-events:none;width:0;min-width:0;flex:1;background:transparent;border:none;outline:none;color:var(--dsw-alias-label-primary,#e8e8e8);font-size:13px;line-height:18px;transition:opacity .12s}
.wsmgr-search.open .wsmgr-search-input{opacity:1;pointer-events:auto;width:auto}
.wsmgr-search-input::placeholder{color:var(--dsw-alias-label-tertiary,#8a8a8a)}
.wsmgr-ibtn{cursor:pointer;width:28px;height:28px;color:var(--dsw-alias-label-secondary,#9a9a9a);background:transparent;border:none;border-radius:50%;flex:none;display:inline-flex;justify-content:center;align-items:center;padding:0;margin:0}
.wsmgr-ibtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.14))}
.wsmgr-ibtn.on{color:var(--dsw-alias-brand-primary,#4c6ef5)}
.wsmgr-hactions{opacity:1;display:flex;align-items:center;gap:2px;flex:none;overflow:visible}
.wsmgr-menu{position:absolute;top:34px;right:0;z-index:1100;box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:0;border:1px solid var(--dsw-alias-border-inverted,rgba(128,128,128,.5));border-radius:12px;background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-3,#242428));box-shadow:var(--dsw-shadow-lv3,0 8px 24px rgba(0,0,0,.4));min-width:218px;max-width:360px}
.wsmgr-menu-sec{margin-bottom:4px}
.wsmgr-menu-title{font-size:12px;line-height:16px;color:var(--dsw-alias-label-tertiary,#8a8a8a);padding:4px 7px}
.wsmgr-menu-opt{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;padding:3px 7px;border:none;border-radius:5px;background:transparent;cursor:pointer;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary,#e8e8e8);text-align:left;box-sizing:border-box}
.wsmgr-menu-opt:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}
.wsmgr-menu-opt.on{color:var(--dsw-alias-brand-primary,#4c6ef5)}
.wsmgr-menu-opt.danger{color:var(--dsw-alias-state-error-primary,#e5484d)}
.wsmgr-menu-opt.danger:hover{background:var(--dsw-alias-interactive-bg-hover-danger,rgba(229,72,77,.12))}
.wsmgr-toolbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:6px 8px;margin-bottom:4px;border:1px solid var(--dsw-alias-border-l1,rgba(128,128,128,.3));border-radius:10px;background:rgba(128,128,128,.05)}
.wsmgr-confirm{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 8px;margin-bottom:4px;border:1px solid rgba(245,165,36,.5);border-radius:10px;background:rgba(245,165,36,.08);font-size:12px;color:var(--dsw-alias-label-primary,#e8e8e8)}
.wsmgr-tbtn{background:transparent;border:1px solid var(--dsw-alias-border-l1,rgba(128,128,128,.4));color:var(--dsw-alias-label-primary,#e8e8e8);border-radius:6px;padding:2px 8px;font-size:12px;cursor:pointer;line-height:1.6}
.wsmgr-tbtn:hover{background:rgba(128,128,128,.14)}
.wsmgr-tbtn:disabled{opacity:.45;cursor:default}
.wsmgr-tbtn.danger{color:var(--dsw-alias-state-error-primary,#e5484d);border-color:currentColor}
.wsmgr-tbtn.danger:not(:disabled):hover{background:rgba(229,72,77,.12)}
.wsmgr-tcount{font-size:12px;color:var(--dsw-alias-label-secondary,#9a9a9a)}
.wsmgr-tspr{flex:1}
.wsmgr-tcheck{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--dsw-alias-label-secondary,#9a9a9a);cursor:pointer}
.wsmgr-list{flex:1;min-height:0;overflow-y:auto;padding-bottom:12px}
.wsmgr-projectRow{cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary,#e8e8e8);border-radius:8px;align-items:center;gap:6px;padding:0 8px;display:flex;box-sizing:border-box;height:34px;position:relative}
.wsmgr-projectRow:hover,.wsmgr-projectRow.menuOpen{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}
.wsmgr-slot{width:16px;height:20px;color:var(--dsw-alias-label-tertiary,#8a8a8a);flex:none;justify-content:center;align-items:center;display:inline-flex}
.wsmgr-folderActive{color:var(--dsw-alias-state-business-primary,#3b82f6)}
.wsmgr-chevron{color:var(--dsw-alias-label-caption,#9a9a9a);display:none}
.wsmgr-projectRow:hover .wsmgr-chevron{display:inline-flex}
.wsmgr-projectRow:hover .wsmgr-folder{display:none}
.wsmgr-arrow{transition:transform .15s}
.wsmgr-arrowOpen{transform:rotate(90deg)}
.wsmgr-projectText{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}
.wsmgr-title{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:14px;line-height:20px;overflow:hidden}
.wsmgr-renameInput{border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.5));background:var(--dsw-alias-bg-layer-1,#2a2a2e);min-width:0;color:inherit;border-radius:4px;outline:none;padding:0 2px;font-size:14px;line-height:20px;flex:1}
.wsmgr-sessionRow{cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary,#e8e8e8);border-radius:8px;align-items:center;gap:0;padding:0 8px;display:flex;box-sizing:border-box;height:32px;position:relative;animation:wsmgr-in .15s}
@keyframes wsmgr-in{0%{opacity:0}}
.wsmgr-sessionRow:hover,.wsmgr-sessionRow.selected,.wsmgr-sessionRow.menuOpen{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}
.wsmgr-sessionRow .wsmgr-title{margin:0 6px 0 4px;flex:1}
.wsmgr-sdot{position:relative;display:inline-block;width:10px;height:10px;flex:none;color:var(--dsw-alias-state-success-primary,#2fbf71)}
.wsmgr-sdot:before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;border-radius:50%;background:currentColor;opacity:.1}
.wsmgr-sdot:after{content:"";position:absolute;top:20%;right:20%;bottom:20%;left:20%;border-radius:50%;background:currentColor}
.wsmgr-sdot.warning{color:var(--dsw-alias-state-warn-primary,#f5a524)}
.wsmgr-sdot.ongoing{color:var(--dsw-static-deepseek-450,#4d6bfe)}
.wsmgr-sdot.ongoing:before,.wsmgr-sdot.ongoing:after{display:none}
.wsmgr-mcell{fill:currentColor;opacity:.15;animation:wsmgr-chase 1s infinite}
@keyframes wsmgr-chase{0%,12.4%{opacity:1}}
.wsmgr-time{color:var(--dsw-alias-label-tertiary,#8a8a8a);flex:none;font-size:12px;line-height:20px}
.wsmgr-rowActions{flex:none;align-items:center;gap:12px;display:none}
.wsmgr-projectRow:hover .wsmgr-rowActions,.wsmgr-sessionRow:hover .wsmgr-rowActions,.wsmgr-projectRow.menuOpen .wsmgr-rowActions,.wsmgr-sessionRow.menuOpen .wsmgr-rowActions{display:inline-flex}
.wsmgr-sessionRow:hover .wsmgr-time,.wsmgr-sessionRow.menuOpen .wsmgr-time{display:none}
.wsmgr-iconBtn{cursor:pointer;width:16px;height:16px;color:var(--dsw-alias-label-tertiary,#8a8a8a);background:transparent;border:none;border-radius:4px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}
.wsmgr-iconBtn:hover{color:var(--dsw-alias-label-primary,#e8e8e8)}
.wsmgr-check{flex:none;accent-color:var(--dsw-alias-brand-primary,#4c6ef5);margin:0;cursor:pointer;width:14px;height:14px}
.wsmgr-del{flex:none;background:transparent;border:none;color:var(--dsw-alias-state-error-primary,#e5484d);font-size:12px;cursor:pointer;padding:1px 5px;border-radius:4px;opacity:.85;line-height:16px}
.wsmgr-del:hover{opacity:1;background:rgba(229,72,77,.12)}
.wsmgr-menu-mask{position:fixed;inset:0;z-index:1050;background:transparent;pointer-events:auto}
.wsmgr-rowmenu{position:fixed;z-index:1100;box-sizing:border-box;padding:4px;display:flex;flex-direction:column;gap:0;border:1px solid var(--dsw-alias-border-inverted,rgba(128,128,128,.5));border-radius:12px;background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-3,#242428));box-shadow:var(--dsw-shadow-lv3,0 8px 24px rgba(0,0,0,.4));min-width:218px;max-width:360px}
.wsmgr-rowmenu-item{display:flex;align-items:center;gap:6px;width:100%;min-height:26px;padding:3px 7px;border:none;border-radius:5px;background:transparent;cursor:pointer;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary,#e8e8e8);text-align:left;box-sizing:border-box}
.wsmgr-rowmenu-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}
.wsmgr-rowmenu-item.danger{color:var(--dsw-alias-state-error-primary,#e5484d)}
.wsmgr-rowmenu-item.danger:hover{background:var(--dsw-alias-interactive-bg-hover-danger,rgba(229,72,77,.12))}
.wsmgr-rowmenu-item svg{flex:none;width:16px;height:16px}
.wsmgr-err{color:var(--dsw-alias-state-error-primary,#e5484d);padding:8px 12px;font-size:12px}
.wsmgr-empty{padding:20px 12px;text-align:center;color:var(--dsw-alias-label-tertiary,#8a8a8a);font-size:13px}
.wsmgr-tip{position:fixed;z-index:100;width:max-content;max-width:50vw;padding:3px 7px;border-radius:8px;background:var(--dsw-alias-tooltip-bg,#2C2C2E);color:var(--dsw-static-neutral-bluish-00,#f5f5f6);font-size:13px;line-height:20px;white-space:pre-line;overflow-wrap:break-word;pointer-events:none;animation:wsmgr-tip-in .15s var(--ds-ease-in-out,ease-in-out)}
@keyframes wsmgr-tip-in{from{opacity:0}}
.wsmgr-hc{position:fixed;z-index:100;box-sizing:border-box;width:244px;padding:12px 16px;border-radius:12px;background:#2C2C2E;box-shadow:var(--dsw-shadow-lv3,0 8px 24px rgba(0,0,0,.4));pointer-events:none;display:flex;flex-direction:column;gap:8px}
.wsmgr-hc-title{color:#fff;font-size:14px;line-height:20px;overflow-wrap:break-word}
.wsmgr-hc-path{color:#cfd3d6;font-size:12px;line-height:16px;word-break:break-all}
.wsmgr-hc-time{color:#cfd3d6;font-size:12px;line-height:16px}
.wsmgr-hc-status{color:#adb2b8;font-size:12px;line-height:20px;display:flex;align-items:center;gap:8px}
.wsmgr-root.rail .wsmgr-ibtn{width:36px;height:36px}
.wsmgr-root.rail .wsmgr-header{justify-content:flex-start;gap:0;margin-bottom:12px;padding-left:0}
.wsmgr-root.rail .wsmgr-list{display:none}
`
  styles.insert(CSS)

  function TButton(props) {
    const [tip, setTip] = React.useState(null)
    const btnRef = React.useState({ current: null })[0]
    const timerRef = React.useState({ current: null })[0]
    const show = () => {
      const r = btnRef.current ? btnRef.current.getBoundingClientRect() : null
      if (!r) return
      const iw = typeof window !== 'undefined' ? window.innerWidth : 1200
      const ih = typeof window !== 'undefined' ? window.innerHeight : 800
      let left = r.left + r.width / 2
      // 与官方 Tooltip 一致：优先显示在按钮下方 8px（side: bottom），
      // 下方放不下且上方有空间时自动翻转到上方 8px（官方 EDGE_MARGIN 12）。
      let top = r.bottom + 8
      if (top + 28 > ih - 12) top = r.top - 8
      if (left < 40) left = 40
      if (left > iw - 40) left = iw - 40
      setTip({ label: props.label, left: left, top: top })
    }
    const onEnter = () => {
      if (props.noTip) return
      if (timerRef.current !== null) return
      const delay = props.delay != null ? props.delay : 0
      if (delay <= 0) {
        show()
        return
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        show()
      }, delay)
    }
    const onLeave = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setTip(null)
    }
    return React.createElement('span', { style: { display: 'inline-flex', flex: 'none', alignItems: 'center', justifyContent: 'center' }, onMouseEnter: onEnter, onMouseLeave: onLeave },
      React.createElement('button', {
        type: 'button',
        className: props.cls || 'wsmgr-ibtn',
        'aria-label': props.label,
        onClick: props.onClick,
        disabled: props.disabled,
        ref: btnRef,
      }, icon(props.iconName, props.size)),
      tip ? React.createElement('span', { className: 'wsmgr-tip', style: { left: tip.left, top: tip.top, transform: 'translateX(-50%)' } }, tip.label) : null,
    )
  }

  function WorkspaceBrowser(props) {
    const wide = Boolean(props && props.wide)
    const expandSidebar = props && props.expandSidebar ? props.expandSidebar : () => {}
    const useSessions = props && props.useSessions
    const useWorkspaces = props && props.useWorkspaces
    if (!useSessions || !useWorkspaces) return null

    const workspaces = useWorkspaces((s) => s.items)
    const archived = useWorkspaces((s) => s.archivedSessionIds)
    const ids = useSessions((s) => s.ids)
    const byId = useSessions((s) => s.byId)
    const current = useSessions((s) => s.current)

    const [groupBy, setGroupBy] = React.useState('workspace')
    const [orderBy, setOrderBy] = React.useState('manual')
    const [expanded, setExpanded] = React.useState(() => new Set())
    const [manage, setManage] = React.useState(false)
    const [selWs, setSelWs] = React.useState(() => new Set())
    const [selSes, setSelSes] = React.useState(() => new Set())
    const [withSessions, setWithSessions] = React.useState(true)
    const [confirming, setConfirming] = React.useState(null)
    const [busy, setBusy] = React.useState(false)
    const [err, setErr] = React.useState(null)
    const [query, setQuery] = React.useState('')
    const [searchOpen, setSearchOpen] = React.useState(false)
    const [remote, setRemote] = React.useState([])
    const [menuOpen, setMenuOpen] = React.useState(false)
    const [rowMenu, setRowMenu] = React.useState(null)
    const [renaming, setRenaming] = React.useState(null)
    const [hc, setHc] = React.useState(null)
    const now = Date.now()

    const wsSvc = () => ctx.get('workspaces')
    const sesSvc = () => ctx.get('sessions')

    React.useEffect(() => {
      setExpanded((prev) => {
        const next = new Set(prev)
        let changed = false
        for (const w of workspaces) {
          if (!next.has(w.workspaceId)) { next.add(w.workspaceId); changed = true }
        }
        if (!next.has('')) { next.add(''); changed = true }
        return changed ? next : prev
      })
    }, [workspaces])

    const q = query.trim().toLowerCase()

    React.useEffect(() => {
      if (q === '') { setRemote([]); return }
      const ctrl = new AbortController()
      const svc = sesSvc()
      if (svc) {
        svc.search(query.trim(), ctrl.signal).then((res) => {
          if (res && res.ok && res.value) setRemote(res.value.items || [])
        }).catch(() => {})
      }
      return () => ctrl.abort()
    }, [q])

    const archivedSet = new Set(archived)
    const visible = (s) => s.origin !== 'subagent' && !archivedSet.has(s.id) && (!s.blank || s.id === current)

    const groups = []
    const accounted = new Set()
    for (const w of workspaces) {
      const members = []
      for (const id of w.sessionIds) {
        const s = byId[id]
        if (s === undefined) continue
        accounted.add(id)
        if (!visible(s)) continue
        members.push(s)
      }
      if (orderBy === 'updated') members.sort(byRecency)
      groups.push({ key: w.workspaceId, label: w.title, path: w.path, count: members.length, members, createdAt: w.createdAt })
    }
    const stray = []
    for (const id of ids) {
      const s = byId[id]
      if (s !== undefined && !accounted.has(id) && visible(s)) stray.push(s)
    }
    if (stray.length > 0) {
      if (orderBy === 'updated') stray.sort(byRecency)
      groups.push({ key: '', label: '未分组', path: null, count: stray.length, members: stray })
    }

    const flatRows = []
    for (const id of ids) {
      const s = byId[id]
      if (s !== undefined && visible(s)) flatRows.push(s)
    }
    flatRows.sort(byRecency)

    const localHits = []
    for (const id of ids) {
      const s = byId[id]
      if (s !== undefined && visible(s) && (s.displayTitle || '').toLowerCase().includes(q)) localHits.push(s)
    }
    localHits.sort(byRecency)
    const remoteIds = new Set(localHits.map((s) => s.id))

    const statusList = (s) => {
      if (s.pendingInteraction === 'approval') return [{ state: 'warning', label: '等待审批' }]
      if (s.pendingInteraction === 'plan-review') return [{ state: 'warning', label: '计划待审' }]
      if (s.pendingInteraction === 'question') return [{ state: 'warning', label: '等待回答' }]
      if (s.running) return [{ state: 'ongoing', label: '进行中' }]
      if (s.completed) return [{ state: 'done', label: '已完成' }]
      return [{ state: 'done', label: '空闲' }]
    }

    const toggleWs = (id) => setSelWs((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
    const toggleSes = (id) => setSelSes((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
    const toggleGroup = (key) => setExpanded((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })
    const expandAll = () => setExpanded(new Set(groups.map((g) => g.key)))
    const collapseAll = () => setExpanded(new Set())
    const selectAll = () => {
      setSelWs(new Set(groups.map((g) => g.key).filter((k) => k !== '')))
      setSelSes(new Set((groupBy === 'flat' ? flatRows : groups.reduce((acc, g) => acc.concat(g.members), [])).map((s) => s.id)))
    }
    const clearSel = () => { setSelWs(new Set()); setSelSes(new Set()) }

    const open = (id) => { const svc = sesSvc(); if (svc) svc.open(id) }

    const addWorkspace = async () => {
      const svc = wsSvc()
      if (!svc) return
      try {
        const path = await svc.pickDirectory()
        if (path) await svc.create({ path })
      } catch (e) {
        setErr(String(e && e.message ? e.message : e))
      }
    }

    const startSession = (wid) => { const svc = wsSvc(); if (svc) svc.startSession(wid) }

    const doDelete = async () => {
      if (!confirming) return
      const svc = wsSvc()
      if (!svc) { setErr('workspaces 服务不可用'); setConfirming(null); return }
      setBusy(true)
      setErr(null)
      try {
        const wsIds = confirming.wsIds
        const sesIds = new Set(confirming.sesIds)
        if (withSessions) {
          for (const w of workspaces) {
            if (wsIds.includes(w.workspaceId)) {
              for (const sid of w.sessionIds) sesIds.add(sid)
            }
          }
        }
        for (const sid of sesIds) await svc.archiveSession(sid)
        for (const wid of wsIds) await svc.delete(wid)
        setSelWs((prev) => new Set(Array.from(prev).filter((id) => !wsIds.includes(id))))
        setSelSes((prev) => new Set(Array.from(prev).filter((id) => !sesIds.has(id))))
        setConfirming(null)
      } catch (e) {
        setErr(String(e && e.message ? e.message : e))
      } finally {
        setBusy(false)
      }
    }

    const sesInWs = new Set()
    if (withSessions) {
      for (const w of workspaces) {
        if (selWs.has(w.workspaceId)) for (const sid of w.sessionIds) sesInWs.add(sid)
      }
    }
    const effectiveSes = new Set(selSes)
    for (const sid of sesInWs) effectiveSes.add(sid)

    const commitRename = async () => {
      if (!renaming) return
      const value = renaming.value.trim()
      setRenaming(null)
      if (!value) return
      try {
        if (renaming.kind === 'ws') {
          await wsSvc().rename(renaming.id, value)
        } else {
          const b = sesSvc().binding(renaming.id)
          if (!b || !b.session) throw new Error('会话不可用')
          const r = await b.session.rename(value)
          if (!r.ok) throw new Error(r.error && r.error.message ? r.error.message : String(r.error))
        }
      } catch (e) {
        setErr(String(e && e.message ? e.message : e))
      }
    }

    const forkSession = (id) => {
      sesSvc().fork({ sessionId: id, increaseTitle: true }).then((childId) => open(childId)).catch((e) => setErr(String(e && e.message ? e.message : e)))
    }

    const archiveOne = (id) => {
      wsSvc().archiveSession(id).catch((e) => setErr(String(e && e.message ? e.message : e)))
    }

    const deleteOneWs = (id) => {
      wsSvc().delete(id).catch((e) => setErr(String(e && e.message ? e.message : e)))
    }

    const sessionMenuItems = [
      { id: 'rename', label: '重命名', icon: 'edit' },
      { id: 'fork', label: '分叉会话', icon: 'branch' },
      { id: 'archive', label: '归档会话', icon: 'archive' },
      { id: 'delete', label: '删除会话', icon: 'trash', danger: true },
    ]
    const workspaceMenuItems = [
      { id: 'rename', label: '重命名', icon: 'edit' },
      { id: 'delete', label: '删除工作区', icon: 'trash', danger: true },
    ]

    const closeOverlays = () => { setRowMenu(null); setMenuOpen(false) }

    const openRowMenu = (kind, id, title, items) => (e) => {
      e.stopPropagation()
      setHc(null)
      if (rowMenu && rowMenu.id === id) { setRowMenu(null); return }
      const r = e.currentTarget.getBoundingClientRect()
      setRowMenu({ kind: kind, id: id, title: title, items: items, rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right } })
    }

    let rowMenuEl = null
    if (rowMenu) {
      const iw = typeof window !== 'undefined' ? window.innerWidth : 1200
      const ih = typeof window !== 'undefined' ? window.innerHeight : 800
      let left = rowMenu.rect.right - 150 + 4
      if (left < 8) left = 8
      let top = rowMenu.rect.bottom + 4
      if (top + 170 > ih - 8) top = Math.max(8, rowMenu.rect.top - 170)
      rowMenuEl = React.createElement('div', null,
        React.createElement('div', { className: 'wsmgr-menu-mask', onClick: closeOverlays }),
        React.createElement('div', { className: 'wsmgr-rowmenu', style: { left: left, top: top }, onClick: (e) => e.stopPropagation() },
          rowMenu.items.map((item) => React.createElement('div', {
            key: item.id,
            className: 'wsmgr-rowmenu-item' + (item.danger ? ' danger' : ''),
            onClick: () => {
              setRowMenu(null)
              if (item.id === 'rename') setRenaming({ kind: rowMenu.kind, id: rowMenu.id, value: rowMenu.title })
              else if (item.id === 'delete') {
                if (rowMenu.kind === 'ws') deleteOneWs(rowMenu.id)
                else setConfirming({ wsIds: [], sesIds: [rowMenu.id] })
              }
              else if (item.id === 'fork') forkSession(rowMenu.id)
              else if (item.id === 'archive') archiveOne(rowMenu.id)
            },
          }, icon(item.icon, 16), React.createElement('span', null, item.label))),
        ),
      )
    }

    const sessionRow = (m) => {
      const isRenaming = renaming && renaming.kind === 'ses' && renaming.id === m.id
      const st = statusList(m)[0]
      return React.createElement('div', {
        key: m.id,
        className: 'wsmgr-sessionRow' + (m.id === current ? ' selected' : '') + (rowMenu && rowMenu.id === m.id ? ' menuOpen' : ''),
        onClick: () => open(m.id),
        onMouseEnter: (e) => { if (rowMenu && rowMenu.id === m.id) return; const r = e.currentTarget.getBoundingClientRect(); setHc({ kind: 'ses', id: m.id, rect: { top: r.top, right: r.right } }) },
        onMouseLeave: () => setHc((prev) => prev && prev.id === m.id && prev.kind === 'ses' ? null : prev),
      },
        manage ? React.createElement('input', { type: 'checkbox', className: 'wsmgr-check', checked: selSes.has(m.id), onChange: () => toggleSes(m.id), onClick: (e) => e.stopPropagation() }) : null,
        React.createElement('span', { className: 'wsmgr-slot' }, stateDot(st.state)),
        isRenaming
          ? React.createElement('input', { className: 'wsmgr-renameInput', value: renaming.value, autoFocus: true, onChange: (e) => setRenaming({ kind: 'ses', id: m.id, value: e.target.value }), onKeyDown: (e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null) }, onClick: (e) => e.stopPropagation() })
          : React.createElement('span', { className: 'wsmgr-title' }, m.blank ? '新会话' : m.displayTitle),
        !m.blank ? React.createElement('span', { className: 'wsmgr-time' }, timeText(m.updatedAt, now)) : null,
        !m.blank ? React.createElement('span', { className: 'wsmgr-rowActions' },
          React.createElement(TButton, { iconName: 'ellipsis', size: 16, label: '会话操作', noTip: true, cls: 'wsmgr-iconBtn', onClick: openRowMenu('ses', m.id, m.displayTitle, sessionMenuItems) }),
          manage ? React.createElement('button', { type: 'button', className: 'wsmgr-del', title: '删除此会话', onClick: (e) => { e.stopPropagation(); setConfirming({ wsIds: [], sesIds: [m.id] }) }, disabled: busy }, '删除') : null,
        ) : null,
      )
    }

    const projectRow = (g) => {
      const isExpanded = expanded.has(g.key)
      const containsCurrent = g.key !== '' && g.members.some((m) => m.id === current)
      const isRenaming = renaming && renaming.kind === 'ws' && renaming.id === g.key
      const isReal = g.key !== ''
      return React.createElement('div', { key: g.key },
        React.createElement('div', {
          className: 'wsmgr-projectRow' + (rowMenu && rowMenu.id === g.key ? ' menuOpen' : ''),
          onClick: () => toggleGroup(g.key),
          onMouseEnter: (e) => { if (rowMenu && rowMenu.id === g.key) return; const r = e.currentTarget.getBoundingClientRect(); setHc({ kind: 'ws', id: g.key, rect: { top: r.top, right: r.right } }) },
          onMouseLeave: () => setHc((prev) => prev && prev.id === g.key && prev.kind === 'ws' ? null : prev),
        },
          manage && isReal ? React.createElement('input', { type: 'checkbox', className: 'wsmgr-check', checked: selWs.has(g.key), onChange: () => toggleWs(g.key), onClick: (e) => e.stopPropagation() }) : null,
          React.createElement('span', { className: 'wsmgr-slot' + (isExpanded && containsCurrent ? ' wsmgr-folderActive' : '') + (isExpanded ? '' : ' wsmgr-folder') },
            isExpanded ? icon('folderOpen', 16) : icon('folderClose', 16),
          ),
          React.createElement('span', { className: 'wsmgr-slot wsmgr-chevron' },
            React.createElement('span', { className: 'wsmgr-arrow' + (isExpanded ? ' wsmgr-arrowOpen' : '') }, icon('triangle', 14)),
          ),
          isRenaming
            ? React.createElement('input', { className: 'wsmgr-renameInput', value: renaming.value, autoFocus: true, onChange: (e) => setRenaming({ kind: 'ws', id: g.key, value: e.target.value }), onKeyDown: (e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(null) }, onClick: (e) => e.stopPropagation() })
            : React.createElement('span', { className: 'wsmgr-projectText' },
                React.createElement('span', { className: 'wsmgr-title' }, g.label),
              ),
          React.createElement('span', { className: 'wsmgr-rowActions' },
            isReal ? React.createElement(TButton, { iconName: 'ellipsis', size: 16, label: '工作区操作', noTip: true, cls: 'wsmgr-iconBtn', onClick: openRowMenu('ws', g.key, g.label, workspaceMenuItems) }) : null,
            React.createElement(TButton, { iconName: 'plus', size: 16, label: '新建会话', noTip: true, cls: 'wsmgr-iconBtn', onClick: (e) => { e.stopPropagation(); if (isReal) startSession(g.key) } }),
            manage && isReal ? React.createElement('button', { type: 'button', className: 'wsmgr-del', title: '删除此工作区', onClick: (e) => { e.stopPropagation(); setConfirming({ wsIds: [g.key], sesIds: [] }) }, disabled: busy }, '删除') : null,
          ),
        ),
        isExpanded ? g.members.map(sessionRow) : null,
      )
    }

    const groupBlocks = groups.map(projectRow)
    const flatBlocks = flatRows.map((m) => sessionRow(m))

    const searchRows = []
    for (const s of localHits) {
      searchRows.push(React.createElement('div', { key: s.id, className: 'wsmgr-sessionRow', onClick: () => open(s.id), title: s.id },
        React.createElement('span', { className: 'wsmgr-slot' }, stateDot(statusList(s)[0].state)),
        React.createElement('span', { className: 'wsmgr-title' }, s.displayTitle),
      ))
    }
    for (const r of remote) {
      if (remoteIds.has(r.sessionId)) continue
      searchRows.push(React.createElement('div', { key: r.sessionId, className: 'wsmgr-sessionRow', onClick: () => open(r.sessionId), title: r.sessionId },
        React.createElement('span', { className: 'wsmgr-slot' }),
        React.createElement('span', { className: 'wsmgr-title' }, r.title || ('会话 ' + String(r.sessionId).slice(-8))),
        r.snippet ? React.createElement('span', { className: 'wsmgr-time', style: { marginLeft: 6 } }, r.snippet) : null,
      ))
    }

    let listBody
    if (q !== '') {
      listBody = searchRows.length > 0 ? searchRows : React.createElement('div', { className: 'wsmgr-empty' }, '无匹配结果')
    } else if (groups.length === 0) {
      listBody = React.createElement('div', { className: 'wsmgr-empty' }, '暂无会话')
    } else {
      listBody = groupBy === 'flat' ? flatBlocks : groupBlocks
    }

    let hcEl = null
    if (hc) {
      if (hc.kind === 'ws') {
        const w = workspaces.find((x) => x.workspaceId === hc.id)
        if (w) {
          hcEl = React.createElement('div', { className: 'wsmgr-hc', style: { left: hc.rect.right + 8, top: Math.min(hc.rect.top, (typeof window !== 'undefined' ? window.innerHeight : 800) - 260) } },
            React.createElement('div', { className: 'wsmgr-hc-title' }, w.title),
            React.createElement('div', { className: 'wsmgr-hc-path' }, w.path),
            React.createElement('div', { className: 'wsmgr-hc-time' }, '创建于 ' + createdLabel(w.createdAt)),
          )
        }
      } else {
        const s = byId[hc.id]
        if (s) {
          hcEl = React.createElement('div', { className: 'wsmgr-hc', style: { left: hc.rect.right + 8, top: Math.min(hc.rect.top, (typeof window !== 'undefined' ? window.innerHeight : 800) - 240) } },
            React.createElement('div', { className: 'wsmgr-hc-title' }, s.blank ? '新会话' : s.displayTitle),
            !s.blank ? React.createElement('div', { className: 'wsmgr-hc-time' }, timeText(s.updatedAt, now)) : null,
            statusList(s).map((st) => React.createElement('div', { key: st.label, className: 'wsmgr-hc-status' }, stateDot(st.state), React.createElement('span', null, st.label))),
          )
        }
      }
    }

    return React.createElement('div', { className: 'wsmgr-root' + (wide ? '' : ' rail') },
      React.createElement('div', { className: 'wsmgr-header' },
        wide ? React.createElement('span', { className: 'wsmgr-hlabel', style: searchOpen ? { opacity: 0, visibility: 'hidden', maxWidth: 0, marginRight: -4 } : {} }, groupBy === 'flat' ? '会话' : '工作区') : null,
        wide ? React.createElement('div', { className: 'wsmgr-searchSlot' + (searchOpen ? ' open' : '') },
          React.createElement('div', { className: 'wsmgr-search' + (searchOpen ? ' open' : ''), onClick: () => { setMenuOpen(false); setSearchOpen(true) } },
            React.createElement(TButton, { iconName: 'search', size: searchOpen ? 11 : 14, label: '搜索会话', delay: 500, cls: 'wsmgr-ibtn', onClick: (e) => { e.stopPropagation(); setMenuOpen(false); setSearchOpen(true) } }),
            React.createElement('input', { className: 'wsmgr-search-input', type: 'text', placeholder: '搜索会话…', value: query, autoFocus: searchOpen, onChange: (e) => setQuery(e.target.value), onKeyDown: (e) => { if (e.key === 'Escape') { setQuery(''); setSearchOpen(false) } } }),
            searchOpen ? React.createElement(TButton, { iconName: 'close', size: 14, label: '清除搜索', delay: 500, cls: 'wsmgr-ibtn', onClick: (e) => { e.stopPropagation(); setQuery(''); setSearchOpen(false) } }) : null,
          ),
        ) : React.createElement(TButton, { iconName: 'search', size: 18, label: '搜索会话', delay: 500, cls: 'wsmgr-ibtn', onClick: () => { setSearchOpen(true); expandSidebar() } }),
        React.createElement('div', { className: 'wsmgr-hactions', style: wide && searchOpen ? { opacity: 0, visibility: 'hidden', pointerEvents: 'none', maxWidth: 0 } : {} },
          wide ? React.createElement(TButton, { iconName: 'personal', size: 16, label: '视图选项', delay: 500, cls: 'wsmgr-ibtn' + (menuOpen ? ' on' : ''), onClick: () => setMenuOpen(!menuOpen) }) : null,
          wide ? React.createElement(TButton, { iconName: 'projectAdd', size: 16, label: '添加工作区', delay: 500, cls: 'wsmgr-ibtn', onClick: addWorkspace }) : null,
          wide ? React.createElement(TButton, { iconName: 'chevronDown', size: 14, label: '展开全部', delay: 500, cls: 'wsmgr-ibtn', onClick: expandAll }) : null,
          wide ? React.createElement(TButton, { iconName: 'chevronUp', size: 14, label: '折叠全部', delay: 500, cls: 'wsmgr-ibtn', onClick: collapseAll }) : null,
          React.createElement(TButton, { iconName: 'checklist', size: 14, label: manage ? '退出批量选中' : '批量选中', delay: 500, cls: 'wsmgr-ibtn' + (manage ? ' on' : ''), onClick: () => { if (!wide) { setManage(!manage); if (!manage) expandSidebar(); } else { setManage(!manage); setConfirming(null); setMenuOpen(false) } } }),
        ),
        menuOpen ? React.createElement('div', { className: 'wsmgr-menu', onClick: (e) => e.stopPropagation() },
          React.createElement('div', { className: 'wsmgr-menu-sec' },
            React.createElement('div', { className: 'wsmgr-menu-title' }, '分组方式'),
            React.createElement('div', { className: 'wsmgr-menu-opt' + (groupBy === 'workspace' ? ' on' : ''), onClick: () => { setGroupBy('workspace'); setMenuOpen(false) } }, '按工作区'),
            React.createElement('div', { className: 'wsmgr-menu-opt' + (groupBy === 'flat' ? ' on' : ''), onClick: () => { setGroupBy('flat'); setMenuOpen(false) } }, '单列表'),
          ),
          React.createElement('div', { className: 'wsmgr-menu-sec' },
            React.createElement('div', { className: 'wsmgr-menu-title' }, '排序方式'),
            React.createElement('div', { className: 'wsmgr-menu-opt' + (orderBy === 'manual' ? ' on' : ''), onClick: () => { setOrderBy('manual'); setMenuOpen(false) } }, '手动排序'),
            React.createElement('div', { className: 'wsmgr-menu-opt' + (orderBy === 'updated' ? ' on' : ''), onClick: () => { setOrderBy('updated'); setMenuOpen(false) } }, '最近更新'),
          ),
        ) : null,
      ),
      confirming ? React.createElement('div', { className: 'wsmgr-confirm' },
        React.createElement('span', null, '确认删除 ' + confirming.wsIds.length + ' 个工作区' + (withSessions && confirming.wsIds.length > 0 ? '(连同其会话)' : '') + (confirming.sesIds.length > 0 ? (confirming.wsIds.length > 0 ? '、' : '') + confirming.sesIds.length + ' 个会话' : '') + '?'),
        React.createElement('span', { className: 'wsmgr-tspr' }),
        React.createElement('button', { type: 'button', className: 'wsmgr-tbtn danger', disabled: busy, onClick: doDelete }, busy ? '删除中…' : '确认删除'),
        React.createElement('button', { type: 'button', className: 'wsmgr-tbtn', disabled: busy, onClick: () => setConfirming(null) }, '取消'),
      ) : manage ? React.createElement('div', { className: 'wsmgr-toolbar' },
        React.createElement('button', { type: 'button', className: 'wsmgr-tbtn', onClick: () => { setManage(false); clearSel() } }, '退出'),
        React.createElement('button', { type: 'button', className: 'wsmgr-tbtn', onClick: selectAll }, '全选'),
        React.createElement('button', { type: 'button', className: 'wsmgr-tbtn', onClick: clearSel, disabled: selWs.size === 0 && selSes.size === 0 }, '清空'),
        React.createElement('label', { className: 'wsmgr-tcheck' },
          React.createElement('input', { type: 'checkbox', checked: withSessions, onChange: (e) => setWithSessions(e.target.checked) }),
          React.createElement('span', null, '连同会话删除'),
        ),
        React.createElement('span', { className: 'wsmgr-tcount' }, '已选 ' + selWs.size + ' 个工作区 · ' + effectiveSes.size + ' 个会话'),
        React.createElement('span', { className: 'wsmgr-tspr' }),
        React.createElement('button', { type: 'button', className: 'wsmgr-tbtn danger', disabled: selWs.size === 0 && selSes.size === 0, onClick: () => setConfirming({ wsIds: Array.from(selWs), sesIds: Array.from(selSes) }) }, '删除选中'),
      ) : null,
      err ? React.createElement('div', { className: 'wsmgr-err' }, err) : null,
      React.createElement('div', { className: 'wsmgr-list' }, listBody),
      rowMenuEl,
      hcEl,
    )
  }

  slots.inject('sidebar.workspaces', () => slots.register(
    { name: 'sidebar.workspaces', priority: -100 },
    (props) => React.createElement(WorkspaceBrowser, props || {}),
  ))
}

    return module.exports
  },
})
