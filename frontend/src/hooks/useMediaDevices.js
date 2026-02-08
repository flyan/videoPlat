import { useState, useEffect } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'

export const useMediaDevices = () => {
  const [cameras, setCameras] = useState([])
  const [microphones, setMicrophones] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [selectedMicrophone, setSelectedMicrophone] = useState(null)
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)

  // 获取设备列表
  const getDevices = async () => {
    try {
      const devices = await AgoraRTC.getDevices()

      const cameraDevices = devices.filter(d => d.kind === 'videoinput')
      const microphoneDevices = devices.filter(d => d.kind === 'audioinput')
      const speakerDevices = devices.filter(d => d.kind === 'audiooutput')

      setCameras(cameraDevices)
      setMicrophones(microphoneDevices)
      setSpeakers(speakerDevices)

      // 设置默认设备
      if (cameraDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(cameraDevices[0].deviceId)
      }
      if (microphoneDevices.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(microphoneDevices[0].deviceId)
      }
      if (speakerDevices.length > 0 && !selectedSpeaker) {
        setSelectedSpeaker(speakerDevices[0].deviceId)
      }
    } catch (error) {
      console.error('获取设备列表失败:', error)
    }
  }

  // 请求设备权限
  const requestPermissions = async () => {
    try {
      await AgoraRTC.getCameras()
      await AgoraRTC.getMicrophones()
      return true
    } catch (error) {
      console.error('请求设备权限失败:', error)
      return false
    }
  }

  // 切换摄像头
  const switchCamera = async (videoTrack, deviceId) => {
    if (videoTrack) {
      await videoTrack.setDevice(deviceId)
      setSelectedCamera(deviceId)
    }
  }

  // 切换麦克风
  const switchMicrophone = async (audioTrack, deviceId) => {
    if (audioTrack) {
      await audioTrack.setDevice(deviceId)
      setSelectedMicrophone(deviceId)
    }
  }

  useEffect(() => {
    getDevices()

    // 监听设备变化
    const handleDeviceChange = () => {
      getDevices()
    }

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [])

  return {
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    getDevices,
    requestPermissions,
    switchCamera,
    switchMicrophone,
  }
}
