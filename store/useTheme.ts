import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * 主题状态管理
 * 支持明暗模式和系统主题
 */
interface ThemeState {
  theme: 'light' | 'dark' | 'system'
  darkMode: boolean
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
  getEffectiveTheme: () => 'light' | 'dark'
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      darkMode: false,

      setTheme: (theme) => {
        if (typeof window === 'undefined') {
          set({ theme })
          return
        }

        let darkMode = false

        if (theme === 'system') {
          darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        } else {
          darkMode = theme === 'dark'
        }

        set({ theme, darkMode })

        // 立即应用主题
        document.documentElement.classList.toggle('dark', darkMode)

        // 监听系统主题变化
        if (theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          const handleChange = (e: MediaQueryListEvent) => {
            set({ darkMode: e.matches })
            document.documentElement.classList.toggle('dark', e.matches)
          }
          mediaQuery.addEventListener('change', handleChange)
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        if (theme === 'light') {
          get().setTheme('dark')
        } else if (theme === 'dark') {
          get().setTheme('light')
        } else {
          // system 模式下切换到 light
          get().setTheme('light')
        }
      },

      getEffectiveTheme: () => {
        if (typeof window === 'undefined') {
          return 'light'
        }
        const { theme, darkMode } = get()
        if (theme === 'system') {
          return darkMode ? 'dark' : 'light'
        }
        return theme
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

