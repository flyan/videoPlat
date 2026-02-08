import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

/**
 * 视频播放器组件
 *
 * 基于 Video.js 的录制视频播放器
 *
 * @param {Object} props
 * @param {string} props.src - 视频源 URL
 * @param {string} props.poster - 视频封面图 URL
 */
const VideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)

  /**
   * 初始化 Video.js 播放器
   */
  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = videoRef.current

      playerRef.current = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
          volumePanel: {
            inline: false,
          },
        },
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [])

  /**
   * 更新播放器的视频源和封面
   */
  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.src({
        src,
        type: 'video/mp4',
      })

      if (poster) {
        playerRef.current.poster(poster)
      }
    }
  }, [src, poster])

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
      />
    </div>
  )
}

export default VideoPlayer
