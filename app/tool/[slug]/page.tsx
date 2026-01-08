'use client'

import { useEffect } from 'react'
import { getToolBySlug } from '@/lib/tools'
import { useToolHistory } from '@/store/useToolHistory'
import JsonFormatter from './components/JsonFormatter'
import PasswordGenerator from './components/PasswordGenerator'
import TimestampConverter from './components/TimestampConverter'
import RegexTester from './components/RegexTester'
import UuidGenerator from './components/UuidGenerator'
import JwtDecoder from './components/JwtDecoder'
import MockDataGenerator from './components/MockDataGenerator'
import EncryptionTool from './components/EncryptionTool'
import CronTool from './components/CronTool'
import UrlParser from './components/UrlParser'
import Link from 'next/link'

const toolComponents: Record<string, React.ComponentType> = {
  'json-formatter': JsonFormatter,
  'password-generator': PasswordGenerator,
  'timestamp-converter': TimestampConverter,
  'regex-tester': RegexTester,
  'uuid-generator': UuidGenerator,
  'jwt-decoder': JwtDecoder,
  'mock-data-generator': MockDataGenerator,
  'encryption-tool': EncryptionTool,
  'cron-generator': CronTool,
  'url-parser': UrlParser,
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const tool = getToolBySlug(slug)
  const { addHistory } = useToolHistory()

  // 记录工具使用历史
  useEffect(() => {
    if (tool) {
      addHistory(tool.slug)
    }
  }, [tool, addHistory])

  if (!tool) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          工具未找到
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          抱歉，没有找到该工具
        </p>
        <Link
          href="/"
          className="text-primary hover:underline"
        >
          返回首页
        </Link>
      </div>
    )
  }

  const ToolComponent = toolComponents[tool.slug]

  if (!ToolComponent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          该工具正在开发中...
        </p>
      </div>
    )
  }

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="pointer-events-none absolute top-0 left-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur px-3 py-2 rounded-md shadow-sm">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
          {tool.name}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-500 leading-snug">{tool.description}</p>
      </div>
      <div className="pt-12">
      <ToolComponent />
      </div>
    </div>
  )
}

