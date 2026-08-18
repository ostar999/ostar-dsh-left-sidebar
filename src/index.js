/**
 * ostar-dsh-left-sidebar —— Host 半区。
 *
 * 本插件是纯 Client 插件：全部业务（工作区/会话树渲染、批量删除、折叠展开）
 * 都在浏览器端完成，数据直接消费官方客户端服务（`workspaces` / `sessions`
 * 快照 hooks），删除走官方客户端服务路径（`workspaces.delete` /
 * `workspaces.archiveSession`），与产品自带 UI 完全一致。
 *
 * Host 半区保留为空的 apply：仅满足 Cordis 插件包的 Host 入口约定，
 * 不注册任何服务、事件或处理器。
 */
export const name = 'ostar-dsh-left-sidebar'

export function apply(ctx) {
  // 纯 Client 插件：Host 半区无需逻辑。
}
