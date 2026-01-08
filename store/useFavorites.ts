import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { addFavorite as addFavoriteApi, removeFavorite as removeFavoriteApi, getFavorites as getFavoritesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'

/**
 * 收藏夹状态管理
 * 支持本地存储和 Supabase 云同步
 */
interface FavoritesStore {
  favorites: string[] // 收藏的工具 slug 数组
  isLoading: boolean
  error: string | null
  
  // 本地操作
  addFavorite: (toolSlug: string) => void
  removeFavorite: (toolSlug: string) => void
  isFavorite: (toolSlug: string) => boolean
  
  // 云同步操作
  syncFavorites: () => Promise<void>
  loadFavoritesFromCloud: () => Promise<void>
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,

      addFavorite: (toolSlug) => {
        set((state) => {
          if (state.favorites.includes(toolSlug)) {
            return state
          }
          return {
            favorites: [...state.favorites, toolSlug],
          }
        })

        // 如果用户已登录，同步到云端
        const syncToCloud = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            try {
              await addFavoriteApi(user.id, toolSlug)
            } catch (error) {
              console.error('同步收藏到云端失败:', error)
            }
          }
        }
        syncToCloud()
      },

      removeFavorite: (toolSlug) => {
        set((state) => ({
          favorites: state.favorites.filter((slug) => slug !== toolSlug),
        }))

        // 如果用户已登录，同步到云端
        const syncToCloud = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            try {
              await removeFavoriteApi(user.id, toolSlug)
            } catch (error) {
              console.error('从云端删除收藏失败:', error)
            }
          }
        }
        syncToCloud()
      },

      isFavorite: (toolSlug) => {
        return get().favorites.includes(toolSlug)
      },

      // 同步收藏夹到云端
      syncFavorites: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const { favorites } = get()
          // 获取云端收藏
          const cloudFavorites = await getFavoritesApi(user.id)
          const cloudSlugs = cloudFavorites.map((fav: any) => fav.tool_slug)

          // 合并本地和云端收藏
          const allFavorites = Array.from(
            new Set([...favorites, ...cloudSlugs])
          )

          // 添加本地有但云端没有的
          for (const slug of favorites) {
            if (!cloudSlugs.includes(slug)) {
              await addFavoriteApi(user.id, slug)
            }
          }

          // 更新本地状态
          set({ favorites: allFavorites })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '同步失败',
          })
        } finally {
          set({ isLoading: false })
        }
      },

      // 从云端加载收藏
      loadFavoritesFromCloud: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const cloudFavorites = await getFavoritesApi(user.id)
          const slugs = cloudFavorites.map((fav: any) => fav.tool_slug)
          set({ favorites: slugs })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '加载失败',
          })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

