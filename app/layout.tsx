import type { Metadata } from 'next'
import './globals.css'
import Layout from '@/components/layout/Layout'

const themeInitializer = `
  (() => {
    try {
      const stored = localStorage.getItem('devtoolhub-storage')
      if (!stored) return
      const parsed = JSON.parse(stored)
      const theme = parsed?.state?.theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {
      // ignore init errors
    }
  })();
`

export const metadata: Metadata = {
  title: 'DevToolHub - 开发工具集合',
  description: '一个现代化的开发工具集合网站，提供 JSON 格式化、密码生成、PDF 转换等多种实用工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{ __html: themeInitializer }}
        />
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

