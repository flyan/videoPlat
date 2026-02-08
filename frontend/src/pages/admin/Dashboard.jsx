import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, message } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  CloudServerOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAdminStore } from '../../store/adminStore'
import { getStatistics, getUsers, getRooms } from '../../services/admin'

/**
 * 管理台首页
 *
 * 显示系统统计信息、在线用户、活跃会议室等
 */
function Dashboard() {
  const { statistics, setStatistics } = useAdminStore()
  const [loading, setLoading] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [activeRooms, setActiveRooms] = useState([])

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true)
    try {
      const data = await getStatistics()
      setStatistics(data)
    } catch (error) {
      message.error(error.message || '加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载在线用户
  const loadOnlineUsers = async () => {
    try {
      const data = await getUsers({ page: 1, size: 10, status: 'online' })
      setOnlineUsers(data.list || [])
    } catch (error) {
      console.error('加载在线用户失败:', error)
    }
  }

  // 加载活跃会议室
  const loadActiveRooms = async () => {
    try {
      const data = await getRooms({ page: 1, size: 10, status: 'active' })
      setActiveRooms(data.list || [])
    } catch (error) {
      console.error('加载活跃会议室失败:', error)
    }
  }

  // 刷新所有数据
  const handleRefresh = () => {
    loadStatistics()
    loadOnlineUsers()
    loadActiveRooms()
  }

  useEffect(() => {
    handleRefresh()
    // 每 30 秒自动刷新一次
    const interval = setInterval(handleRefresh, 30000)
    return () => clearInterval(interval)
  }, [])

  // 在线用户表格列定义
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colorMap = {
          admin: 'red',
          user: 'blue',
          guest: 'default',
        }
        const textMap = {
          admin: '管理员',
          user: '用户',
          guest: '游客',
        }
        return <Tag color={colorMap[role]}>{textMap[role] || role}</Tag>
      },
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="green">在线</Tag>,
    },
  ]

  // 活跃会议室表格列定义
  const roomColumns = [
    {
      title: '会议室 ID',
      dataIndex: 'roomId',
      key: 'roomId',
    },
    {
      title: '会议室名称',
      dataIndex: 'roomName',
      key: 'roomName',
    },
    {
      title: '参与人数',
      dataIndex: 'participantCount',
      key: 'participantCount',
      render: (count) => `${count} / 10`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '状态',
      key: 'status',
      render: () => <Tag color="green">进行中</Tag>,
    },
  ]

  // 格式化存储空间
  const formatStorage = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>管理台首页</h1>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={statistics.onlineUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃会议室"
              value={statistics.activeRooms}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="存储空间"
              value={formatStorage(statistics.storageUsed)}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 在线用户列表 */}
      <Card
        title="在线用户"
        style={{ marginBottom: '24px' }}
        extra={
          <Button type="link" href="/admin/users">
            查看全部
          </Button>
        }
      >
        <Table
          columns={userColumns}
          dataSource={onlineUsers}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>

      {/* 活跃会议室列表 */}
      <Card
        title="活跃会议室"
        extra={
          <Button type="link" href="/admin/rooms">
            查看全部
          </Button>
        }
      >
        <Table
          columns={roomColumns}
          dataSource={activeRooms}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  )
}

export default Dashboard
