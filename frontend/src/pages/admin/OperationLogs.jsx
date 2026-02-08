import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
  DatePicker,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { useAdminStore } from '../../store/adminStore'
import { getOperationLogs, exportOperationLogs } from '../../services/admin'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

/**
 * 操作日志页面
 *
 * 显示系统操作日志，支持搜索、筛选、导出等功能
 */
function OperationLogs() {
  const {
    logs,
    logsTotal,
    logsLoading,
    setLogs,
    setLogsLoading,
  } = useAdminStore()

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState({
    keyword: '',
    action: 'all',
    startDate: null,
    endDate: null,
  })
  const [exporting, setExporting] = useState(false)

  // 加载操作日志
  const loadLogs = async (page = pagination.current, size = pagination.pageSize) => {
    setLogsLoading(true)
    try {
      const data = await getOperationLogs({
        page,
        size,
        ...filters,
      })
      setLogs(data.list || [], data.total || 0)
      setPagination({ ...pagination, current: page, pageSize: size })
    } catch (error) {
      message.error(error.message || '加载操作日志失败')
    } finally {
      setLogsLoading(false)
    }
  }

  // 搜索日志
  const handleSearch = (value) => {
    setFilters({ ...filters, keyword: value })
    setPagination({ ...pagination, current: 1 })
  }

  // 筛选操作类型
  const handleActionChange = (value) => {
    setFilters({ ...filters, action: value })
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

  // 导出日志
  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportOperationLogs(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `operation_logs_${new Date().getTime()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      message.success('导出成功')
    } catch (error) {
      message.error(error.message || '导出失败')
    } finally {
      setExporting(false)
    }
  }

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    loadLogs(newPagination.current, newPagination.pageSize)
  }

  useEffect(() => {
    loadLogs()
  }, [filters])

  // 操作类型映射
  const actionTypeMap = {
    login: { text: '登录', color: 'blue' },
    logout: { text: '登出', color: 'default' },
    create_room: { text: '创建会议室', color: 'green' },
    join_room: { text: '加入会议室', color: 'cyan' },
    leave_room: { text: '离开会议室', color: 'orange' },
    close_room: { text: '关闭会议室', color: 'red' },
    start_recording: { text: '开始录制', color: 'purple' },
    stop_recording: { text: '停止录制', color: 'magenta' },
    delete_recording: { text: '删除录制', color: 'volcano' },
    force_logout: { text: '强制下线', color: 'red' },
    disable_user: { text: '禁用用户', color: 'red' },
    enable_user: { text: '启用用户', color: 'green' },
    delete_user: { text: '删除用户', color: 'red' },
    update_config: { text: '更新配置', color: 'geekblue' },
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
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        const config = actionTypeMap[action] || { text: action, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '操作内容',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '目标对象',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (type, record) => {
        if (!type) return '-'
        return `${type}: ${record.targetId || '-'}`
      },
    },
    {
      title: 'IP 地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          success: 'success',
          failed: 'error',
        }
        const textMap = {
          success: '成功',
          failed: '失败',
        }
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>
      },
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
        操作日志
      </h1>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索操作人或操作内容"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
          <Select
            value={filters.action}
            style={{ width: 150 }}
            onChange={handleActionChange}
          >
            <Option value="all">全部操作</Option>
            <Option value="login">登录</Option>
            <Option value="logout">登出</Option>
            <Option value="create_room">创建会议室</Option>
            <Option value="join_room">加入会议室</Option>
            <Option value="leave_room">离开会议室</Option>
            <Option value="close_room">关闭会议室</Option>
            <Option value="start_recording">开始录制</Option>
            <Option value="stop_recording">停止录制</Option>
            <Option value="delete_recording">删除录制</Option>
            <Option value="force_logout">强制下线</Option>
            <Option value="disable_user">禁用用户</Option>
            <Option value="enable_user">启用用户</Option>
            <Option value="delete_user">删除用户</Option>
            <Option value="update_config">更新配置</Option>
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            onChange={handleDateRangeChange}
          />
          <Button icon={<ReloadOutlined />} onClick={() => loadLogs()}>
            刷新
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
          >
            导出
          </Button>
        </Space>
      </Card>

      {/* 日志列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={logsLoading}
          pagination={{
            ...pagination,
            total: logsTotal,
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

export default OperationLogs
