'use client'

import Link from 'next/link'
import { Star, Braces, Image, FileText, Key, Clock, Code, Database, Hash, Lock, Shield, CalendarClock, Link2, HelpCircle } from 'lucide-react'
import { Tool } from '@/lib/types'
import { useStore } from '@/store/useStore'
import { useFavorites } from '@/store/useFavorites'
import { cn } from '@/lib/utils'

interface ToolCardProps {
  tool: Tool
  onFavoriteToggle?: (toolSlug: string) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Braces,
  Image,
  FileText,
  Key,
  Clock,
  Code,
  Database,
  Hash,
  Lock,
  Shield,
  CalendarClock,
  Link2,
}

export default function ToolCard({ tool, onFavoriteToggle }: ToolCardProps) {
  const { addRecentTool } = useStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const isFav = isFavorite(tool.slug)

  // 获取图标组件
  const IconComponent = iconMap[tool.icon] || HelpCircle

  const handleClick = () => {
    addRecentTool(tool.slug)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isFav) {
      removeFavorite(tool.slug)
    } else {
      addFavorite(tool.slug)
    }
    onFavoriteToggle?.(tool.slug)
  }

  return (
    <Link
      href={`/tool/${tool.slug}`}
      onClick={handleClick}
      className="group block"
    >
      <div
        className={cn(
          'relative p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
          'hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer',
          'h-full flex flex-col'
        )}
      >
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-md transition-colors z-10',
            isFav
              ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
        >
          <Star className={cn('w-3.5 h-3.5', isFav && 'fill-current')} />
        </button>

        {/* Icon */}
        <div className="mb-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {tool.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex-1 line-clamp-2">
          {tool.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tool.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

