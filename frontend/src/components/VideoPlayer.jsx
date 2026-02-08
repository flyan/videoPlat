import { useEffect, useRef } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const VideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)

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
