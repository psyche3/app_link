'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { useToolHistory } from '@/store/useToolHistory'
import { useAuth } from '@/store/useAuth'
import { tools } from '@/lib/tools'
import { Tool } from '@/lib/types'
import { Clock, RefreshCw, Trash2, Calendar, Grid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'calendar'

export default function HistoryPage() {
  const { history, loadHistoryFromCloud, syncHistory, clearHistory, isLoading } = useToolHistory()
  const { isAuthenticated } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    // 清理无效记录（工具已删除或时间戳异常）
    useToolHistory.getState().cleanupHistory()

    if (isAuthenticated) {
      loadHistoryFromCloud()
    }
  }, [isAuthenticated, loadHistoryFromCloud])

  const historyWithTools = useMemo(() => {
    return history
      .map((item) => {
        const tool = tools.find((t) => t.slug === item.toolSlug)
        const isValidDate = item.timestamp && !Number.isNaN(new Date(item.timestamp).getTime())
        if (!tool || !isValidDate) return null
        return { ...item, tool }
      })
      .filter(
        (item): item is { toolSlug: string; timestamp: string; tool: Tool } => item !== null
      )
  }, [history])

  // 按日期分组
  type HistoryItem = { toolSlug: string; timestamp: string; tool: Tool }
  const groupedByDate = useMemo(() => {
    const groups: Record<string, HistoryItem[]> = {}
    
    historyWithTools.forEach((item) => {
      const date = new Date(item.timestamp)
      if (Number.isNaN(date.getTime())) return

      const dateKey = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })

    // 按日期排序（最新的在前）
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].timestamp)
      const dateB = new Date(b[1][0].timestamp)
      return dateB.getTime() - dateA.getTime()
    })
  }, [historyWithTools])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateHeader = (dateKey: string) => {
    // dateKey 格式是 "2024年1月1日"，需要解析
    const match = dateKey.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    if (!match) return dateKey

    const [, year, month, day] = match
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const dateKeyFormatted = date.toLocaleDateString('zh-CN')
    const todayKey = today.toLocaleDateString('zh-CN')
    const yesterdayKey = yesterday.toLocaleDateString('zh-CN')

    if (dateKeyFormatted === todayKey) return '今天'
    if (dateKeyFormatted === yesterdayKey) return '昨天'
    return dateKey
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              使用历史
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              共 {historyWithTools.length} 条记录
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5",
                viewMode === 'grid'
                  ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Grid className="w-4 h-4" />
              图库
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5",
                viewMode === 'calendar'
                  ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Calendar className="w-4 h-4" />
              日历
            </button>
          </div>
          {isAuthenticated && (
            <button
              onClick={syncHistory}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '同步中...' : '同步到云端'}
            </button>
          )}
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空历史
          </button>
        </div>
      </div>

      {historyWithTools.length > 0 ? (
        viewMode === 'grid' ? (
          // 图库格式 - 按日期分组
          <div className="space-y-8">
            {groupedByDate.map(([dateKey, items]) => (
              <div key={dateKey} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {formatDateHeader(dateKey)}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({items.length} 个工具)
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {items.map((item, index) => {
                    const iconMap: Record<string, string> = {
                      Braces: '{}',
                      Image: '🖼️',
                      FileText: '📄',
                      Key: '🔑',
                      Clock: '⏰',
                      Code: '💻',
                      Database: '🗄️',
                      Hash: '#',
                      Lock: '🔒',
                      Shield: '🛡️',
                      CalendarClock: '📅',
                      Link2: '🔗',
                    }
                    const iconChar = (item.tool?.icon && iconMap[item.tool.icon]) || (item.tool?.name?.charAt(0) || '?')

                    return (
                      <Link
                        key={`${item.toolSlug}-${item.timestamp}-${index}`}
                        href={`/tool/${item.toolSlug}`}
                        className="group block"
                      >
                        <div className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
                          <div className="mb-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xl">{iconChar}</span>
                            </div>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {item.tool?.name || '未知工具'}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-1 line-clamp-2">
                            {item.tool?.description || ''}
                          </p>
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-[10px] text-gray-500 dark:text-gray-500">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 日历格式
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 space-y-6">
              {groupedByDate.map(([dateKey, items]) => (
                <div key={dateKey} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDateHeader(dateKey)}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {items.length} 个工具
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item, index) => (
                      <Link
                        key={`${item.toolSlug}-${item.timestamp}-${index}`}
                        href={`/tool/${item.toolSlug}`}
                        className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold">
                              {item.tool?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {item.tool?.name || '未知工具'}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {formatTime(item.timestamp)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            还没有使用历史记录
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            使用工具后，历史记录会显示在这里
          </p>
        </div>
      )}
    </div>
  )
}

