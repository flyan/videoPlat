import apiClient from './api'

/**
 * 用户登录
 *
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<{user: Object, token: string}>}
 */
export const login = async (username, password) => {
  return apiClient.post('/auth/login', { username, password })
}

/**
 * 游客登录
 *
 * @param {string} nickname - 游客昵称
 * @returns {Promise<{user: Object, token: string}>}
 */
export const guestLogin = async (nickname) => {
  return apiClient.post('/auth/guest', { nickname })
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  return apiClient.get('/users/me')
}

/**
 * 刷新 Token
 */
export const refreshToken = async () => {
  return apiClient.post('/auth/refresh')
}
