import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Tabs, message } from 'antd'
import { UserOutlined, LockOutlined, SmileOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { login, guestLogin } from '../services/auth'

/**
 * 登录页面组件
 *
 * 提供注册用户登录和游客访问两种方式
 */
const Login = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

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

  const items = [
    {
      key: 'user',
      label: '用户登录',
      children: (
        <Form onFinish={handleLogin} autoComplete="off">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'guest',
      label: '游客访问',
      children: (
        <Form onFinish={handleGuestLogin} autoComplete="off">
          <Form.Item
            name="nickname"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, max: 20, message: '昵称长度为 2-20 个字符' },
            ]}
          >
            <Input
              prefix={<SmileOutlined />}
              placeholder="请输入昵称"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              进入
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card
        className="w-full max-w-md shadow-xl"
        title={
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">VideoPlat</h1>
            <p className="text-sm text-gray-500 mt-1">视频会议平台</p>
          </div>
        }
      >
        <Tabs items={items} centered />
      </Card>
    </div>
  )
}

export default Login
