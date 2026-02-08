import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  message,
  Tooltip,
  DatePicker,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useAdminStore } from '../../store/adminStore'
import { getRecordings, deleteRecording, batchDeleteRecordings } from '../../services/admin'

const { Search } = Input
const { RangePicker } = DatePicker
const { confirm } = Modal

/**
 * 录制管理页面
 *
 * 显示录制列表，支持搜索、筛选、删除等操作
 */
function Recordings() {
  const {
    recordings,
    recordingsTotal,
    recordingsLoading,
    setRecordings,
    setRecordingsLoading,
    removeRecording,
  } = useAdminStore()

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState({
    keyword: '',
    startDate: null,
    endDate: null,
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // 加载录制列表
  const loadRecordings = async (
    page = pagination.current,
    size = pagination.pageSize
  ) => {
    setRecordingsLoading(true)
    try {
      const data = await getRecordings({
        page,
        size,
        ...filters,
      })
      setRecordings(data.list || [], data.total || 0)
      setPagination({ ...pagination, current: page, pageSize: size })
    } catch (error) {
      message.error(error.message || '加载录制列表失败')
    } finally {
      setRecordingsLoading(false)
    }
  }

  // 搜索录制
  const handleSearch = (value) => {
    setFilters({ ...filters, keyword: value })
    setPagination({ ...pagination, current: 1 })
  }

  // 日期范围变化
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      })
    } else {
      setFilters({
        ...filters,
        startDate: null,
        endDate: null,
      })
    }
    setPagination({ ...pagination, current: 1 })
  }

  // 播放录制
  const handlePlay = (recording) => {
    // 在新窗口打开播放页面
    window.open(`/recordings/${recording.id}`, '_blank')
  }

  // 删除录制
  const handleDelete = (recording) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除录制 "${recording.fileName}" 吗？此操作不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteRecording(recording.id)
          message.success('录制已删除')
          removeRecording(recording.id)
        } catch (error) {
          message.error(error.message || '删除录制失败')
        }
      },
    })
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的录制')
      return
    }

    confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 条录制吗？此操作不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await batchDeleteRecordings(selectedRowKeys)
          message.success(`已删除 ${selectedRowKeys.length} 条录制`)
          setSelectedRowKeys([])
          loadRecordings()
        } catch (error) {
          message.error(error.message || '批量删除失败')
        }
      },
    })
  }

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    loadRecordings(newPagination.current, newPagination.pageSize)
  }

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  }

  useEffect(() => {
    loadRecordings()
  }, [filters])

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  // 格式化时长
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
    },
    {
      title: '会议室',
      dataIndex: 'roomName',
      key: 'roomName',
    },
    {
      title: '创建者',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => formatDuration(duration),
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => formatFileSize(size),
    },
    {
      title: '分辨率',
      dataIndex: 'resolution',
      key: 'resolution',
      render: (resolution) => resolution || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          completed: 'success',
          processing: 'processing',
          failed: 'error',
        }
        const textMap = {
          completed: '已完成',
          processing: '处理中',
          failed: '失败',
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
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'completed' && (
            <Tooltip title="播放">
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handlePlay(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
        录制管理
      </h1>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索文件名或会议室"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            onChange={handleDateRangeChange}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadRecordings()}>
            刷新
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除 {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
          </Button>
        </Space>
      </Card>

      {/* 录制列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={recordings}
          rowKey="id"
          loading={recordingsLoading}
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            total: recordingsTotal,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  )
}

export default Recordings
