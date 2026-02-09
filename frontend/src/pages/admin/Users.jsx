import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Tooltip,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  LogoutOutlined,
  StopOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useAdminStore } from '../../store/adminStore'
import {
  getUsers,
  forceLogoutUser,
  disableUser,
  enableUser,
  deleteUser,
} from '../../services/admin'

const { Search } = Input
const { Option } = Select
const { confirm } = Modal

/**
 * 用户管理页面
 *
 * 显示用户列表，支持搜索、筛选、强制下线、禁用/启用、删除等操作
 */
function Users() {
  const {
    users,
    usersTotal,
    usersLoading,
    setUsers,
    setUsersLoading,
    updateUser,
    removeUser,
  } = useAdminStore()

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'all',
    role: 'all',
  })

  // 加载用户列表
  const loadUsers = async (page = pagination.current, size = pagination.pageSize) => {
    setUsersLoading(true)
    try {
      const data = await getUsers({
        page: page - 1, // Spring Data Page 从 0 开始
        size,
        ...filters,
      })
      // Spring Data Page 格式: { content: [], totalElements: 0 }
      setUsers(data.content || [], data.totalElements || 0)
      setPagination({ ...pagination, current: page, pageSize: size })
    } catch (error) {
      message.error(error.message || '加载用户列表失败')
    } finally {
      setUsersLoading(false)
    }
  }

  // 搜索用户
  const handleSearch = (value) => {
    setFilters({ ...filters, keyword: value })
    setPagination({ ...pagination, current: 1 })
  }

  // 筛选状态
  const handleStatusChange = (value) => {
    setFilters({ ...filters, status: value })
    setPagination({ ...pagination, current: 1 })
  }

  // 筛选角色
  const handleRoleChange = (value) => {
    setFilters({ ...filters, role: value })
    setPagination({ ...pagination, current: 1 })
  }

  // 强制用户下线
  const handleForceLogout = (user) => {
    confirm({
      title: '确认强制下线',
      icon: <ExclamationCircleOutlined />,
      content: `确定要强制用户 "${user.username}" 下线吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await forceLogoutUser(user.id)
          message.success('用户已强制下线')
          updateUser(user.id, { status: 'offline' })
        } catch (error) {
          message.error(error.message || '强制下线失败')
        }
      },
    })
  }

  // 禁用用户
  const handleDisable = (user) => {
    confirm({
      title: '确认禁用用户',
      icon: <ExclamationCircleOutlined />,
      content: `确定要禁用用户 "${user.username}" 吗？禁用后该用户将无法登录系统。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await disableUser(user.id, '管理员操作')
          message.success('用户已禁用')
          updateUser(user.id, { enabled: false })
        } catch (error) {
          message.error(error.message || '禁用用户失败')
        }
      },
    })
  }

  // 启用用户
  const handleEnable = (user) => {
    confirm({
      title: '确认启用用户',
      icon: <ExclamationCircleOutlined />,
      content: `确定要启用用户 "${user.username}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await enableUser(user.id)
          message.success('用户已启用')
          updateUser(user.id, { enabled: true })
        } catch (error) {
          message.error(error.message || '启用用户失败')
        }
      },
    })
  }

  // 删除用户
  const handleDelete = (user) => {
    confirm({
      title: '确认删除用户',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUser(user.id)
          message.success('用户已删除')
          removeUser(user.id)
        } catch (error) {
          message.error(error.message || '删除用户失败')
        }
      },
    })
  }

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    loadUsers(newPagination.current, newPagination.pageSize)
  }

  useEffect(() => {
    loadUsers()
  }, [filters])

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          online: 'green',
          offline: 'default',
        }
        const textMap = {
          online: '在线',
          offline: '离线',
        }
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>
      },
    },
    {
      title: '账号状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled) =>
        enabled ? (
          <Tag color="success">正常</Tag>
        ) : (
          <Tag color="error">已禁用</Tag>
        ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (time) => (time ? new Date(time).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'online' && (
            <Tooltip title="强制下线">
              <Button
                type="link"
                size="small"
                icon={<LogoutOutlined />}
                onClick={() => handleForceLogout(record)}
              />
            </Tooltip>
          )}
          {record.enabled ? (
            <Tooltip title="禁用">
              <Button
                type="link"
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => handleDisable(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="启用">
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleEnable(record)}
              />
            </Tooltip>
          )}
          {record.role !== 'admin' && (
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
        用户管理
      </h1>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索用户名或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            value={filters.status}
            style={{ width: 120 }}
            onChange={handleStatusChange}
          >
            <Option value="all">全部状态</Option>
            <Option value="online">在线</Option>
            <Option value="offline">离线</Option>
          </Select>
          <Select
            value={filters.role}
            style={{ width: 120 }}
            onChange={handleRoleChange}
          >
            <Option value="all">全部角色</Option>
            <Option value="admin">管理员</Option>
            <Option value="user">用户</Option>
            <Option value="guest">游客</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadUsers()}
          >
            刷新
          </Button>
        </Space>
      </Card>

      {/* 用户列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={usersLoading}
          pagination={{
            ...pagination,
            total: usersTotal,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

export default Users
