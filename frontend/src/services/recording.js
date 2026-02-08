import apiClient from './api'

/**
 * 开始录制
 *
 * @param {string} roomId - 会议室 ID
 * @returns {Promise<{recordingId: string}>}
 */
export const startRecording = async (roomId) => {
  return apiClient.post(`/rooms/${roomId}/recordings/start`)
}

/**
 * 停止录制
 */
export const stopRecording = async (roomId) => {
  return apiClient.post(`/rooms/${roomId}/recordings/stop`)
}

/**
 * 获取录制列表
 *
 * @param {Object} params - 查询参数（roomName, startDate, endDate）
 */
export const getRecordings = async (params = {}) => {
  return apiClient.get('/recordings', { params })
}

/**
 * 获取录制详情
 */
export const getRecordingDetail = async (recordingId) => {
  return apiClient.get(`/recordings/${recordingId}`)
}

/**
 * 删除录制
 */
export const deleteRecording = async (recordingId) => {
  return apiClient.delete(`/recordings/${recordingId}`)
}

/**
 * 获取录制播放 URL
 *
 * @param {string} recordingId - 录制 ID
 * @returns {string} 视频流 URL
 */
export const getRecordingStreamUrl = (recordingId) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  return `${baseUrl}/recordings/${recordingId}/stream`
}
