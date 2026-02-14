import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, Modal, message, Avatar, Dropdown } from 'antd'
import {
  VideoCameraOutlined,
  PlusOutlined,
  LogoutOutlined,
  HistoryOutlined,
  LockOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { createRoom, joinRoom } from '../services/room'
import ParticleExplosion from '../components/ParticleExplosion'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [joinModalVisible, setJoinModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quickJoinId, setQuickJoinId] = useState('')
  const [explosion, setExplosion] = useState(null)

  /**
   * 创建会议室并自动加入
   */
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

  /**
   * 加入已存在的会议室
   */
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

  /**
   * 快速加入会议
   */
  const handleQuickJoin = async () => {
    if (!quickJoinId.trim()) {
      message.warning('请输入会议 ID')
      return
    }
    setLoading(true)
    try {
      await joinRoom(quickJoinId.trim(), null)
      message.success('正在加入会议室')
      navigate(`/room/${quickJoinId.trim()}`)
    } catch (error) {
      message.error(error.message || '加入会议室失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 触发粒子爆炸效果
   */
  const triggerExplosion = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setExplosion({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    setTimeout(() => setExplosion(null), 1000)
  }

  /**
   * 退出登录
   */
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        logout()
        navigate('/login')
      },
    })
  }

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  // 模拟最近会议数据
  const recentMeetings = [
    {
      id: 'room-001',
      name: '团队周会',
      time: '2小时前',
      participants: 8,
      status: 'ended',
    },
    {
      id: 'room-002',
      name: '产品评审',
      time: '昨天 14:30',
      participants: 5,
      status: 'ended',
    },
    {
      id: 'room-003',
      name: '客户演示',
      time: '昨天 10:00',
      participants: 12,
      status: 'ended',
    },
  ]

  return (
    <div className="home-container">
      {/* 粒子爆炸效果 */}
      {explosion && (
        <ParticleExplosion
          x={explosion.x}
          y={explosion.y}
          color="#6366f1"
          onComplete={() => setExplosion(null)}
        />
      )}

      {/* 顶部导航栏 */}
      <header className="home-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <VideoCameraOutlined />
              </div>
              <span className="logo-text">VideoPlat</span>
            </div>
          </div>

          <div className="header-center">
            <div className="search-bar">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                placeholder="搜索会议、联系人..."
                className="search-input"
              />
            </div>
          </div>

          <div className="header-right">
            <Button
              icon={<HistoryOutlined />}
              type="text"
              className="header-button"
              onClick={() => navigate('/recordings')}
            >
              录制记录
            </Button>
            {user?.role === 'ADMIN' && (
              <Button
                icon={<SettingOutlined />}
                type="text"
                className="header-button admin-button"
                onClick={() => navigate('/admin/rooms')}
              >
                管理台
              </Button>
            )}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="user-profile">
                <Avatar size={36} className="user-avatar">
                  {(user?.nickname || user?.username)?.[0]?.toUpperCase()}
                </Avatar>
                <div className="user-info">
                  <span className="user-name">
                    {user?.nickname || user?.username}
                  </span>
                  {user?.userType === 'GUEST' && (
                    <span className="user-badge">游客</span>
                  )}
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="home-main">
        <div className="main-content">
          {/* 欢迎区域 + 快速加入 */}
          <section className="welcome-section">
            <div className="welcome-text">
              <h1 className="welcome-title">
                欢迎回来，{user?.nickname || user?.username}！
              </h1>
              <p className="welcome-subtitle">
                开始新的会议或加入现有会议
              </p>
            </div>
            <div className="quick-join-box">
              <input
                type="text"
                placeholder="输入会议 ID 快速加入"
                className="quick-join-input"
                value={quickJoinId}
                onChange={(e) => setQuickJoinId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickJoin()}
              />
              <Button
                type="primary"
                size="large"
                className="quick-join-button"
                onClick={(e) => {
                  triggerExplosion(e)
                  handleQuickJoin()
                }}
                loading={loading}
              >
                加入
              </Button>
            </div>
          </section>

          {/* 功能卡片 */}
          <section className="action-cards-section">
            <div className="action-cards-grid">
              <div
                className="action-card card-create"
                onClick={(e) => {
                  triggerExplosion(e)
                  setCreateModalVisible(true)
                }}
              >
                <div className="card-icon-wrapper">
                  <div className="card-icon">
                    <PlusOutlined />
                  </div>
                </div>
                <h3 className="card-title">创建会议</h3>
                <p className="card-description">
                  创建一个新的视频会议室
                </p>
              </div>

              <div
                className="action-card card-join"
                onClick={(e) => {
                  triggerExplosion(e)
                  setJoinModalVisible(true)
                }}
              >
                <div className="card-icon-wrapper">
                  <div className="card-icon">
                    <VideoCameraOutlined />
                  </div>
                </div>
                <h3 className="card-title">加入会议</h3>
                <p className="card-description">
                  通过会议 ID 加入现有会议
                </p>
              </div>

              <div className="action-card card-schedule">
                <div className="card-icon-wrapper">
                  <div className="card-icon">
                    <CalendarOutlined />
                  </div>
                </div>
                <h3 className="card-title">预约会议</h3>
                <p className="card-description">
                  安排未来的会议时间
                </p>
                <div className="card-badge">即将推出</div>
              </div>
            </div>
          </section>

          {/* 最近的会议 */}
          <section className="recent-meetings-section">
            <div className="section-header">
              <h2 className="section-title">最近的会议</h2>
              <Button type="link" className="view-all-button">
                查看全部
              </Button>
            </div>
            <div className="meetings-list">
              {recentMeetings.map((meeting) => (
                <div key={meeting.id} className="meeting-item">
                  <div className="meeting-icon">
                    <VideoCameraOutlined />
                  </div>
                  <div className="meeting-info">
                    <h4 className="meeting-name">{meeting.name}</h4>
                    <div className="meeting-meta">
                      <span className="meta-item">
                        <ClockCircleOutlined />
                        {meeting.time}
                      </span>
                      <span className="meta-item">
                        <TeamOutlined />
                        {meeting.participants} 人参与
                      </span>
                    </div>
                  </div>
                  <Button type="primary" ghost className="rejoin-button">
                    重新加入
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* 快速访问 */}
          <section className="quick-access-section">
            <h2 className="section-title">快速访问</h2>
            <div className="quick-access-grid">
              <div
                className="quick-access-card"
                onClick={() => navigate('/recordings')}
              >
                <div className="qa-icon">
                  <HistoryOutlined />
                </div>
                <span className="qa-label">录制记录</span>
              </div>
              <div className="quick-access-card">
                <div className="qa-icon">
                  <SettingOutlined />
                </div>
                <span className="qa-label">个人设置</span>
              </div>
              <div className="quick-access-card">
                <div className="qa-icon">
                  <QuestionCircleOutlined />
                </div>
                <span className="qa-label">帮助中心</span>
              </div>
              <div className="quick-access-card">
                <div className="qa-icon">
                  <MessageOutlined />
                </div>
                <span className="qa-label">反馈建议</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 创建会议弹窗 */}
      <Modal
        title="创建会议室"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        className="custom-modal"
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
            <Input placeholder="例如：团队周会" size="large" />
          </Form.Item>
          <Form.Item label="会议密码（可选）" name="password">
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="设置密码以保护会议"
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
        className="custom-modal"
      >
        <Form onFinish={handleJoinRoom} layout="vertical">
          <Form.Item
            label="会议室 ID"
            name="roomId"
            rules={[{ required: true, message: '请输入会议室 ID' }]}
          >
            <Input placeholder="输入会议室 ID" size="large" />
          </Form.Item>
          <Form.Item label="会议密码（如需要）" name="password">
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="输入会议密码"
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
              加入会议
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Home
