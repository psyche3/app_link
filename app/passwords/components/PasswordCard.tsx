'use client'

import { useState } from 'react'
import { Eye, EyeOff, Edit, Trash2, Copy, Check } from 'lucide-react'
import { PasswordEntry } from '@/lib/types'
import { usePasswordStore } from '@/store/usePasswordStore'
import { cn } from '@/lib/utils'

interface PasswordCardProps {
  entry: PasswordEntry
  onEdit: () => void
  onDelete: () => void
}

export default function PasswordCard({
  entry,
  onEdit,
  onDelete,
}: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const { masterPassword, decryptData } = usePasswordStore()

  let decryptedData: { website?: string; username?: string; password?: string } = {}
  try {
    if (masterPassword) {
      const decrypted = decryptData(entry.encrypted_data, masterPassword)
      decryptedData = JSON.parse(decrypted)
    }
  } catch (err) {
    console.error('解密失败', err)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {decryptedData.website || '未命名网站'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {entry.category}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-500">
            用户名
          </label>
          <div className="flex items-center gap-2 mt-1">
            <p className="flex-1 text-sm text-gray-900 dark:text-white">
              {decryptedData.username || '—'}
            </p>
            {decryptedData.username && (
              <button
                onClick={() => copyToClipboard(decryptedData.username || '')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-500">
            密码
          </label>
          <div className="flex items-center gap-2 mt-1">
            <p className="flex-1 text-sm font-mono text-gray-900 dark:text-white">
              {showPassword
                ? decryptedData.password || '—'
                : '•'.repeat(decryptedData.password?.length || 8)}
            </p>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-gray-500" />
              ) : (
                <Eye className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {decryptedData.password && (
              <button
                onClick={() => copyToClipboard(decryptedData.password || '')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          创建于: {new Date(entry.created_at).toLocaleDateString('zh-CN')}
        </p>
      </div>
    </div>
  )
}

