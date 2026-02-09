import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, message, Modal, Tooltip, Drawer } from 'antd'
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  DesktopOutlined,
  PhoneOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  StopOutlined,
  MessageOutlined,
  SettingOutlined,
  MoreOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { useWebRTC } from '../hooks/useWebRTC'
import { useRoomStore } from '../store/roomStore'
import { useAuthStore } from '../store/authStore'
import {
  getRoomInfo,
  leaveRoom,
  endRoom,
  getParticipants,
  getAgoraToken,
} from '../services/room'
// 录制功能已禁用
// import { startRecording, stopRecording } from '../services/recording'
import { sendChatMessage, getChatHistory } from '../services/chat'
import websocketService from '../services/websocket'
import VideoGrid from '../components/VideoGrid'
import './Room.css'

/**
 * 会议室页面组件
 *
 * 提供视频会议的核心功能：音视频通话、屏幕共享、录制等
 */
const Room = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    roomInfo,
    setRoomInfo,
    participants,
    setParticipants,
    isHost,
    setIsHost,
    localAudioEnabled,
    localVideoEnabled,
    toggleLocalAudio,
    toggleLocalVideo,
    isScreenSharing,
    setScreenSharing,
    isRecording,
    setRecording,
    resetRoom,
  } = useRoomStore()

  const [agoraToken, setAgoraToken] = useState(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [sidebarContent, setSidebarContent] = useState('participants')
  const [loading, setLoading] = useState(true)
  const screenTrackRef = useRef(null)

  // 聊天相关状态
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const chatMessagesEndRef = useRef(null)

  const {
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isJoined,
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC(roomId, user?.id, agoraToken)

  /**
   * 初始化会议室
   */
  useEffect(() => {
    const initRoom = async () => {
      try {
        const room = await getRoomInfo(roomId)
        setRoomInfo(room)
        setIsHost(room.creatorId === user?.id)

        const participantsList = await getParticipants(roomId)
        setParticipants(participantsList)

        const tokenData = await getAgoraToken(roomId, user?.id)
        setAgoraToken(tokenData.token)

        // 连接 WebSocket
        try {
          await websocketService.connect(user?.id)
          console.log('WebSocket 连接成功')
        } catch (error) {
          console.error('WebSocket 连接失败:', error)
          // 静默处理，不显示警告消息
        }

        // 加载聊天历史
        try {
          const history = await getChatHistory(roomId)
          if (history && history.length > 0) {
            setChatMessages(history)
          }
        } catch (error) {
          console.error('加载聊天历史失败:', error)
        }

        setLoading(false)
      } catch (error) {
        message.error(error.message || '加载会议室失败')
        navigate('/')
      }
    }

    if (roomId) {
      initRoom()
    }

    return () => {}
  }, [roomId])

  /**
   * 获取到 Token 后自动加入频道
   */
  useEffect(() => {
    if (agoraToken && !isJoined) {
      joinChannel()
    }
  }, [agoraToken])

  /**
   * 监听 WebSocket 消息
   */
  useEffect(() => {
    const handleChatMessage = (data) => {
      // 只处理当前会议室的消息
      if (data.roomId === roomId) {
        setChatMessages((prev) => [...prev, data])

        // 滚动到底部
        setTimeout(() => {
          chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)

        // 如果聊天面板未打开，显示新消息提示
        if (sidebarContent !== 'chat' || !sidebarVisible) {
          message.info(`${data.username}: ${data.content}`)
        }
      }
    }

    // 注册消息处理器
    websocketService.onMessage('chat', handleChatMessage)

    // 清理函数
    return () => {
      websocketService.offMessage('chat')
    }
  }, [roomId, sidebarContent, sidebarVisible])

  /**
   * 同步本地音频状态
   */
  useEffect(() => {
    if (localAudioTrack) {
      toggleAudio(localAudioEnabled)
    }
  }, [localAudioEnabled, localAudioTrack])

  /**
   * 同步本地视频状态
   */
  useEffect(() => {
    if (localVideoTrack) {
      toggleVideo(localVideoEnabled)
    }
  }, [localVideoEnabled, localVideoTrack])

  /**
   * 切换音频
   */
  const handleToggleAudio = () => {
    toggleLocalAudio()
  }

  /**
   * 切换视频
   */
  const handleToggleVideo = () => {
    toggleLocalVideo()
  }

  /**
   * 切换屏幕共享
   */
  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare(screenTrackRef.current)
        screenTrackRef.current = null
        setScreenSharing(false)
        message.info('已停止屏幕共享')
      } else {
        const screenTrack = await startScreenShare()
        screenTrackRef.current = screenTrack
        setScreenSharing(true)
        message.success('开始屏幕共享')
      }
    } catch (error) {
      message.error('屏幕共享操作失败')
    }
  }

  /**
   * 切换录制（已禁用）
   */
  const handleToggleRecording = async () => {
    message.warning('录制功能已禁用')
    return

    // 以下代码已禁用
    // if (!isHost) {
    //   message.warning('只有主持人可以控制录制')
    //   return
    // }

    // try {
    //   if (isRecording) {
    //     await stopRecording(roomId)
    //     setRecording(false)
    //     message.success('录制已停止')
    //   } else {
    //     const data = await startRecording(roomId)
    //     setRecording(true, data.recordingId)
    //     message.success('开始录制')
    //   }
    // } catch (error) {
    //   message.error(error.message || '录制操作失败')
    // }
  }

  /**
   * 复制会议 ID
   */
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    message.success('会议 ID 已复制')
  }

  /**
   * 打开侧边栏
   */
  const handleOpenSidebar = (content) => {
    setSidebarContent(content)
    setSidebarVisible(true)
  }

  /**
   * 发送聊天消息
   */
  const handleSendMessage = async () => {
    if (!chatInput.trim()) {
      return
    }

    try {
      // 通过 HTTP API 发送消息（后端会通过 WebSocket 广播）
      await sendChatMessage(roomId, chatInput.trim())
      setChatInput('')

      // 滚动到底部
      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('发送消息失败:', error)
      message.error('发送消息失败')
    }
  }

  /**
   * 处理输入框回车键
   */
  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * 离开会议
   */
  const handleLeave = async () => {
    try {
      await leaveChannel()
      if (roomId) {
        await leaveRoom(roomId)
      }
      // 断开 WebSocket
      websocketService.disconnect()
      resetRoom()
      navigate('/')
    } catch (error) {
      console.error('离开会议失败:', error)
      websocketService.disconnect()
      navigate('/')
    }
  }

  /**
   * 结束会议
   */
  const handleEndMeeting = () => {
    Modal.confirm({
      title: '结束会议',
      content: '确定要结束会议吗？所有参与者将被移出会议室。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await endRoom(roomId)
          await leaveChannel()
          websocketService.disconnect()
          resetRoom()
          message.success('会议已结束')
          navigate('/')
        } catch (error) {
          message.error(error.message || '结束会议失败')
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="room-loading">
        <div className="loading-spinner" />
        <p>正在加入会议...</p>
      </div>
    )
  }

  return (
    <div className="room-container">
      {/* 顶部信息栏 */}
      <header className="room-header">
        <div className="header-left">
          <h2 className="room-name">{roomInfo?.roomName}</h2>
          <div className="room-id-section">
            <span className="room-id-label">会议 ID:</span>
            <span className="room-id-value">{roomId}</span>
            <Tooltip title="复制会议 ID">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopyRoomId}
                className="copy-button"
              />
            </Tooltip>
          </div>
        </div>

        <div className="header-right">
          {isRecording && (
            <div className="recording-badge">
              <span className="recording-dot"></span>
              <span>录制中</span>
            </div>
          )}
          <Button
            icon={<TeamOutlined />}
            onClick={() => handleOpenSidebar('participants')}
            className="header-action-button"
          >
            参与者 ({participants.length})
          </Button>
        </div>
      </header>

      {/* 视频网格 */}
      <div className="room-video-area">
        <VideoGrid
          localVideoTrack={localVideoTrack}
          remoteUsers={remoteUsers}
          localUser={{
            uid: user?.id,
            nickname: user?.nickname || user?.username,
            audioEnabled: localAudioEnabled,
            videoEnabled: localVideoEnabled,
          }}
        />
      </div>

      {/* 底部控制栏 */}
      <div className="room-controls">
        <div className="controls-wrapper">
          {/* 主要控制 */}
          <div className="primary-controls">
            <Tooltip title={localAudioEnabled ? '静音' : '取消静音'}>
              <button
                className={`control-button ${!localAudioEnabled ? 'danger' : ''}`}
                onClick={handleToggleAudio}
              >
                <div className="button-icon">
                  {localAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
                </div>
                <span className="button-label">
                  {localAudioEnabled ? '静音' : '取消静音'}
                </span>
              </button>
            </Tooltip>

            <Tooltip title={localVideoEnabled ? '关闭摄像头' : '开启摄像头'}>
              <button
                className={`control-button ${!localVideoEnabled ? 'danger' : ''}`}
                onClick={handleToggleVideo}
              >
                <div className="button-icon">
                  {localVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                </div>
                <span className="button-label">
                  {localVideoEnabled ? '停止视频' : '开启视频'}
                </span>
              </button>
            </Tooltip>

            <Tooltip title={isScreenSharing ? '停止共享' : '共享屏幕'}>
              <button
                className={`control-button ${isScreenSharing ? 'active' : ''}`}
                onClick={handleToggleScreenShare}
              >
                <div className="button-icon">
                  <DesktopOutlined />
                </div>
                <span className="button-label">
                  {isScreenSharing ? '停止共享' : '共享屏幕'}
                </span>
              </button>
            </Tooltip>

            {isHost && (
              <Tooltip title={isRecording ? '停止录制' : '开始录制'}>
                <button
                  className={`control-button ${isRecording ? 'recording' : ''}`}
                  onClick={handleToggleRecording}
                >
                  <div className="button-icon">
                    {isRecording ? <StopOutlined /> : <PlayCircleOutlined />}
                  </div>
                  <span className="button-label">
                    {isRecording ? '停止录制' : '录制'}
                  </span>
                </button>
              </Tooltip>
            )}
          </div>

          {/* 次要控制 */}
          <div className="secondary-controls">
            <Tooltip title="聊天">
              <button
                className="control-button-small"
                onClick={() => handleOpenSidebar('chat')}
              >
                <MessageOutlined />
              </button>
            </Tooltip>

            <Tooltip title="设置">
              <button
                className="control-button-small"
                onClick={() => handleOpenSidebar('settings')}
              >
                <SettingOutlined />
              </button>
            </Tooltip>

            <Tooltip title="更多">
              <button className="control-button-small">
                <MoreOutlined />
              </button>
            </Tooltip>
          </div>

          {/* 离开按钮 */}
          <div className="leave-controls">
            <Tooltip title="离开会议">
              <button className="leave-button" onClick={handleLeave}>
                <PhoneOutlined />
                <span>离开</span>
              </button>
            </Tooltip>

            {isHost && (
              <button className="end-button" onClick={handleEndMeeting}>
                结束会议
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 侧边栏 */}
      <Drawer
        title={
          sidebarContent === 'participants'
            ? '参与者'
            : sidebarContent === 'chat'
            ? '聊天'
            : '设置'
        }
        placement="right"
        onClose={() => setSidebarVisible(false)}
        open={sidebarVisible}
        width={360}
        className="room-sidebar"
      >
        {sidebarContent === 'participants' && (
          <div className="participants-list">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-item">
                <div className="participant-avatar">
                  {participant.nickname?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="participant-details">
                  <div className="participant-name">{participant.nickname}</div>
                  <div className="participant-role">
                    {participant.isHost ? '主持人' : '参与者'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sidebarContent === 'chat' && (
          <div className="chat-panel">
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="empty-state">
                  <MessageOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                  <p>暂无消息</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-message ${msg.userId === user?.id ? 'own-message' : ''}`}
                    >
                      <div className="message-header">
                        <span className="message-username">{msg.username}</span>
                        <span className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="message-content">{msg.content}</div>
                    </div>
                  ))}
                  <div ref={chatMessagesEndRef} />
                </>
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                placeholder="输入消息..."
                className="chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
              />
              <Button type="primary" onClick={handleSendMessage}>
                发送
              </Button>
            </div>
          </div>
        )}

        {sidebarContent === 'settings' && (
          <div className="settings-panel">
            <div className="settings-section">
              <h3>音频设置</h3>
              <p>麦克风和扬声器设置</p>
            </div>
            <div className="settings-section">
              <h3>视频设置</h3>
              <p>摄像头和视频质量设置</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default Room
