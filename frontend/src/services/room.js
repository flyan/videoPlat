import apiClient from './api'

// 创建会议室
export const createRoom = async (roomName, password = null, maxParticipants = 10) => {
  return apiClient.post('/rooms', {
    roomName,
    password,
    maxParticipants,
  })
}

// 获取会议室信息
export const getRoomInfo = async (roomId) => {
  return apiClient.get(`/rooms/${roomId}`)
}

// 加入会议室
export const joinRoom = async (roomId, password = null) => {
  return apiClient.post(`/rooms/${roomId}/join`, { password })
}

// 离开会议室
export const leaveRoom = async (roomId) => {
  return apiClient.post(`/rooms/${roomId}/leave`)
}

// 结束会议室（仅主持人）
export const endRoom = async (roomId) => {
  return apiClient.delete(`/rooms/${roomId}`)
}

// 获取参与者列表
export const getParticipants = async (roomId) => {
  return apiClient.get(`/rooms/${roomId}/participants`)
}

// 移除参与者（仅主持人）
export const removeParticipant = async (roomId, userId) => {
  return apiClient.delete(`/rooms/${roomId}/participants/${userId}`)
}

// 获取 Agora Token
export const getAgoraToken = async (roomId, userId) => {
  return apiClient.get(`/rooms/${roomId}/agora-token`, {
    params: { userId },
  })
}
