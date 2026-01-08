/**
 * 简化的用户状态管理
 * 用于管理当前登录用户的基本信息
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
}

interface UserStore {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useUser = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

