'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Star, Lock, Settings, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useToolHistory } from '@/store/useToolHistory'

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/favorites', label: '收藏夹', icon: Star },
  { href: '/history', label: '使用历史', icon: Clock },
  { href: '/passwords', label: '密码记事本', icon: Lock },
  { href: '/settings', label: '设置', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { favorites } = useStore()
  const { history } = useToolHistory()

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <nav className="flex-1 p-4 space-y-2 min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const badge = 
            (item.href === '/favorites' && favorites.length > 0) ||
            (item.href === '/history' && history.length > 0)
          const badgeCount = 
            item.href === '/favorites' ? favorites.length :
            item.href === '/history' ? history.length : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {badge && (
                <span className="ml-auto px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

