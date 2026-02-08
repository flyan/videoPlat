import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 token
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

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    // 后端返回格式: { success: true, data: {...}, message: "..." }
    // 直接返回 data 字段
    const result = response.data
    if (result.success) {
      return result.data
    } else {
      return Promise.reject({ message: result.message || '请求失败' })
    }
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response

      if (status === 401) {
        // token 过期或无效，清除登录状态
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }

      // 如果后端返回了标准格式的错误
      if (data && data.message) {
        return Promise.reject({ message: data.message })
      }

      return Promise.reject({ message: data?.message || '请求失败' })
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return Promise.reject({ message: '网络错误，请检查网络连接' })
    } else {
      // 其他错误
      return Promise.reject({ message: error.message || '未知错误' })
    }
  }
)

export default apiClient
