import { create } from 'zustand'

export const useRoomStore = create((set, get) => ({
  // 会议室信息
  roomInfo: null,
  participants: [],
  isHost: false,

  // 本地媒体状态
  localAudioEnabled: true,
  localVideoEnabled: true,
  isScreenSharing: false,

  // 录制状态
  isRecording: false,
  recordingId: null,

  // 设置会议室信息
  setRoomInfo: (roomInfo) => set({ roomInfo }),

  // 设置参与者列表
  setParticipants: (participants) => set({ participants }),

  // 添加参与者
  addParticipant: (participant) => {
    const { participants } = get()
    if (!participants.find(p => p.userId === participant.userId)) {
      set({ participants: [...participants, participant] })
    }
  },

  // 移除参与者
  removeParticipant: (userId) => {
    const { participants } = get()
    set({ participants: participants.filter(p => p.userId !== userId) })
  },

  // 设置主持人状态
  setIsHost: (isHost) => set({ isHost }),

  // 切换本地音频
  toggleLocalAudio: () => {
    const { localAudioEnabled } = get()
    set({ localAudioEnabled: !localAudioEnabled })
  },

  // 切换本地视频
  toggleLocalVideo: () => {
    const { localVideoEnabled } = get()
    set({ localVideoEnabled: !localVideoEnabled })
  },

  // 设置屏幕共享状态
  setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),

  // 设置录制状态
  setRecording: (isRecording, recordingId = null) => {
    set({ isRecording, recordingId })
  },

  // 重置会议室状态
  resetRoom: () => {
    set({
      roomInfo: null,
      participants: [],
      isHost: false,
      localAudioEnabled: true,
      localVideoEnabled: true,
      isScreenSharing: false,
      isRecording: false,
      recordingId: null,
    })
  },
}))
