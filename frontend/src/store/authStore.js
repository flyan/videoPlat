import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 认证状态管理
 *
 * 管理用户登录状态、Token 和用户信息，数据持久化到 localStorage
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      // 当前登录用户信息
      user: null,

      // JWT Token
      token: null,

      // 是否已认证
      isAuthenticated: false,

      /**
       * 登录操作
       */
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },

      /**
       * 登出操作
       */
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      /**
       * 更新用户信息
       */
      updateUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
