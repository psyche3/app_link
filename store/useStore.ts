import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * 全局应用状态管理
 * 包含：主题、收藏夹、最近使用、语言设置
 */
interface AppState {
  // 主题
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void

  // 收藏夹
  favorites: string[]
  addFavorite: (toolSlug: string) => void
  removeFavorite: (toolSlug: string) => void
  isFavorite: (toolSlug: string) => boolean

  // 最近使用
  recentTools: string[]
  addRecentTool: (toolSlug: string) => void

  // 语言
  language: 'zh' | 'en'
  setLanguage: (lang: 'zh' | 'en') => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 主题
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // 收藏夹
      favorites: [],
      addFavorite: (toolSlug) =>
        set((state) => {
          if (state.favorites.includes(toolSlug)) {
            return state
          }
          return {
            favorites: [...state.favorites, toolSlug],
          }
        }),
      removeFavorite: (toolSlug) =>
        set((state) => ({
          favorites: state.favorites.filter((slug) => slug !== toolSlug),
        })),
      isFavorite: (toolSlug) => get().favorites.includes(toolSlug),

      // 最近使用
      recentTools: [],
      addRecentTool: (toolSlug) =>
        set((state) => {
          const filtered = state.recentTools.filter((slug) => slug !== toolSlug)
          return {
            recentTools: [toolSlug, ...filtered].slice(0, 10),
          }
        }),

      // 语言
      language: 'zh',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'devtoolhub-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

