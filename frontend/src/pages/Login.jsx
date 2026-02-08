import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, SmileOutlined, VideoCameraOutlined, TeamOutlined, SafetyOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { login, guestLogin } from '../services/auth'
import './Login.css'

/**
 * 登录页面组件
 *
 * 提供注册用户登录和游客访问两种方式
 */
const Login = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('user')

  /**
   * 处理注册用户登录
   */
  const handleLogin = async (values) => {
    setLoading(true)
    try {
      const response = await login(values.username, values.password)
      const { user, token } = response
      setAuth(user, token)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理游客登录
   */
  const handleGuestLogin = async (values) => {
    setLoading(true)
    try {
      const response = await guestLogin(values.nickname)
      const { user, token } = response
      setAuth(user, token)
      message.success('欢迎访问')
      navigate('/')
    } catch (error) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* 动态背景 */}
      <div className="login-background">
        <div className="bg-gradient"></div>
        <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="login-content">
        {/* 左侧插图区域 - 桌面端显示 */}
        <div className="login-illustration">
          <div className="illustration-content">
            <div className="brand-section">
              <div className="brand-icon">
                <VideoCameraOutlined />
              </div>
              <h1 className="brand-title">VideoPlat</h1>
              <p className="brand-slogan">连接世界，面对面交流</p>
            </div>

            <div className="features-section">
              <div className="feature-item">
                <div className="feature-icon">
                  <VideoCameraOutlined />
                </div>
                <div className="feature-text">
                  <h3>高清视频通话</h3>
                  <p>支持最多10人同时在线</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <TeamOutlined />
                </div>
                <div className="feature-text">
                  <h3>实时协作</h3>
                  <p>屏幕共享与互动白板</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <SafetyOutlined />
                </div>
                <div className="feature-text">
                  <h3>安全可靠</h3>
                  <p>端到端加密保护隐私</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <ThunderboltOutlined />
                </div>
                <div className="feature-text">
                  <h3>快速稳定</h3>
                  <p>低延迟高质量体验</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="card-header">
              <h2 className="card-title">欢迎回来</h2>
              <p className="card-subtitle">登录以开始您的视频会议</p>
            </div>

            {/* Tab 切换 */}
            <div className="login-tabs">
              <button
                className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTab('user')}
              >
                用户登录
              </button>
              <button
                className={`tab-button ${activeTab === 'guest' ? 'active' : ''}`}
                onClick={() => setActiveTab('guest')}
              >
                游客访问
              </button>
              <div
                className="tab-indicator"
                style={{ transform: `translateX(${activeTab === 'user' ? '0' : '100%'})` }}
              ></div>
            </div>

            {/* 表单内容 */}
            <div className="form-content">
              {activeTab === 'user' ? (
                <Form
                  onFinish={handleLogin}
                  autoComplete="off"
                  className="login-form"
                >
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <div className="input-wrapper">
                      <Input
                        prefix={<UserOutlined className="input-icon" />}
                        placeholder="用户名"
                        size="large"
                        className="custom-input"
                      />
                    </div>
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <div className="input-wrapper">
                      <Input.Password
                        prefix={<LockOutlined className="input-icon" />}
                        placeholder="密码"
                        size="large"
                        className="custom-input"
                      />
                    </div>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      block
                      className="submit-button"
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <Form
                  onFinish={handleGuestLogin}
                  autoComplete="off"
                  className="login-form"
                >
                  <Form.Item
                    name="nickname"
                    rules={[
                      { required: true, message: '请输入昵称' },
                      { min: 2, max: 20, message: '昵称长度为 2-20 个字符' },
                    ]}
                  >
                    <div className="input-wrapper">
                      <Input
                        prefix={<SmileOutlined className="input-icon" />}
                        placeholder="请输入昵称"
                        size="large"
                        className="custom-input"
                      />
                    </div>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      block
                      className="submit-button"
                    >
                      进入
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </div>

            <div className="card-footer">
              <p className="footer-text">
                使用 VideoPlat 即表示您同意我们的服务条款和隐私政策
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
