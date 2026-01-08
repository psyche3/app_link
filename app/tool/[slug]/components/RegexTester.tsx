'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatchResult {
  text: string
  index: number
  groups: string[]
}

const flagOptions = ['g', 'i', 'm', 's', 'u', 'y']

const regexTemplates = [
  {
    name: '邮箱',
    pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
    flags: 'i',
    sample: 'dev@example.com',
    description: '匹配常见邮箱地址',
  },
  {
    name: '手机号（中国）',
    pattern: '^1[3-9]\\d{9}$',
    flags: '',
    sample: '13800138000',
    description: '匹配大陆手机号',
  },
  {
    name: '身份证',
    pattern: '^\\d{6}(18|19|20)?\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    flags: '',
    sample: '110105199001011234',
    description: '匹配 18 位身份证号码',
  },
  {
    name: 'URL',
    pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*',
    flags: 'i',
    sample: '访问 https://devtoolhub.com 了解更多。',
    description: '匹配以 http/https 开头的 URL',
  },
  {
    name: 'IPv4',
    pattern: '^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}$',
    flags: '',
    sample: '192.168.1.1',
    description: '匹配 IPv4 地址',
  },
]

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flags, setFlags] = useState('g')
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!pattern.trim()) {
      setMatches([])
      setError('')
      return
    }

    try {
      // 清理 flags，移除重复和无效字符
      const cleanFlags = flags
        .split('')
        .filter((f, index, self) => self.indexOf(f) === index)
        .filter((f) => flagOptions.includes(f))
        .join('')
      
      // 先验证正则表达式是否有效（即使没有测试文本）
      const regex = new RegExp(pattern, cleanFlags || undefined)
      
      // 如果没有测试文本，只验证正则表达式是否有效
      // 注意：保留原始文本，不进行 trim，以支持匹配空格和换行
      if (testString.length === 0) {
        setMatches([])
        setError('')
        return
      }
      
      // 如果使用 matchAll，需要确保有 g 标志
      const flagsForMatchAll = cleanFlags.includes('g') 
        ? cleanFlags 
        : (cleanFlags + 'g').split('').filter((f, i, s) => s.indexOf(f) === i).join('')
      
      const regexForMatchAll = new RegExp(pattern, flagsForMatchAll || undefined)
      
      const allMatches = Array.from(testString.matchAll(regexForMatchAll)).map((match) => ({
        text: match[0],
        index: match.index ?? 0,
        groups: match.slice(1),
      }))
      setMatches(allMatches)
      setError('')
    } catch (err) {
      setMatches([])
      const errorMessage = err instanceof Error ? err.message : '无效的正则表达式，请检查语法'
      setError(`无效的正则表达式：${errorMessage}`)
    }
  }, [pattern, flags, testString])

  const handleFlagToggle = (flag: string) => {
    setFlags((prev) => {
      if (prev.includes(flag)) {
        return prev
          .split('')
          .filter((f) => f !== flag)
          .join('')
      }
      return (prev + flag)
        .split('')
        .filter((value, index, self) => self.indexOf(value) === index)
        .join('')
    })
  }

  const highlightedContent = useMemo(() => {
    if (!testString) {
      return <span className="text-gray-400">输入文本以查看高亮效果</span>
    }

    if (matches.length === 0) {
      return <span className="text-gray-400">没有匹配结果</span>
    }

    const nodes: React.ReactNode[] = []
    let lastIndex = 0

    matches.forEach((match, idx) => {
      const start = match.index
      const end = match.index + match.text.length
      
      // 处理匹配前的文本（保留所有空格和换行）
      const beforeText = testString.slice(lastIndex, start)
      if (beforeText) {
        nodes.push(<span key={`text-${idx}`} style={{ whiteSpace: 'pre-wrap' }}>{beforeText}</span>)
      }
      
      // 处理匹配的文本（保留所有空格和换行）
      nodes.push(
        <mark
          key={`mark-${idx}`}
          className="bg-yellow-200 dark:bg-yellow-600 rounded px-1 text-gray-900 dark:text-white"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {match.text}
        </mark>
      )
      lastIndex = end
    })
    
    // 处理剩余的文本（保留所有空格和换行）
    const remainingText = testString.slice(lastIndex)
    if (remainingText) {
      nodes.push(<span key="tail" style={{ whiteSpace: 'pre-wrap' }}>{remainingText}</span>)
    }
    
    return nodes
  }, [matches, testString])

  const applyTemplate = (template: typeof regexTemplates[number]) => {
    setPattern(template.pattern)
    setFlags(template.flags)
    if (template.sample) {
      setTestString(template.sample)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">正则表达式</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="例如：\\d+"
              className="w-full p-3 font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">标志 (flags)</label>
            <div className="flex flex-wrap gap-2">
              {flagOptions.map((flag) => (
                <button
                  type="button"
                  key={flag}
                  onClick={() => handleFlagToggle(flag)}
                  className={cn(
                    'px-3 py-1 rounded-full border text-sm',
                    flags.includes(flag)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                  )}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">测试文本</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="输入要测试的文本..."
              className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">匹配结果</label>
            <div className="h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-auto">
              {matches.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">找到 {matches.length} 个匹配</p>
                  {matches.map((match, index) => (
                    <div
                      key={`${match.text}-${match.index}-${index}`}
                      className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{match.text}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">位置：{match.index}</span>
                      </div>
                      {match.groups.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-x-1">
                          分组：
                          {match.groups.map((group, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                              {group || '空'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">没有匹配结果</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">高亮显示</label>
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 min-h-[100px] font-mono text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words">
              {highlightedContent}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">常用正则模板</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {regexTemplates.map((template) => (
            <div
              key={template.name}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 text-sm bg-primary text-white rounded-lg"
                  onClick={() => applyTemplate(template)}
                >
                  应用
                </button>
              </div>
              <div className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                {template.pattern}
                {template.flags && <span className="ml-2 text-primary">/{template.flags}/</span>}
              </div>
              {template.sample && (
                <p className="text-xs text-gray-500 dark:text-gray-400">示例：{template.sample}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}