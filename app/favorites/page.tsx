'use client'

import { useMemo, useEffect } from 'react'
import ToolGrid from '@/components/tools/ToolGrid'
import { tools } from '@/lib/tools'
import { useFavorites } from '@/store/useFavorites'
import { useAuth } from '@/store/useAuth'
import { Tool } from '@/lib/types'
import { Star, RefreshCw } from 'lucide-react'

export default function FavoritesPage() {
  const { favorites, loadFavoritesFromCloud, syncFavorites, isLoading } = useFavorites()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadFavoritesFromCloud()
    }
  }, [isAuthenticated, loadFavoritesFromCloud])

  const favoriteTools = useMemo(() => {
    return favorites
      .map((slug) => tools.find((t) => t.slug === slug))
      .filter((tool): tool is Tool => tool !== undefined)
  }, [favorites])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              收藏夹
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              你收藏了 {favoriteTools.length} 个工具
            </p>
          </div>
        </div>
        {isAuthenticated && (
          <button
            onClick={syncFavorites}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '同步中...' : '同步到云端'}
          </button>
        )}
      </div>

      {favoriteTools.length > 0 ? (
        <ToolGrid tools={favoriteTools} />
      ) : (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            还没有收藏任何工具
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            点击工具卡片上的星标来收藏工具
          </p>
        </div>
      )}
    </div>
  )
}

