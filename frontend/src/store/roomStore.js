import { create } from 'zustand'

/**
 * 会议室状态管理
 *
 * 管理会议室信息、参与者列表、本地媒体状态和录制状态
 */
export const useRoomStore = create((set, get) => ({
  // 会议室基本信息
  roomInfo: null,

  // 参与者列表
  participants: [],

  // 当前用户是否为主持人
  isHost: false,

  // 本地音频是否开启
  localAudioEnabled: true,

  // 本地视频是否开启
  localVideoEnabled: true,

  // 是否正在屏幕共享
  isScreenSharing: false,

  // 是否正在录制
  isRecording: false,

  // 录制 ID
  recordingId: null,

  /**
   * 设置会议室信息
   */
  setRoomInfo: (roomInfo) => set({ roomInfo }),

  /**
   * 设置参与者列表
   */
  setParticipants: (participants) => set({ participants }),

  /**
   * 添加参与者
   */
  addParticipant: (participant) => {
    const { participants } = get()
    if (!participants.find(p => p.userId === participant.userId)) {
      set({ participants: [...participants, participant] })
    }
  },

  /**
   * 移除参与者
   */
  removeParticipant: (userId) => {
    const { participants } = get()
    set({ participants: participants.filter(p => p.userId !== userId) })
  },

  /**
   * 设置主持人状态
   */
  setIsHost: (isHost) => set({ isHost }),

  /**
   * 切换本地音频开关
   */
  toggleLocalAudio: () => {
    const { localAudioEnabled } = get()
    set({ localAudioEnabled: !localAudioEnabled })
  },

  /**
   * 切换本地视频开关
   */
  toggleLocalVideo: () => {
    const { localVideoEnabled } = get()
    set({ localVideoEnabled: !localVideoEnabled })
  },

  /**
   * 设置屏幕共享状态
   */
  setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),

  /**
   * 设置录制状态
   */
  setRecording: (isRecording, recordingId = null) => {
    set({ isRecording, recordingId })
  },

  /**
   * 重置会议室状态
   * 在离开会议室时调用
   */
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
