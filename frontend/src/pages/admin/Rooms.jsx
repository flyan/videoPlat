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
  Descriptions,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  StopOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useAdminStore } from '../../store/adminStore'
import { getRooms, getRoomDetail, forceCloseRoom, forceCloseAllRooms } from '../../services/admin'

const { Search } = Input
const { Option } = Select
const { confirm } = Modal

/**
 * 会议室管理页面
 *
 * 显示会议室列表，支持搜索、筛选、查看详情、强制关闭等操作
 */
function Rooms() {
  const {
    rooms,
    roomsTotal,
    roomsLoading,
    setRooms,
    setRoomsLoading,
    removeRoom,
  } = useAdminStore()

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState({
    keyword: '',
    status: 'all',
  })
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // 加载会议室列表
  const loadRooms = async (page = pagination.current, size = pagination.pageSize) => {
    setRoomsLoading(true)
    try {
      const data = await getRooms({
        page: page - 1, // Spring Data Page 从 0 开始
        size,
        ...filters,
      })
      // Spring Data Page 格式: { content: [], totalElements: 0 }
      setRooms(data.content || [], data.totalElements || 0)
      setPagination({ ...pagination, current: page, pageSize: size })
    } catch (error) {
      message.error(error.message || '加载会议室列表失败')
    } finally {
      setRoomsLoading(false)
    }
  }

  // 搜索会议室
  const handleSearch = (value) => {
    setFilters({ ...filters, keyword: value })
    setPagination({ ...pagination, current: 1 })
  }

  // 筛选状态
  const handleStatusChange = (value) => {
    setFilters({ ...filters, status: value })
    setPagination({ ...pagination, current: 1 })
  }

  // 查看会议室详情
  const handleViewDetail = async (room) => {
    setDetailVisible(true)
    setDetailLoading(true)
    try {
      const data = await getRoomDetail(room.roomId)
      setSelectedRoom(data)
    } catch (error) {
      message.error(error.message || '加载会议室详情失败')
      setDetailVisible(false)
    } finally {
      setDetailLoading(false)
    }
  }

  // 强制关闭会议室
  const handleForceClose = (room) => {
    confirm({
      title: '确认强制关闭',
      icon: <ExclamationCircleOutlined />,
      content: `确定要强制关闭会议室 "${room.roomName}" 吗？所有参与者将被移出会议室。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await forceCloseRoom(room.roomId, '管理员操作')
          message.success('会议室已强制关闭')
          removeRoom(room.id)
        } catch (error) {
          message.error(error.message || '强制关闭失败')
        }
      },
    })
  }

  // 强制关闭所有会议室
  const handleForceCloseAll = () => {
    confirm({
      title: '⚠️ 危险操作：强制清理所有会议室',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#ff4d4f' }}>
            此操作将强制关闭所有进行中的会议室！
          </p>
          <p style={{ marginBottom: '8px' }}>
            • 所有参与者将被立即移出会议室
          </p>
          <p style={{ marginBottom: '8px' }}>
            • 正在进行的录制将被停止
          </p>
          <p style={{ marginBottom: '0' }}>
            • 此操作不可撤销，请谨慎操作！
          </p>
        </div>
      ),
      okText: '确认清理',
      okType: 'danger',
      cancelText: '取消',
      width: 500,
      onOk: async () => {
        try {
          const result = await forceCloseAllRooms('管理员批量清理')
          message.success(`已成功关闭 ${result} 个会议室`)
          loadRooms()
        } catch (error) {
          message.error(error.message || '批量关闭失败')
        }
      },
    })
  }

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    loadRooms(newPagination.current, newPagination.pageSize)
  }

  useEffect(() => {
    loadRooms()
  }, [filters])

  // 表格列定义
  const columns = [
    {
      title: '会议室 ID',
      dataIndex: 'roomId',
      key: 'roomId',
      width: 150,
    },
    {
      title: '会议室名称',
      dataIndex: 'roomName',
      key: 'roomName',
    },
    {
      title: '创建者',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '参与人数',
      dataIndex: 'participantCount',
      key: 'participantCount',
      render: (count) => (
        <Tag color={count >= 8 ? 'red' : count >= 5 ? 'orange' : 'green'}>
          {count} / 10
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          active: 'green',
          inactive: 'default',
        }
        const textMap = {
          active: '进行中',
          inactive: '已结束',
        }
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
      render: (_, record) => {
        if (record.status === 'inactive') {
          return record.duration || '-'
        }
        const start = new Date(record.createdAt)
        const now = new Date()
        const diff = Math.floor((now - start) / 1000 / 60)
        return `${diff} 分钟`
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'active' && (
            <Tooltip title="强制关闭">
              <Button
                type="link"
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => handleForceClose(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  // 参与者列表列定义
  const participantColumns = [
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
          host: 'red',
          participant: 'blue',
        }
        const textMap = {
          host: '主持人',
          participant: '参与者',
        }
        return <Tag color={colorMap[role]}>{textMap[role] || role}</Tag>
      },
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
        会议室管理
      </h1>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space size="middle" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size="middle" wrap>
            <Search
              placeholder="搜索会议室名称或 ID"
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
              <Option value="active">进行中</Option>
              <Option value="inactive">已结束</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => loadRooms()}>
              刷新
            </Button>
          </Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleForceCloseAll}
          >
            强制清理所有会议室
          </Button>
        </Space>
      </Card>

      {/* 会议室列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="id"
          loading={roomsLoading}
          pagination={{
            ...pagination,
            total: roomsTotal,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 会议室详情弹窗 */}
      <Modal
        title="会议室详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : selectedRoom ? (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="会议室 ID" span={2}>
                {selectedRoom.roomId}
              </Descriptions.Item>
              <Descriptions.Item label="会议室名称" span={2}>
                {selectedRoom.roomName}
              </Descriptions.Item>
              <Descriptions.Item label="创建者">
                {selectedRoom.creatorName}
              </Descriptions.Item>
              <Descriptions.Item label="参与人数">
                {selectedRoom.participantCount} / 10
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  color={selectedRoom.status === 'active' ? 'green' : 'default'}
                >
                  {selectedRoom.status === 'active' ? '进行中' : '已结束'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="是否录制">
                <Tag color={selectedRoom.isRecording ? 'red' : 'default'}>
                  {selectedRoom.isRecording ? '录制中' : '未录制'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {new Date(selectedRoom.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>参与者列表</h3>
            <Table
              columns={participantColumns}
              dataSource={selectedRoom.participants || []}
              rowKey="userId"
              pagination={false}
              size="small"
            />
          </>
        ) : null}
      </Modal>
    </div>
  )
}

export default Rooms
