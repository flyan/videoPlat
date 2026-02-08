import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Input,
  DatePicker,
  Card,
  Typography,
} from 'antd'
import {
  PlayCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getRecordings, deleteRecording, getRecordingStreamUrl } from '../services/recording'
import VideoPlayer from '../components/VideoPlayer'

const { RangePicker } = DatePicker
const { Title } = Typography

const Recordings = () => {
  const navigate = useNavigate()
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(false)
  const [playerVisible, setPlayerVisible] = useState(false)
  const [currentRecording, setCurrentRecording] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState(null)

  // 加载录制列表
  const loadRecordings = async () => {
    setLoading(true)
    try {
      const params = {}
      if (searchText) {
        params.roomName = searchText
      }
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD')
        params.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      const data = await getRecordings(params)
      setRecordings(data)
    } catch (error) {
      message.error(error.message || '加载录制列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecordings()
  }, [])

  // 播放录制
  const handlePlay = (recording) => {
    setCurrentRecording(recording)
    setPlayerVisible(true)
  }

  // 下载录制
  const handleDownload = (recording) => {
    const url = getRecordingStreamUrl(recording.id)
    const link = document.createElement('a')
    link.href = url
    link.download = `${recording.roomName}_${dayjs(recording.startedAt).format('YYYYMMDD_HHmmss')}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('开始下载')
  }

  // 删除录制
  const handleDelete = (recording) => {
    Modal.confirm({
      title: '删除录制',
      content: `确定要删除录制"${recording.roomName}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteRecording(recording.id)
          message.success('删除成功')
          loadRecordings()
        } catch (error) {
          message.error(error.message || '删除失败')
        }
      },
    })
  }

  // 搜索
  const handleSearch = () => {
    loadRecordings()
  }

  // 格式化时长
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const columns = [
    {
      title: '会议名称',
      dataIndex: 'roomName',
      key: 'roomName',
    },
    {
      title: '录制时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => dayjs(a.startedAt).unix() - dayjs(b.startedAt).unix(),
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
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlay(record)}
          >
            播放
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={3} className="!mb-0">
                录制记录
              </Title>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/')}
              >
                返回首页
              </Button>
            </div>

            <Space className="w-full" direction="vertical" size="middle">
              <Space wrap>
                <Input
                  placeholder="搜索会议名称"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  style={{ width: 200 }}
                  prefix={<SearchOutlined />}
                />
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder={['开始日期', '结束日期']}
                />
                <Button type="primary" onClick={handleSearch}>
                  搜索
                </Button>
                <Button onClick={() => {
                  setSearchText('')
                  setDateRange(null)
                  loadRecordings()
                }}>
                  重置
                </Button>
              </Space>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={recordings}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      </div>

      {/* 视频播放器弹窗 */}
      <Modal
        title={currentRecording?.roomName}
        open={playerVisible}
        onCancel={() => {
          setPlayerVisible(false)
          setCurrentRecording(null)
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {currentRecording && (
          <VideoPlayer
            src={getRecordingStreamUrl(currentRecording.id)}
            poster={null}
          />
        )}
      </Modal>
    </div>
  )
}

export default Recordings
