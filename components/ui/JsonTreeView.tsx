'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JsonTreeViewProps {
  data: any
  level?: number
  autoExpand?: boolean
}

export default function JsonTreeView({ data, level = 0, autoExpand = false }: JsonTreeViewProps) {
  // 收集所有可能的键
  const getAllKeys = (obj: any, prefix: string = 'root', keys: Set<string> = new Set()): Set<string> => {
    if (autoExpand) {
      keys.add(prefix)
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          getAllKeys(item, `${prefix}-${index}`, keys)
        })
      } else if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach((k) => {
          getAllKeys(obj[k], prefix ? `${prefix}-${k}` : k, keys)
        })
      }
    }
    return keys
  }

  const allKeys = getAllKeys(data)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    if (autoExpand) {
      allKeys.forEach((key) => {
        initial[key] = true
      })
    } else {
      initial.root = true
    }
    return initial
  })

  useEffect(() => {
    if (autoExpand) {
      const newExpanded: Record<string, boolean> = {}
      allKeys.forEach((key) => {
        newExpanded[key] = true
      })
      setExpanded(newExpanded)
    }
  }, [data, autoExpand])

  const toggle = (key: string) => {
    setExpanded((prev) => {
      // 如果 key 不存在，根据 autoExpand 或是否是 root 来决定初始状态
      const currentState = prev[key] !== undefined 
        ? prev[key] 
        : (autoExpand ? true : key === 'root')
      return { ...prev, [key]: !currentState }
    })
  }

  const getIsExpanded = (key: string): boolean => {
    if (expanded[key] !== undefined) {
      return expanded[key]
    }
    // 如果状态未定义，根据 autoExpand 或是否是 root 来决定
    return autoExpand ? true : key === 'root'
  }

  const renderValue = (value: any, key: string = 'root', parentKey?: string): JSX.Element => {
    if (value === null) {
      return <span className="text-gray-500">null</span>
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600 dark:text-purple-400">{String(value)}</span>
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>
    }

    if (typeof value === 'string') {
      return <span className="text-green-600 dark:text-green-400">"{value}"</span>
    }

    if (Array.isArray(value)) {
      const isExpanded = getIsExpanded(key)
      return (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggle(key)
            }}
            className="flex items-center gap-1 hover:text-primary transition-colors"
            type="button"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-gray-600 dark:text-gray-400">[{value.length}]</span>
          </button>
          {isExpanded && (
            <div className="ml-6 mt-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500">[{index}]: </span>
                  {renderValue(item, `${key}-${index}`, key)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      const isExpanded = getIsExpanded(key)
      return (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggle(key)
            }}
            className="flex items-center gap-1 hover:text-primary transition-colors"
            type="button"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-gray-600 dark:text-gray-400">{'{'} {keys.length} keys {'}'}</span>
          </button>
          {isExpanded && (
            <div className={cn('ml-6 mt-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4', level > 0 && 'ml-4')}>
              {keys.map((k) => (
                <div key={k} className="my-1">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">"{k}": </span>
                  {renderValue(value[k], parentKey ? `${parentKey}-${k}` : k, key)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  return (
    <div className="font-mono text-sm p-4 h-full overflow-auto">
      {renderValue(data)}
    </div>
  )
}

