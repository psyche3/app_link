import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import {
  signIn as signInApi,
  signUp as signUpApi,
  signOut as signOutApi,
  getCurrentUser,
  getCurrentSession,
} from '@/lib/auth'

/**
 * 用户认证状态管理
 */
interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // 认证操作
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      signIn: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await signInApi(email, password)

          if (response.error) {
            set({
              error: response.error.message,
              isLoading: false,
            })
            return false
          }

          if (!response.user || !response.session) {
            set({
              error: '登录失败：未获取到用户信息',
              isLoading: false,
            })
            return false
          }

          set({
            user: response.user,
            session: response.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // 登录成功后，重新检查认证状态以确保同步
          setTimeout(() => {
            get().checkAuth()
          }, 100)

          return true
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登录失败',
            isLoading: false,
          })
          return false
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await signUpApi(email, password)

          if (response.error) {
            set({
              error: response.error.message,
              isLoading: false,
            })
            return false
          }

          // 注册成功，即使需要邮箱验证（user 可能为 null）
          // 如果启用了邮箱验证，user 可能为 null，但注册仍然成功
          if (response.user) {
            set({
              user: response.user,
              session: response.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            // 需要邮箱验证的情况
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
            // 返回 true 表示注册成功，但需要验证邮箱
            return true
          }

          return true
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '注册失败',
            isLoading: false,
          })
          return false
        }
      },

      signOut: async () => {
        set({ isLoading: true })

        try {
          const { error } = await signOutApi()

          if (error) {
            set({
              error: error.message,
              isLoading: false,
            })
            return
          }

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登出失败',
            isLoading: false,
          })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })

        try {
          const [user, session] = await Promise.all([
            getCurrentUser(),
            getCurrentSession(),
          ])

          set({
            user,
            session,
            isAuthenticated: !!user && !!session,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // 检查认证状态失败时，静默处理（可能是用户未登录）
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // 不设置错误，因为用户未登录是正常情况
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

