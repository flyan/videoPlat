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
import { startRecording, stopRecording } from '../services/recording'
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
   * 切换录制
   */
  const handleToggleRecording = async () => {
    if (!isHost) {
      message.warning('只有主持人可以控制录制')
      return
    }

    try {
      if (isRecording) {
        await stopRecording(roomId)
        setRecording(false)
        message.success('录制已停止')
      } else {
        const data = await startRecording(roomId)
        setRecording(true, data.recordingId)
        message.success('开始录制')
      }
    } catch (error) {
      message.error(error.message || '录制操作失败')
    }
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
   * 离开会议
   */
  const handleLeave = async () => {
    try {
      await leaveChannel()
      if (roomId) {
        await leaveRoom(roomId)
      }
      resetRoom()
      navigate('/')
    } catch (error) {
      console.error('离开会议失败:', error)
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
              <div className="empty-state">
                <MessageOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
                <p>暂无消息</p>
              </div>
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                placeholder="输入消息..."
                className="chat-input"
              />
              <Button type="primary">发送</Button>
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
