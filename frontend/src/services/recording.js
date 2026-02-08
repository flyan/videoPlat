import apiClient from './api'

// 开始录制
export const startRecording = async (roomId) => {
  return apiClient.post(`/rooms/${roomId}/recordings/start`)
}

// 停止录制
export const stopRecording = async (roomId) => {
  return apiClient.post(`/rooms/${roomId}/recordings/stop`)
}

// 获取录制列表
export const getRecordings = async (params = {}) => {
  return apiClient.get('/recordings', { params })
}

// 获取录制详情
export const getRecordingDetail = async (recordingId) => {
  return apiClient.get(`/recordings/${recordingId}`)
}

// 删除录制
export const deleteRecording = async (recordingId) => {
  return apiClient.delete(`/recordings/${recordingId}`)
}

// 获取录制播放 URL
export const getRecordingStreamUrl = (recordingId) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  return `${baseUrl}/recordings/${recordingId}/stream`
}
