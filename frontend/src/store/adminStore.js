import { create } from 'zustand'

/**
 * 管理台状态管理
 *
 * 管理管理台的数据状态，包括用户列表、会议室列表、录制列表等
 */
export const useAdminStore = create((set) => ({
  // 系统统计数据
  statistics: {
    totalUsers: 0,
    onlineUsers: 0,
    activeRooms: 0,
    totalRecordings: 0,
    storageUsed: 0,
  },

  // 用户列表
  users: [],
  usersTotal: 0,
  usersLoading: false,

  // 会议室列表
  rooms: [],
  roomsTotal: 0,
  roomsLoading: false,

  // 录制列表
  recordings: [],
  recordingsTotal: 0,
  recordingsLoading: false,

  // 操作日志列表
  logs: [],
  logsTotal: 0,
  logsLoading: false,

  /**
   * 设置系统统计数据
   */
  setStatistics: (statistics) => {
    set({ statistics })
  },

  /**
   * 设置用户列表
   */
  setUsers: (users, total) => {
    set({ users, usersTotal: total })
  },

  /**
   * 设置用户加载状态
   */
  setUsersLoading: (loading) => {
    set({ usersLoading: loading })
  },

  /**
   * 更新单个用户状态
   */
  updateUser: (userId, updates) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...updates } : user
      ),
    }))
  },

  /**
   * 删除用户
   */
  removeUser: (userId) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
      usersTotal: state.usersTotal - 1,
    }))
  },

  /**
   * 设置会议室列表
   */
  setRooms: (rooms, total) => {
    set({ rooms, roomsTotal: total })
  },

  /**
   * 设置会议室加载状态
   */
  setRoomsLoading: (loading) => {
    set({ roomsLoading: loading })
  },

  /**
   * 更新单个会议室状态
   */
  updateRoom: (roomId, updates) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room
      ),
    }))
  },

  /**
   * 删除会议室
   */
  removeRoom: (roomId) => {
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== roomId),
      roomsTotal: state.roomsTotal - 1,
    }))
  },

  /**
   * 设置录制列表
   */
  setRecordings: (recordings, total) => {
    set({ recordings, recordingsTotal: total })
  },

  /**
   * 设置录制加载状态
   */
  setRecordingsLoading: (loading) => {
    set({ recordingsLoading: loading })
  },

  /**
   * 删除录制
   */
  removeRecording: (recordingId) => {
    set((state) => ({
      recordings: state.recordings.filter((rec) => rec.id !== recordingId),
      recordingsTotal: state.recordingsTotal - 1,
    }))
  },

  /**
   * 设置操作日志列表
   */
  setLogs: (logs, total) => {
    set({ logs, logsTotal: total })
  },

  /**
   * 设置日志加载状态
   */
  setLogsLoading: (loading) => {
    set({ logsLoading: loading })
  },

  /**
   * 重置所有状态
   */
  reset: () => {
    set({
      statistics: {
        totalUsers: 0,
        onlineUsers: 0,
        activeRooms: 0,
        totalRecordings: 0,
        storageUsed: 0,
      },
      users: [],
      usersTotal: 0,
      usersLoading: false,
      rooms: [],
      roomsTotal: 0,
      roomsLoading: false,
      recordings: [],
      recordingsTotal: 0,
      recordingsLoading: false,
      logs: [],
      logsTotal: 0,
      logsLoading: false,
    })
  },
}))
