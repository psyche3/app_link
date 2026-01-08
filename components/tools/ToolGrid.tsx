'use client'

import { Tool } from '@/lib/types'
import ToolCard from './ToolCard'
import { useStore } from '@/store/useStore'

interface ToolGridProps {
  tools: Tool[]
}

export default function ToolGrid({ tools }: ToolGridProps) {
  const { addFavorite, removeFavorite } = useStore()

  const handleFavoriteToggle = (toolSlug: string) => {
    if (useStore.getState().isFavorite(toolSlug)) {
      removeFavorite(toolSlug)
    } else {
      addFavorite(toolSlug)
    }
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">没有找到工具</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onFavoriteToggle={handleFavoriteToggle}
        />
      ))}
    </div>
  )
}

