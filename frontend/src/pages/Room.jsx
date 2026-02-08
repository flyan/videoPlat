import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Space, message, Modal, List, Avatar, Tooltip } from 'antd'
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
  const [participantsVisible, setParticipantsVisible] = useState(false)
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
   * 获取会议室信息、参与者列表和 Agora Token
   */
  useEffect(() => {
    const initRoom = async () => {
      try {
        // 获取会议室信息
        const room = await getRoomInfo(roomId)
        setRoomInfo(room)
        setIsHost(room.creatorId === user?.id)

        // 获取参与者列表
        const participantsList = await getParticipants(roomId)
        setParticipants(participantsList)

        // 获取 Agora Token
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

    // 组件卸载时清理，避免不必要的 API 调用
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
   * 同步本地音频状态到 Agora SDK
   */
  useEffect(() => {
    if (localAudioTrack) {
      toggleAudio(localAudioEnabled)
    }
  }, [localAudioEnabled, localAudioTrack])

  /**
   * 同步本地视频状态到 Agora SDK
   */
  useEffect(() => {
    if (localVideoTrack) {
      toggleVideo(localVideoEnabled)
    }
  }, [localVideoEnabled, localVideoTrack])

  /**
   * 切换音频开关
   */
  const handleToggleAudio = () => {
    toggleLocalAudio()
  }

  /**
   * 切换视频开关
   */
  const handleToggleVideo = () => {
    toggleLocalVideo()
  }

  /**
   * 开始/停止屏幕共享
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
   * 开始/停止录制（仅主持人）
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
   * 离开会议
   */
  const handleLeave = async () => {
    try {
      await leaveChannel()
      // 只有在 roomId 存在时才调用 API
      if (roomId) {
        await leaveRoom(roomId)
      }
      resetRoom()
      navigate('/')
    } catch (error) {
      console.error('离开会议失败:', error)
      // 即使出错也要导航回首页
      navigate('/')
    }
  }

  /**
   * 结束会议（仅主持人）
   * 所有参与者将被移出会议室
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
      <div className="h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 顶部信息栏 */}
      <div className="bg-gray-800 px-6 py-3 flex justify-between items-center">
        <div className="text-white">
          <h2 className="text-lg font-semibold">{roomInfo?.roomName}</h2>
          <p className="text-sm text-gray-400">会议 ID: {roomId}</p>
        </div>
        <Space>
          {isRecording && (
            <div className="recording-indicator">
              <span>录制中</span>
            </div>
          )}
          <Button
            icon={<TeamOutlined />}
            onClick={() => setParticipantsVisible(true)}
          >
            参与者 ({participants.length})
          </Button>
        </Space>
      </div>

      {/* 视频网格 */}
      <div className="flex-1 overflow-hidden">
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
      <div className="meeting-controls">
        <Tooltip title={localAudioEnabled ? '静音' : '取消静音'}>
          <Button
            type={localAudioEnabled ? 'default' : 'primary'}
            danger={!localAudioEnabled}
            shape="circle"
            size="large"
            icon={localAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={handleToggleAudio}
          />
        </Tooltip>

        <Tooltip title={localVideoEnabled ? '关闭摄像头' : '开启摄像头'}>
          <Button
            type={localVideoEnabled ? 'default' : 'primary'}
            danger={!localVideoEnabled}
            shape="circle"
            size="large"
            icon={localVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
            onClick={handleToggleVideo}
          />
        </Tooltip>

        <Tooltip title={isScreenSharing ? '停止共享' : '共享屏幕'}>
          <Button
            type={isScreenSharing ? 'primary' : 'default'}
            shape="circle"
            size="large"
            icon={<DesktopOutlined />}
            onClick={handleToggleScreenShare}
          />
        </Tooltip>

        {isHost && (
          <Tooltip title={isRecording ? '停止录制' : '开始录制'}>
            <Button
              type={isRecording ? 'primary' : 'default'}
              danger={isRecording}
              shape="circle"
              size="large"
              icon={isRecording ? <StopOutlined /> : <PlayCircleOutlined />}
              onClick={handleToggleRecording}
            />
          </Tooltip>
        )}

        <Tooltip title="离开会议">
          <Button
            danger
            shape="circle"
            size="large"
            icon={<PhoneOutlined />}
            onClick={handleLeave}
          />
        </Tooltip>

        {isHost && (
          <Button
            danger
            size="large"
            onClick={handleEndMeeting}
          >
            结束会议
          </Button>
        )}
      </div>

      {/* 参与者列表弹窗 */}
      <Modal
        title="参与者列表"
        open={participantsVisible}
        onCancel={() => setParticipantsVisible(false)}
        footer={null}
      >
        <List
          dataSource={participants}
          renderItem={(participant) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{participant.nickname?.[0] || 'U'}</Avatar>}
                title={participant.nickname}
                description={participant.isHost ? '主持人' : '参与者'}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}

export default Room
