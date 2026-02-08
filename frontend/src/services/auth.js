import apiClient from './api'

// 用户登录
export const login = async (username, password) => {
  return apiClient.post('/auth/login', { username, password })
}

// 游客登录
export const guestLogin = async (nickname) => {
  return apiClient.post('/auth/guest', { nickname })
}

// 获取当前用户信息
export const getCurrentUser = async () => {
  return apiClient.get('/users/me')
}

// 刷新 token
export const refreshToken = async () => {
  return apiClient.post('/auth/refresh')
}
