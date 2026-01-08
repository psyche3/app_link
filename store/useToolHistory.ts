import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { addToolHistory as addToolHistoryApi, getToolHistory as getToolHistoryApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { tools } from '@/lib/tools'

/**
 * 工具历史记录状态管理
 * 支持本地存储和 Supabase 云同步
 */
interface ToolHistoryState {
  history: Array<{
    toolSlug: string
    timestamp: string
  }>
  isLoading: boolean
  error: string | null

  // 本地操作
  addHistory: (toolSlug: string) => void
  clearHistory: () => void
  getRecentTools: (limit?: number) => string[]
  cleanupHistory: () => void

  // 云同步操作
  syncHistory: () => Promise<void>
  loadHistoryFromCloud: () => Promise<void>
}

export const useToolHistory = create<ToolHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      isLoading: false,
      error: null,

      addHistory: (toolSlug) => {
        const timestamp = new Date().toISOString()
        
        set((state) => {
          // 移除重复项
          const filtered = state.history.filter(
            (item) => item.toolSlug !== toolSlug
          )
          return {
            history: [
              { toolSlug, timestamp },
              ...filtered,
            ].slice(0, 50), // 最多保存 50 条记录
          }
        })

        // 如果用户已登录，同步到云端
        const syncToCloud = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            try {
              await addToolHistoryApi(user.id, toolSlug)
            } catch (error) {
              console.error('同步历史记录到云端失败:', error)
            }
          }
        }
        syncToCloud()
      },

      clearHistory: () => {
        set({ history: [] })
      },

      // 清理无效记录（无工具或时间戳非法）
      cleanupHistory: () => {
        set((state) => {
          const valid = state.history.filter((item) => {
            if (!item.toolSlug) return false
            const hasTool = tools.some((t) => t.slug === item.toolSlug)
            const tsOk = item.timestamp && !Number.isNaN(new Date(item.timestamp).getTime())
            return hasTool && tsOk
          })
          if (valid.length === state.history.length) return state
          return { ...state, history: valid }
        })
      },

      getRecentTools: (limit = 10) => {
        return get()
          .history.slice(0, limit)
          .map((item) => item.toolSlug)
      },

      // 同步历史记录到云端
      syncHistory: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const { history } = get()
          // 获取云端历史记录
          const cloudHistory = await getToolHistoryApi(user.id, 50)
          const cloudSlugs = cloudHistory.map((item: any) => item.tool_slug)

          // 合并本地和云端历史记录
          const allHistory = [...history]

          // 添加云端有但本地没有的
          for (const item of cloudHistory) {
            const exists = history.find(
              (h) => h.toolSlug === item.tool_slug && h.timestamp === item.timestamp
            )
            if (!exists) {
              allHistory.push({
                toolSlug: item.tool_slug,
                timestamp: item.timestamp,
              })
            }
          }

          // 同步本地有但云端没有的
          for (const item of history) {
            if (!cloudSlugs.includes(item.toolSlug)) {
              await addToolHistoryApi(user.id, item.toolSlug)
            }
          }

          // 按时间排序并更新
          allHistory.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )

          set({ history: allHistory.slice(0, 50) })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '同步失败',
          })
        } finally {
          set({ isLoading: false })
        }
      },

      // 从云端加载历史记录
      loadHistoryFromCloud: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const cloudHistory = await getToolHistoryApi(user.id, 50)
          const history = cloudHistory.map((item: any) => ({
            toolSlug: item.tool_slug,
            timestamp: item.timestamp,
          }))
          set({ history })
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
      name: 'tool-history-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

