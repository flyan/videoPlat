import { useEffect, useRef } from 'react'
import clsx from 'clsx'

/**
 * 视频网格组件
 *
 * 以网格布局展示本地和远程用户的视频流
 *
 * @param {Object} props
 * @param {Object} props.localVideoTrack - 本地视频轨道
 * @param {Array} props.remoteUsers - 远程用户列表
 * @param {Object} props.localUser - 本地用户信息
 */
const VideoGrid = ({ localVideoTrack, remoteUsers, localUser }) => {
  const localVideoRef = useRef(null)

  /**
   * 播放本地视频流
   */
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current)
    }

    return () => {
      if (localVideoTrack) {
        localVideoTrack.stop()
      }
    }
  }, [localVideoTrack])

  const totalUsers = remoteUsers.length + 1
  const gridClass = clsx('participants-grid', `grid-${totalUsers}`)

  return (
    <div className={gridClass}>
      {/* 本地视频 */}
      <div className="participant-card">
        {localUser.videoEnabled ? (
          <div ref={localVideoRef} className="video-container" />
        ) : (
          <div className="video-container flex items-center justify-center">
            <div className="text-white text-4xl">
              {localUser.nickname?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
        <div className="participant-info">
          {localUser.nickname} (我)
          {!localUser.audioEnabled && ' 🔇'}
        </div>
      </div>

      {/* 远程用户视频 */}
      {remoteUsers.map((user) => (
        <RemoteVideo key={user.uid} user={user} />
      ))}
    </div>
  )
}

/**
 * 远程用户视频组件
 *
 * @param {Object} props
 * @param {Object} props.user - 远程用户信息（包含 videoTrack 和 audioTrack）
 */
const RemoteVideo = ({ user }) => {
  const videoRef = useRef(null)
  const audioRef = useRef(null)

  /**
   * 播放远程用户的视频流
   */
  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current)
    }

    return () => {
      if (user.videoTrack) {
        user.videoTrack.stop()
      }
    }
  }, [user.videoTrack])

  /**
   * 播放远程用户的音频流
   */
  useEffect(() => {
    if (user.audioTrack && audioRef.current) {
      user.audioTrack.play()
    }

    return () => {
      if (user.audioTrack) {
        user.audioTrack.stop()
      }
    }
  }, [user.audioTrack])

  return (
    <div className="participant-card">
      {user.videoTrack ? (
        <div ref={videoRef} className="video-container" />
      ) : (
        <div className="video-container flex items-center justify-center">
          <div className="text-white text-4xl">
            {String(user.uid)?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      )}
      <div className="participant-info">
        用户 {user.uid}
        {!user.audioTrack && ' 🔇'}
      </div>
      <audio ref={audioRef} />
    </div>
  )
}

export default VideoGrid
