import { useState, useEffect, useRef } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { message } from 'antd'

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID

/**
 * WebRTC 连接管理 Hook
 *
 * 管理 Agora RTC 客户端的生命周期，包括加入/离开频道、发布/订阅流
 *
 * @param {string} roomId - 会议室 ID（频道名称）
 * @param {string} userId - 用户 ID
 * @param {string} token - Agora RTC Token
 * @returns {Object} { client, localAudioTrack, localVideoTrack, remoteUsers, isJoined, isPublished, joinChannel, leaveChannel, toggleAudio, toggleVideo, startScreenShare, stopScreenShare }
 */
export const useWebRTC = (roomId, userId, token) => {
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }))
  const [localAudioTrack, setLocalAudioTrack] = useState(null)
  const [localVideoTrack, setLocalVideoTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState([])
  const [isJoined, setIsJoined] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  /**
   * 加入频道并发布本地音视频流
   */
  const joinChannel = async () => {
    try {
      if (!AGORA_APP_ID) {
        throw new Error('Agora App ID 未配置')
      }

      // 加入频道
      await client.join(AGORA_APP_ID, roomId, token, userId)
      setIsJoined(true)

      // 创建本地音视频轨道
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      setLocalAudioTrack(audioTrack)
      setLocalVideoTrack(videoTrack)

      // 发布本地轨道
      await client.publish([audioTrack, videoTrack])
      setIsPublished(true)

      message.success('成功加入会议')
    } catch (error) {
      console.error('加入频道失败:', error)
      message.error(`加入会议失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 离开频道并清理本地资源
   */
  const leaveChannel = async () => {
    try {
      // 关闭本地轨道
      if (localAudioTrack) {
        localAudioTrack.close()
        setLocalAudioTrack(null)
      }
      if (localVideoTrack) {
        localVideoTrack.close()
        setLocalVideoTrack(null)
      }

      // 离开频道
      await client.leave()
      setIsJoined(false)
      setIsPublished(false)
      setRemoteUsers([])

      message.info('已离开会议')
    } catch (error) {
      console.error('离开频道失败:', error)
      message.error(`离开会议失败: ${error.message}`)
    }
  }

  /**
   * 切换音频开关
   */
  const toggleAudio = async (enabled) => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(enabled)
    }
  }

  /**
   * 切换视频开关
   */
  const toggleVideo = async (enabled) => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(enabled)
    }
  }

  /**
   * 开始屏幕共享
   * 会暂停摄像头视频流，改为发布屏幕共享流
   */
  const startScreenShare = async () => {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack()

      // 取消发布摄像头视频
      if (localVideoTrack && isPublished) {
        await client.unpublish([localVideoTrack])
      }

      // 发布屏幕共享
      await client.publish([screenTrack])

      // 监听用户主动停止屏幕共享（点击浏览器的停止共享按钮）
      screenTrack.on('track-ended', () => {
        stopScreenShare()
      })

      return screenTrack
    } catch (error) {
      console.error('开始屏幕共享失败:', error)
      message.error(`屏幕共享失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 停止屏幕共享
   * 恢复摄像头视频流
   */
  const stopScreenShare = async (screenTrack) => {
    try {
      if (screenTrack) {
        await client.unpublish([screenTrack])
        screenTrack.close()
      }

      // 重新发布摄像头视频
      if (localVideoTrack) {
        await client.publish([localVideoTrack])
      }
    } catch (error) {
      console.error('停止屏幕共享失败:', error)
      message.error(`停止屏幕共享失败: ${error.message}`)
    }
  }

  /**
   * 监听远程用户的发布/取消发布/离开事件
   */
  useEffect(() => {
    if (!client) return

    // 远程用户发布音视频流
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType)

      setRemoteUsers((prevUsers) => {
        const existingUser = prevUsers.find(u => u.uid === user.uid)
        if (existingUser) {
          return prevUsers.map(u =>
            u.uid === user.uid
              ? { ...u, [mediaType === 'audio' ? 'audioTrack' : 'videoTrack']: user[`${mediaType}Track`] }
              : u
          )
        } else {
          return [...prevUsers, {
            uid: user.uid,
            audioTrack: mediaType === 'audio' ? user.audioTrack : null,
            videoTrack: mediaType === 'video' ? user.videoTrack : null,
          }]
        }
      })
    }

    // 远程用户取消发布音视频流
    const handleUserUnpublished = (user, mediaType) => {
      setRemoteUsers((prevUsers) =>
        prevUsers.map(u =>
          u.uid === user.uid
            ? { ...u, [mediaType === 'audio' ? 'audioTrack' : 'videoTrack']: null }
            : u
        )
      )
    }

    // 远程用户离开频道
    const handleUserLeft = (user) => {
      setRemoteUsers((prevUsers) => prevUsers.filter(u => u.uid !== user.uid))
    }

    client.on('user-published', handleUserPublished)
    client.on('user-unpublished', handleUserUnpublished)
    client.on('user-left', handleUserLeft)

    return () => {
      client.off('user-published', handleUserPublished)
      client.off('user-unpublished', handleUserUnpublished)
      client.off('user-left', handleUserLeft)
    }
  }, [client])

  return {
    client,
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isJoined,
    isPublished,
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  }
}
