import axios from './axios'

/**
 * 发送聊天消息
 *
 * @param {string} roomId - 会议室 ID
 * @param {string} content - 消息内容
 * @returns {Promise<object>} 消息对象
 */
export const sendChatMessage = async (roomId, content) => {
  const response = await axios.post(`/api/v1/chat/rooms/${roomId}/messages`, {
    content,
  })
  return response.data
}

/**
 * 获取聊天历史
 *
 * @param {string} roomId - 会议室 ID
 * @returns {Promise<Array>} 消息列表
 */
export const getChatHistory = async (roomId) => {
  const response = await axios.get(`/api/v1/chat/rooms/${roomId}/messages`)
  return response.data
}

/**
 * 清除聊天历史
 *
 * @param {string} roomId - 会议室 ID
 * @returns {Promise<void>}
 */
export const clearChatHistory = async (roomId) => {
  const response = await axios.delete(`/api/v1/chat/rooms/${roomId}/messages`)
  return response.data
}
