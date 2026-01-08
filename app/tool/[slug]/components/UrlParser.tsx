'use client'

import { useMemo, useState, useEffect } from 'react'
import { Plus, Trash2, Copy, Check, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParamRow {
  key: string
  value: string
  enabled: boolean
  nestedParams?: ParamRow[]
  isExpanded?: boolean
}

const exampleUrls = [
  'https://devtoolhub.com/tool?name=json&mode=pretty',
  'https://api.example.com/v1/users?page=1&pageSize=20&sort=desc',
  'https://example.com/search?q=nextjs&tag=tool&debug=true',
]

// 检测并解析嵌套的 URL 参数
function parseNestedParams(value: string): ParamRow[] | null {
  try {
    // 尝试解码
    let decoded = decodeURIComponent(value)
    
    // 检查是否包含查询参数格式
    if (decoded.includes('?') || (decoded.includes('&') && decoded.includes('='))) {
      // 提取查询字符串部分
      let queryString = decoded
      if (decoded.includes('?')) {
        const parts = decoded.split('?')
        queryString = parts.slice(1).join('?') // 处理多个 ? 的情况
      }
      
      if (queryString && queryString.includes('=')) {
        const params: ParamRow[] = []
        const pairs = queryString.split('&')
        pairs.forEach((pair) => {
          if (pair.trim()) {
            const [key, ...valueParts] = pair.split('=')
            if (key) {
              try {
                params.push({
                  key: decodeURIComponent(key.trim()),
                  value: decodeURIComponent(valueParts.join('=') || ''),
                  enabled: true,
                })
              } catch {
                // 如果某个参数解码失败，跳过
              }
            }
          }
        })
        return params.length > 0 ? params : null
      }
    }
  } catch {
    // 解码失败，不是嵌套参数
  }
  return null
}

export default function UrlParser() {
  const [urlInput, setUrlInput] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [params, setParams] = useState<ParamRow[]>([{ key: '', value: '', enabled: true }])
  const [fragment, setFragment] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [autoParse, setAutoParse] = useState(true)
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('horizontal')
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // 实时生成结果 URL
  const parsedUrl = useMemo(() => {
    const queryParts: string[] = []
    
    params.forEach((param) => {
      if (param.enabled && param.key) {
        let value = param.value
        
        // 如果有嵌套参数且已展开，需要重新编码
        if (param.nestedParams && param.nestedParams.length > 0) {
          const nestedQuery = param.nestedParams
            .filter((p) => p.enabled && p.key)
            .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
            .join('&')
          if (nestedQuery) {
            // 检查原始值是否包含路径部分
            const decoded = decodeURIComponent(param.value)
            if (decoded.includes('?')) {
              const [path] = decoded.split('?')
              value = encodeURIComponent(`${path}?${nestedQuery}`)
            } else {
              value = encodeURIComponent(`?${nestedQuery}`)
            }
          }
        }
        
        queryParts.push(`${encodeURIComponent(param.key)}=${value}`)
      }
    })
    
    const query = queryParts.join('&')
    const hash = fragment ? `#${fragment}` : ''
    if (!baseUrl && !query) return ''
    return query ? `${baseUrl}?${query}${hash}` : `${baseUrl}${hash}`
  }, [baseUrl, params, fragment])

  // 实时解析 URL（当输入变化时）
  useEffect(() => {
    if (!autoParse || !urlInput.trim()) {
      return
    }

    const timer = setTimeout(() => {
      parseUrl()
    }, 300)

    return () => clearTimeout(timer)
  }, [urlInput, autoParse])

  const parseUrl = () => {
    if (!urlInput.trim()) {
      setError('请输入要解析的 URL')
      return false
    }
    try {
      const url = new URL(urlInput, urlInput.startsWith('http') ? undefined : 'https://placeholder.dev')
      const actualBase =
        urlInput.startsWith('http') || urlInput.startsWith('https')
          ? `${url.origin}${url.pathname}`
          : url.pathname
      setBaseUrl(actualBase)
      const newParams: ParamRow[] = []
      url.searchParams.forEach((value, key) => {
        const nestedParams = parseNestedParams(value)
        newParams.push({
          key,
          value,
          enabled: true,
          nestedParams: nestedParams || undefined,
          isExpanded: nestedParams ? true : false,
        })
      })
      setParams(newParams.length ? newParams : [{ key: '', value: '', enabled: true }])
      setFragment(url.hash.replace('#', ''))
      setError('')
      return true
    } catch (err) {
      setError('解析失败，请输入合法的 URL')
      return false
    }
  }

  const updateParam = (index: number, field: keyof ParamRow, value: string | boolean) => {
    setParams((prev) =>
      prev.map((param, idx) => {
        if (idx === index) {
          const updated = { ...param, [field]: value }
          // 如果更新了 value，重新检测嵌套参数
          if (field === 'value' && typeof value === 'string') {
            const nested = parseNestedParams(value)
            updated.nestedParams = nested || undefined
            if (nested) {
              updated.isExpanded = true
            }
          }
          return updated
        }
        return param
      })
    )
  }

  const updateNestedParam = (paramIndex: number, nestedIndex: number, field: keyof ParamRow, value: string | boolean) => {
    setParams((prev) =>
      prev.map((param, idx) => {
        if (idx === paramIndex && param.nestedParams) {
          const updatedNested = param.nestedParams.map((np, nIdx) =>
            nIdx === nestedIndex ? { ...np, [field]: value } : np
          )
          
          // 自动更新主参数的值（重新编码嵌套参数）
          let newValue = param.value
          try {
            const decoded = decodeURIComponent(param.value)
            if (decoded.includes('?')) {
              const [path] = decoded.split('?')
              const nestedQuery = updatedNested
                .filter((p) => p.enabled && p.key)
                .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                .join('&')
              newValue = encodeURIComponent(nestedQuery ? `${path}?${nestedQuery}` : path)
            } else {
              const nestedQuery = updatedNested
                .filter((p) => p.enabled && p.key)
                .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                .join('&')
              newValue = nestedQuery ? encodeURIComponent(`?${nestedQuery}`) : param.value
            }
          } catch {
            // 如果解码失败，保持原值
          }
          
          return {
            ...param,
            value: newValue,
            nestedParams: updatedNested,
          }
        }
        return param
      })
    )
  }

  const toggleExpand = (index: number) => {
    setParams((prev) =>
      prev.map((param, idx) => (idx === index ? { ...param, isExpanded: !param.isExpanded } : param))
    )
  }

  const addParam = () => {
    setParams((prev) => [...prev, { key: '', value: '', enabled: true }])
  }

  const addNestedParam = (paramIndex: number) => {
    setParams((prev) =>
      prev.map((param, idx) => {
        if (idx === paramIndex) {
          const nested = param.nestedParams || []
          return {
            ...param,
            nestedParams: [...nested, { key: '', value: '', enabled: true }],
            isExpanded: true,
          }
        }
        return param
      })
    )
  }

  const removeParam = (index: number) => {
    setParams((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }

  const removeNestedParam = (paramIndex: number, nestedIndex: number) => {
    setParams((prev) =>
      prev.map((param, idx) => {
        if (idx === paramIndex && param.nestedParams) {
          const newNested = param.nestedParams.filter((_, nIdx) => nIdx !== nestedIndex)
          
          // 自动更新主参数的值
          let newValue = param.value
          if (newNested.length > 0) {
            try {
              const decoded = decodeURIComponent(param.value)
              if (decoded.includes('?')) {
                const [path] = decoded.split('?')
                const nestedQuery = newNested
                  .filter((p) => p.enabled && p.key)
                  .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                  .join('&')
                newValue = encodeURIComponent(nestedQuery ? `${path}?${nestedQuery}` : path)
              } else {
                const nestedQuery = newNested
                  .filter((p) => p.enabled && p.key)
                  .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                  .join('&')
                newValue = nestedQuery ? encodeURIComponent(`?${nestedQuery}`) : param.value
              }
            } catch {
              // 如果解码失败，保持原值
            }
          } else {
            // 如果没有嵌套参数了，尝试提取路径部分
            try {
              const decoded = decodeURIComponent(param.value)
              if (decoded.includes('?')) {
                const [path] = decoded.split('?')
                newValue = encodeURIComponent(path)
              }
            } catch {
              // 保持原值
            }
          }
          
          return {
            ...param,
            value: newValue,
            nestedParams: newNested.length > 0 ? newNested : undefined,
          }
        }
        return param
      })
    )
  }

  const copyResult = async () => {
    if (!parsedUrl) return
    await navigator.clipboard.writeText(parsedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearAll = () => {
    setUrlInput('')
    setBaseUrl('')
    setParams([{ key: '', value: '', enabled: true }])
    setFragment('')
    setError('')
    setStep(1)
  }

  const handleStep1Next = () => {
    const ok = parseUrl()
    if (ok) setStep(2)
  }

  const handleStep2Next = () => setStep(3)
  const handlePrev = () => setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)))

  return (
    <div className="space-y-3 lg:space-y-4 min-h-[calc(100vh-140px)] w-full px-2 lg:px-6 h-full">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoParse}
              onChange={(e) => setAutoParse(e.target.checked)}
              className="w-3.5 h-3.5 text-primary rounded focus:ring-primary"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">实时解析</span>
          </label>
          <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-1 py-1">
            <button
              onClick={() => setLayoutMode('horizontal')}
              className={cn(
                'px-3 py-1 text-xs rounded-full',
                layoutMode === 'horizontal'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-300'
              )}
            >
              左右布局
            </button>
            <button
              onClick={() => setLayoutMode('vertical')}
              className={cn(
                'px-3 py-1 text-xs rounded-full',
                layoutMode === 'vertical'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-300'
              )}
            >
              上下布局
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!autoParse && (
            <button
              onClick={parseUrl}
              className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              解析
            </button>
          )}
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            清空
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'flex-1 flex items-center gap-2 px-2 py-1 rounded-md border',
              step === s
                ? 'border-primary text-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <span
              className={cn(
                'w-5 h-5 inline-flex items-center justify-center rounded-full text-[10px] font-semibold',
                step === s ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
              )}
            >
              {s}
            </span>
            <span>
              {s === 1 && '输入 URL'}
              {s === 2 && '拆分/编辑基础地址与参数'}
              {s === 3 && '预览结果 URL'}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              输入 URL
            </label>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/path?foo=bar&debug=true"
              className={cn(
                "w-full h-[180px] lg:h-[200px] p-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 resize-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                error ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:ring-primary"
              )}
            />
            {error && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleStep1Next}
              className="px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              下一步：拆分参数
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="grid gap-2 lg:grid-cols-[2fr_1fr]">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  基础地址
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://example.com/path"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Fragment (#)
                </label>
                <input
                  type="text"
                  value={fragment}
                  onChange={(e) => setFragment(e.target.value)}
                  placeholder="section-1"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  查询参数
                </label>
                <button
                  onClick={addParam}
                  className="px-2.5 py-1 text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增
                </button>
              </div>
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {params.map((param, index) => {
                  const hasNested = param.nestedParams && param.nestedParams.length > 0
                  const isExpanded = param.isExpanded ?? false
                  
                  return (
                    <div
                      key={`${index}-${param.key}`}
                      className="rounded-md bg-white dark:bg-gray-800 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/60"
                    >
                      {/* 主参数行 */}
                      <div className="flex items-start gap-2 p-2">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateParam(index, 'enabled', e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                          title="启用"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <input
                              type="text"
                              value={param.key}
                              onChange={(e) => updateParam(index, 'key', e.target.value)}
                              placeholder="参数名"
                              className="flex-1 min-w-[80px] p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {hasNested && (
                              <button
                                onClick={() => toggleExpand(index)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title={isExpanded ? '折叠' : '展开'}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          <textarea
                            value={param.value}
                            onChange={(e) => updateParam(index, 'value', e.target.value)}
                            placeholder="参数值"
                            rows={hasNested && isExpanded ? 2 : 2}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                          />
                          {hasNested && (
                            <div className="mt-1 text-[10px] text-primary flex items-center gap-1">
                              <span>包含 {param.nestedParams!.length} 个嵌套参数</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeParam(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 嵌套参数 */}
                      {hasNested && isExpanded && (
                        <div className="bg-primary/5 dark:bg-primary/10">
                          <div className="p-2 space-y-1.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-primary font-semibold">
                                嵌套参数
                              </span>
                              <button
                                onClick={() => addNestedParam(index)}
                                className="px-2 py-0.5 text-[10px] flex items-center gap-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                新增
                              </button>
                            </div>
                            {param.nestedParams!.map((nestedParam, nestedIndex) => (
                              <div
                                key={nestedIndex}
                                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700/60"
                              >
                                <input
                                  type="checkbox"
                                  checked={nestedParam.enabled}
                                  onChange={(e) =>
                                    updateNestedParam(index, nestedIndex, 'enabled', e.target.checked)
                                  }
                                  className="w-3 h-3 rounded border-gray-300 text-primary focus:ring-primary"
                                  title="启用"
                                />
                                <input
                                  type="text"
                                  value={nestedParam.key}
                                  onChange={(e) =>
                                    updateNestedParam(index, nestedIndex, 'key', e.target.value)
                                  }
                                  placeholder="key"
                                  className="flex-1 min-w-[60px] p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <span className="text-gray-400 text-[10px]">=</span>
                                <input
                                  type="text"
                                  value={nestedParam.value}
                                  onChange={(e) =>
                                    updateNestedParam(index, nestedIndex, 'value', e.target.value)
                                  }
                                  placeholder="value"
                                  className="flex-1 min-w-[60px] p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                  onClick={() => removeNestedParam(index, nestedIndex)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  title="删除"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              上一步
            </button>
            <button
              onClick={handleStep2Next}
              className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              下一步：预览结果
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">结果 URL</p>
              <p className="text-[11px] text-gray-400">可复制分享</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                className="px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                重新开始
              </button>
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={copyResult}
                disabled={!parsedUrl}
                className="px-2.5 py-1.5 text-xs bg-primary text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
          <textarea
            value={parsedUrl}
            readOnly
            className="w-full h-[180px] lg:h-[200px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            placeholder="解析后的 URL 将显示在这里"
          />
        </div>
      )}
    </div>
  )
}
