import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Modal, message, Space, Typography } from 'antd'
import {
  VideoCameraOutlined,
  PlusOutlined,
  LogoutOutlined,
  HistoryOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { createRoom, joinRoom } from '../services/room'

const { Title, Text } = Typography

const Home = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [joinModalVisible, setJoinModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  // 创建会议室
  const handleCreateRoom = async (values) => {
    setLoading(true)
    try {
      const data = await createRoom(
        values.roomName,
        values.password || null,
        10
      )
      message.success('会议室创建成功')
      setCreateModalVisible(false)
      navigate(`/room/${data.roomId}`)
    } catch (error) {
      message.error(error.message || '创建会议室失败')
    } finally {
      setLoading(false)
    }
  }

  // 加入会议室
  const handleJoinRoom = async (values) => {
    setLoading(true)
    try {
      await joinRoom(values.roomId, values.password || null)
      message.success('正在加入会议室')
      setJoinModalVisible(false)
      navigate(`/room/${values.roomId}`)
    } catch (error) {
      message.error(error.message || '加入会议室失败')
    } finally {
      setLoading(false)
    }
  }

  // 退出登录
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: () => {
        logout()
        navigate('/login')
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <VideoCameraOutlined className="text-2xl text-blue-600 mr-2" />
              <Title level={3} className="!mb-0">
                VideoPlat
              </Title>
            </div>
            <Space>
              <Text>
                欢迎，{user?.nickname || user?.username}
                {user?.userType === 'GUEST' && ' (游客)'}
              </Text>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => navigate('/recordings')}
              >
                录制记录
              </Button>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                退出
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Title level={2}>开始您的视频会议</Title>
          <Text type="secondary">创建新会议或加入现有会议</Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 创建会议 */}
          <Card
            hoverable
            className="text-center"
            onClick={() => setCreateModalVisible(true)}
          >
            <PlusOutlined className="text-5xl text-blue-600 mb-4" />
            <Title level={4}>创建会议</Title>
            <Text type="secondary">创建一个新的视频会议室</Text>
          </Card>

          {/* 加入会议 */}
          <Card
            hoverable
            className="text-center"
            onClick={() => setJoinModalVisible(true)}
          >
            <VideoCameraOutlined className="text-5xl text-green-600 mb-4" />
            <Title level={4}>加入会议</Title>
            <Text type="secondary">通过会议 ID 加入现有会议</Text>
          </Card>
        </div>
      </div>

      {/* 创建会议弹窗 */}
      <Modal
        title="创建会议室"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleCreateRoom} layout="vertical">
          <Form.Item
            label="会议室名称"
            name="roomName"
            rules={[
              { required: true, message: '请输入会议室名称' },
              { min: 2, max: 50, message: '名称长度为 2-50 个字符' },
            ]}
          >
            <Input placeholder="例如：团队周会" />
          </Form.Item>
          <Form.Item
            label="会议密码（可选）"
            name="password"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="设置密码以保护会议"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              创建并加入
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 加入会议弹窗 */}
      <Modal
        title="加入会议室"
        open={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleJoinRoom} layout="vertical">
          <Form.Item
            label="会议室 ID"
            name="roomId"
            rules={[{ required: true, message: '请输入会议室 ID' }]}
          >
            <Input placeholder="输入会议室 ID" />
          </Form.Item>
          <Form.Item
            label="会议密码（如需要）"
            name="password"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="输入会议密码"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              加入会议
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Home
