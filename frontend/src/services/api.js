import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// API 基础 URL，支持通过环境变量配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 创建 axios 实例
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 * 自动添加 JWT Token 到请求头
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
apiClient.interceptors.response.use(
  (response) => {
    // 后端返回格式: { success: true, data: {...}, message: "..." }
    const result = response.data
    if (result.success) {
      return result.data
    } else {
      return Promise.reject({ message: result.message || '请求失败' })
    }
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      // Token 过期或无效，清除登录状态并跳转到登录页
      if (status === 401) {
        window.location.href = '/login'
      }

      // 返回后端的错误信息
      if (data && data.message) {
        return Promise.reject({ message: data.message })
      }

      return Promise.reject({ message: data?.message || '请求失败' })
    } else if (error.request) {
      // 请求已发送但没有收到响应（网络错误）
      return Promise.reject({ message: '网络错误，请检查网络连接' })
    } else {
      // 其他错误（请求配置错误等）
      return Promise.reject({ message: error.message || '未知错误' })
    }
  }
)

export default apiClient
