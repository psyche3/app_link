'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ToolGrid from '@/components/tools/ToolGrid'
import { tools, searchTools } from '@/lib/tools'
import { Tool } from '@/lib/types'
import { useStore } from '@/store/useStore'
import { Clock, Star } from 'lucide-react'

function HomeContent() {
  const searchParams = useSearchParams()
  const [displayedTools, setDisplayedTools] = useState<Tool[]>(tools)
  const [showHero, setShowHero] = useState(true)
  const { recentTools, favorites } = useStore()

  useEffect(() => {
    const search = searchParams.get('search')

    if (search) {
      setDisplayedTools(searchTools(search))
    } else {
      setDisplayedTools(tools)
    }
  }, [searchParams])

  useEffect(() => {
    const handleScroll = () => {
      // 当滚动超过 300px 时隐藏欢迎提示词
      setShowHero(window.scrollY < 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const recentToolsList = recentTools
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((tool): tool is Tool => tool !== undefined)
    .slice(0, 6)

  const favoriteToolsList = favorites
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((tool): tool is Tool => tool !== undefined)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      {showHero && (
        <div className="text-center py-12 transition-opacity duration-300">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            欢迎使用 DevToolHub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            一站式开发工具集合，提高你的开发效率
          </p>
        </div>
      )}

      {/* Recent Tools */}
      {recentToolsList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              最近使用
            </h2>
          </div>
          <ToolGrid tools={recentToolsList} />
        </section>
      )}

      {/* Favorite Tools */}
      {favoriteToolsList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              收藏的工具
            </h2>
          </div>
          <ToolGrid tools={favoriteToolsList} />
        </section>
      )}

      {/* All Tools */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          所有工具
        </h2>
        <ToolGrid tools={displayedTools} />
      </section>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
      <HomeContent />
    </Suspense>
  )
}
