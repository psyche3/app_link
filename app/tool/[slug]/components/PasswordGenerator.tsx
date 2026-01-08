'use client'

import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, RefreshCw, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generatePassword as generatePasswordUtil } from '@/lib/crypto'

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePassword = useCallback(() => {
    try {
      const generated = generatePasswordUtil(length, {
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
      })
      setPassword(generated)
    } catch (error) {
      alert(error instanceof Error ? error.message : '生成密码失败')
    }
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols])

  const copyToClipboard = async () => {
    if (password) {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadPassword = () => {
    if (!password) return

    const blob = new Blob([password], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `password-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    generatePassword()
  }, [generatePassword])

  return (
    <div className="space-y-6">
      {/* Password Display */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            生成的密码
          </label>
          <div className="flex gap-2">
            <button
              onClick={generatePassword}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!password}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
                !password && 'opacity-50 cursor-not-allowed'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制
                </>
              )}
            </button>
            <button
              onClick={downloadPassword}
              disabled={!password}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-2xl font-mono text-center text-gray-900 dark:text-white break-all">
            {password || '点击生成按钮创建密码'}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密码长度: {length}
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">大写字母 (A-Z)</span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">小写字母 (a-z)</span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">数字 (0-9)</span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-5 h-5 text-primary rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">特殊符号 (!@#$...)</span>
          </label>
        </div>

        <button
          onClick={generatePassword}
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          生成新密码
        </button>
      </div>
    </div>
  )
}

