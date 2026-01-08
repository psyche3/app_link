'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import { useStore } from '@/store/useStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useStore()
  const pathname = usePathname()

  // 登录和注册页面不需要 Header 和 Sidebar
  const isAuthPage = pathname === '/login' || pathname === '/register'

  useEffect(() => {
    // 应用主题
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 transition-colors flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

