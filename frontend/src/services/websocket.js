import { message as antdMessage } from 'antd'

/**
 * WebSocket 服务
 *
 * 管理 WebSocket 连接和消息处理
 */
class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.messageHandlers = new Map()
    this.isConnecting = false
  }

  /**
   * 连接 WebSocket
   *
   * @param {string} userId - 用户 ID
   * @returns {Promise<void>}
   */
  connect(userId) {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('WebSocket 已连接')
        resolve()
        return
      }

      if (this.isConnecting) {
        console.log('WebSocket 正在连接中...')
        return
      }

      this.isConnecting = true

      try {
        // 构建 WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = import.meta.env.VITE_WS_URL || window.location.host
        const wsUrl = `${protocol}//${host}/ws/meeting?userId=${userId}`

        console.log('正在连接 WebSocket:', wsUrl)
        this.ws = new WebSocket(wsUrl)

        // 连接成功
        this.ws.onopen = () => {
          console.log('WebSocket 连接成功')
          this.isConnecting = false
          this.reconnectAttempts = 0
          resolve()
        }

        // 接收消息
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('收到 WebSocket 消息:', data)

            // 调用所有注册的消息处理器
            this.messageHandlers.forEach((handler) => {
              try {
                handler(data)
              } catch (error) {
                console.error('消息处理器执行失败:', error)
              }
            })
          } catch (error) {
            console.error('解析 WebSocket 消息失败:', error)
          }
        }

        // 连接关闭
        this.ws.onclose = (event) => {
          console.log('WebSocket 连接关闭:', event.code, event.reason)
          this.isConnecting = false
          this.ws = null

          // 尝试重连
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(
              `尝试重连 WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
            )

            this.reconnectTimer = setTimeout(() => {
              this.connect(userId)
            }, this.reconnectDelay)
          } else {
            console.error('WebSocket 重连失败，已达到最大重试次数')
            antdMessage.error('实时通信连接失败，聊天功能可能无法使用')
          }
        }

        // 连接错误
        this.ws.onerror = (error) => {
          console.error('WebSocket 连接错误:', error)
          this.isConnecting = false
          reject(error)
        }
      } catch (error) {
        console.error('创建 WebSocket 连接失败:', error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.reconnectAttempts = 0
    this.messageHandlers.clear()
    console.log('WebSocket 已断开')
  }

  /**
   * 发送消息
   *
   * @param {object} data - 要发送的数据
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data)
        this.ws.send(message)
        console.log('发送 WebSocket 消息:', data)
      } catch (error) {
        console.error('发送 WebSocket 消息失败:', error)
      }
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
    }
  }

  /**
   * 注册消息处理器
   *
   * @param {string} id - 处理器 ID
   * @param {Function} handler - 消息处理函数
   */
  onMessage(id, handler) {
    this.messageHandlers.set(id, handler)
  }

  /**
   * 移除消息处理器
   *
   * @param {string} id - 处理器 ID
   */
  offMessage(id) {
    this.messageHandlers.delete(id)
  }

  /**
   * 检查连接状态
   *
   * @returns {boolean} 是否已连接
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// 导出单例
export default new WebSocketService()
