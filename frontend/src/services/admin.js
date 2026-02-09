import apiClient from './api'

/**
 * 管理台 API 服务
 *
 * 提供管理台相关的 API 接口，包括用户管理、会议室管理、录制管理、操作日志等
 */

/**
 * 获取系统统计信息
 */
export const getStatistics = async () => {
  return apiClient.get('/v1/admin/statistics')
}

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从 1 开始）
 * @param {number} params.size - 每页数量
 * @param {string} params.keyword - 搜索关键词（用户名或邮箱）
 * @param {string} params.status - 用户状态（online/offline/all）
 * @param {string} params.role - 用户角色（admin/user/guest/all）
 */
export const getUsers = async (params) => {
  return apiClient.get('/v1/admin/users', { params })
}

/**
 * 获取用户详情
 * @param {number} userId - 用户 ID
 */
export const getUserDetail = async (userId) => {
  return apiClient.get(`/v1/admin/users/${userId}`)
}

/**
 * 强制用户下线
 * @param {number} userId - 用户 ID
 */
export const forceLogoutUser = async (userId) => {
  return apiClient.post(`/v1/admin/users/${userId}/logout`)
}

/**
 * 禁用用户
 * @param {number} userId - 用户 ID
 * @param {string} reason - 禁用原因
 */
export const disableUser = async (userId, reason) => {
  return apiClient.post(`/v1/admin/users/${userId}/disable`, { reason })
}

/**
 * 启用用户
 * @param {number} userId - 用户 ID
 */
export const enableUser = async (userId) => {
  return apiClient.post(`/v1/admin/users/${userId}/enable`)
}

/**
 * 删除用户
 * @param {number} userId - 用户 ID
 */
export const deleteUser = async (userId) => {
  return apiClient.delete(`/v1/admin/users/${userId}`)
}

/**
 * 获取会议室列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从 1 开始）
 * @param {number} params.size - 每页数量
 * @param {string} params.keyword - 搜索关键词（会议室名称或 ID）
 * @param {string} params.status - 会议室状态（active/inactive/all）
 */
export const getRooms = async (params) => {
  return apiClient.get('/v1/admin/rooms', { params })
}

/**
 * 获取会议室详情
 * @param {string} roomId - 会议室 ID
 */
export const getRoomDetail = async (roomId) => {
  return apiClient.get(`/v1/admin/rooms/${roomId}`)
}

/**
 * 强制关闭会议室
 * @param {string} roomId - 会议室 ID
 * @param {string} reason - 关闭原因
 */
export const forceCloseRoom = async (roomId, reason) => {
  return apiClient.post(`/v1/admin/rooms/${roomId}/close`, { reason })
}

/**
 * 强制关闭所有会议室
 * @param {string} reason - 关闭原因
 */
export const forceCloseAllRooms = async (reason) => {
  return apiClient.post('/v1/admin/rooms/force-close-all', { reason })
}

/**
 * 从会议室移除用户
 * @param {string} roomId - 会议室 ID
 * @param {number} userId - 用户 ID
 */
export const removeUserFromRoom = async (roomId, userId) => {
  return apiClient.post(`/v1/admin/rooms/${roomId}/remove-user`, { userId })
}

/**
 * 获取录制列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从 1 开始）
 * @param {number} params.size - 每页数量
 * @param {string} params.keyword - 搜索关键词（录制名称或会议室 ID）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 */
export const getRecordings = async (params) => {
  return apiClient.get('/v1/admin/recordings', { params })
}

/**
 * 获取录制详情
 * @param {number} recordingId - 录制 ID
 */
export const getRecordingDetail = async (recordingId) => {
  return apiClient.get(`/v1/admin/recordings/${recordingId}`)
}

/**
 * 删除录制
 * @param {number} recordingId - 录制 ID
 */
export const deleteRecording = async (recordingId) => {
  return apiClient.delete(`/v1/admin/recordings/${recordingId}`)
}

/**
 * 批量删除录制
 * @param {number[]} recordingIds - 录制 ID 数组
 */
export const batchDeleteRecordings = async (recordingIds) => {
  return apiClient.post('/v1/admin/recordings/batch-delete', { recordingIds })
}

/**
 * 获取操作日志列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（从 1 开始）
 * @param {number} params.size - 每页数量
 * @param {string} params.keyword - 搜索关键词（操作人或操作内容）
 * @param {string} params.action - 操作类型（login/logout/create_room/close_room/etc）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 */
export const getOperationLogs = async (params) => {
  return apiClient.get('/v1/admin/logs', { params })
}

/**
 * 导出操作日志
 * @param {Object} params - 查询参数
 */
export const exportOperationLogs = async (params) => {
  return apiClient.get('/v1/admin/logs/export', {
    params,
    responseType: 'blob',
  })
}

/**
 * 获取系统配置
 */
export const getSystemConfig = async () => {
  return apiClient.get('/v1/admin/config')
}

/**
 * 更新系统配置
 * @param {Object} config - 配置对象
 */
export const updateSystemConfig = async (config) => {
  return apiClient.put('/v1/admin/config', config)
}
