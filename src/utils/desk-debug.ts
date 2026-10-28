/**
 * 远程协助链路诊断日志
 *
 * 背景：主控端连接设备时提示「该设备不在线」，实际判定依据是
 * `GET /desk_user/find_receiver_by_uuid?uuid=xxx` 返回的 receiver 是否为空，
 * 而 receiver 只有在被控端通过 socket 的 billdDeskJoin 把设备代码登记到服务端后才有值。
 *
 * 完整链路：
 *   initDeskUser(create/login) → initWs 建立 socket → sendJoin 上报设备代码 → 服务端回 billdDeskJoined
 *
 * 排查时在控制台过滤 `[desk-debug]` 即可看到每一步的入参和结果，
 * 状态流转见 DeskJoinStateEnum（src/types/websocket.ts）。
 */

/** 打印一条诊断日志，统一带 [desk-debug] 前缀便于过滤 */
export function deskLog(step: string, payload?: Record<string, unknown>) {
  console.warn(`[desk-debug] ${step}`, payload ?? '');
}

/** 设备敏感信息脱敏，只保留「有没有值」，避免临时密码被写进日志/工单 */
export function maskDeskUser(uuid?: string, password?: string) {
  return {
    deskUserUuid: uuid || '(空)',
    deskUserPassword: password ? `已设置(长度${password.length})` : '(空)',
  };
}
