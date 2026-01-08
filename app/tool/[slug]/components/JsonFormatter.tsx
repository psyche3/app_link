'use client'

import { useState, useEffect, useMemo } from 'react'
import { Copy, Check, Download, AlertCircle, Maximize2, Trash2, Upload, ChevronDown, ChevronUp, FileText, Network } from 'lucide-react'
import JsonTreeView from '@/components/ui/JsonTreeView'
import { cn } from '@/lib/utils'
import { formatJSON, minifyJSON, validateJSON } from '@/lib/formatJSON'

// JSON 语法高亮组件
function JsonSyntaxHighlight({ jsonString }: { jsonString: string }) {
  if (!jsonString.trim()) {
    return <span className="text-gray-400">格式化后的 JSON 将显示在这里</span>
  }

  // 使用正则表达式进行语法高亮
  const highlightJson = (text: string) => {
    const parts: JSX.Element[] = []
    let lastIndex = 0

    // 匹配字符串（包括转义字符）
    const stringRegex = /"([^"\\]|\\.)*"/g
    // 匹配数字
    const numberRegex = /\b-?\d+\.?\d*\b/g
    // 匹配布尔值和 null
    const keywordRegex = /\b(true|false|null)\b/g
    // 匹配键（字符串后跟冒号）
    const keyRegex = /"([^"\\]|\\.)*"\s*:/g

    // 先标记所有键的位置
    const keyPositions = new Set<number>()
    let match
    while ((match = keyRegex.exec(text)) !== null) {
      for (let i = match.index; i < match.index + match[0].length - 1; i++) {
        keyPositions.add(i)
      }
    }

    // 匹配所有需要高亮的元素
    const matches: Array<{ start: number; end: number; type: 'key' | 'string' | 'number' | 'boolean' | 'null' }> = []

    // 字符串
    stringRegex.lastIndex = 0
    while ((match = stringRegex.exec(text)) !== null) {
      const isKey = keyPositions.has(match.index)
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        type: isKey ? 'key' : 'string',
      })
    }

    // 数字
    numberRegex.lastIndex = 0
    while ((match = numberRegex.exec(text)) !== null) {
      // 确保不在字符串内
      let inString = false
      for (const strMatch of matches) {
        if (strMatch.type === 'string' || strMatch.type === 'key') {
          if (match.index >= strMatch.start && match.index < strMatch.end) {
            inString = true
            break
          }
        }
      }
      if (!inString) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'number',
        })
      }
    }

    // 关键字
    keywordRegex.lastIndex = 0
    while ((match = keywordRegex.exec(text)) !== null) {
      let inString = false
      for (const strMatch of matches) {
        if (strMatch.type === 'string' || strMatch.type === 'key') {
          if (match.index >= strMatch.start && match.index < strMatch.end) {
            inString = true
            break
          }
        }
      }
      if (!inString) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: match[0] === 'null' ? 'null' : 'boolean',
        })
      }
    }

    // 排序并渲染
    matches.sort((a, b) => a.start - b.start)

    matches.forEach((match, index) => {
      // 添加之前的普通文本
      if (match.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`} className="text-gray-900 dark:text-gray-100">
            {text.substring(lastIndex, match.start)}
          </span>
        )
      }

      // 添加高亮文本
      const className = {
        key: 'text-red-600 dark:text-red-400',
        string: 'text-green-600 dark:text-green-400',
        number: 'text-blue-600 dark:text-blue-400',
        boolean: 'text-purple-600 dark:text-purple-400',
        null: 'text-gray-500',
      }[match.type]

      parts.push(
        <span key={`highlight-${index}`} className={className}>
          {text.substring(match.start, match.end)}
        </span>
      )

      lastIndex = match.end
    })

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end" className="text-gray-900 dark:text-gray-100">
          {text.substring(lastIndex)}
        </span>
      )
    }

    return parts.length > 0 ? parts : <span className="text-gray-900 dark:text-gray-100">{text}</span>
  }

  return <>{highlightJson(jsonString)}</>
}

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState('')
  const [copied, setCopied] = useState(false)
  const [isMinified, setIsMinified] = useState(false)
  const [autoFormat, setAutoFormat] = useState(true)
  const [keepEscape, setKeepEscape] = useState(false)
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('tree')
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false)

  // 实时格式化
  useEffect(() => {
    if (!autoFormat || !input.trim()) {
      setOutput('')
      setError('')
      setErrorDetails('')
      return
    }

    // 防抖处理
    const timer = setTimeout(() => {
      try {
        setError('')
        setErrorDetails('')
        const formatted = formatJSON(input)
        setOutput(formatted)
        setIsMinified(false)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误'
        setError('无效的 JSON 格式')
        setErrorDetails(errorMessage)
        setOutput('')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [input, autoFormat])

  const handleFormatJson = () => {
    try {
      setError('')
      setErrorDetails('')
      const formatted = formatJSON(input)
      setOutput(formatted)
      setIsMinified(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError('无效的 JSON 格式')
      setErrorDetails(errorMessage)
      setOutput('')
    }
  }

  const handleMinifyJson = () => {
    try {
      setError('')
      setErrorDetails('')
      const minified = minifyJSON(input)
      setOutput(minified)
      setIsMinified(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError('无效的 JSON 格式')
      setErrorDetails(errorMessage)
      setOutput('')
    }
  }

  const handleValidateJson = () => {
    const result = validateJSON(input)
    if (result.valid) {
      setError('')
      setErrorDetails('')
      alert('✅ JSON 格式有效！')
    } else {
      setError('无效的 JSON 格式')
      setErrorDetails(result.error || '未知错误')
    }
  }

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadJson = () => {
    if (!output) return

    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
    setErrorDetails('')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const parsedData = useMemo(() => {
    if (!output || error) return null
    try {
      return JSON.parse(output)
    } catch {
      return null
    }
  }, [output, error])

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                输入 JSON
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoFormat}
                  onChange={(e) => setAutoFormat(e.target.checked)}
                  className="w-3.5 h-3.5 text-primary rounded focus:ring-primary"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">实时格式化</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleClear}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "example", "value": 123}'
            className={cn(
              "w-full h-[600px] p-4 font-mono text-sm border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 resize-none overflow-auto",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-primary"
            )}
          />
          {error && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                  {errorDetails && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono">
                      {errorDetails}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                输出
              </label>
              {parsedData && !error && (
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('text')}
                    className={cn(
                      "px-2 py-1 text-xs rounded transition-colors flex items-center gap-1",
                      viewMode === 'text'
                        ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    文本
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={cn(
                      "px-2 py-1 text-xs rounded transition-colors flex items-center gap-1",
                      viewMode === 'tree'
                        ? "bg-white dark:bg-gray-800 text-primary shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    )}
                  >
                    <Network className="w-3.5 h-3.5" />
                    树状
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleValidateJson}
                className="px-2.5 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                验证
              </button>
              {!autoFormat && (
                <button
                  onClick={handleFormatJson}
                  className="px-2.5 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  格式化
                </button>
              )}
              <button
                onClick={handleMinifyJson}
                className="px-2.5 py-1.5 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                压缩
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOutputCollapsed((prev) => !prev)
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                title={isOutputCollapsed ? "展开" : "折叠"}
                type="button"
                aria-label={isOutputCollapsed ? "展开输出区域" : "折叠输出区域"}
              >
                {isOutputCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!output}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制
                  </>
                )}
              </button>
              <button
                onClick={downloadJson}
                disabled={!output}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                下载
              </button>
            </div>
          </div>
          {!isOutputCollapsed && (
            <div className="relative h-[600px]">
              {viewMode === 'text' ? (
                <pre className="w-full h-full p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-auto whitespace-pre-wrap break-words">
                  <JsonSyntaxHighlight jsonString={output} />
                </pre>
              ) : parsedData ? (
                <div className="w-full h-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-auto">
                  <JsonTreeView data={parsedData} autoExpand={true} />
                </div>
              ) : (
                <pre className="w-full h-full p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-auto whitespace-pre-wrap break-words">
                  <span className="text-gray-400">格式化后的 JSON 将显示在这里</span>
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
