'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { usePasswordStore } from '@/store/usePasswordStore'
import { PasswordEntry } from '@/lib/types'

interface PasswordFormProps {
  isOpen: boolean
  onClose: () => void
  editingId: string | null
}

export default function PasswordForm({
  isOpen,
  onClose,
  editingId,
}: PasswordFormProps) {
  const { entries, addEntry, updateEntry, masterPassword, encryptData } =
    usePasswordStore()
  const [website, setWebsite] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState('')

  const editingEntry = editingId
    ? entries.find((e) => e.id === editingId)
    : null

  useEffect(() => {
    if (editingEntry && masterPassword) {
      try {
        const decrypted = JSON.parse(
          usePasswordStore.getState().decryptData(
            editingEntry.encrypted_data,
            masterPassword
          )
        )
        setWebsite(decrypted.website || '')
        setUsername(decrypted.username || '')
        setPassword(decrypted.password || '')
        setCategory(editingEntry.category || '')
      } catch (err) {
        console.error('解密失败', err)
      }
    } else {
      setWebsite('')
      setUsername('')
      setPassword('')
      setCategory('')
    }
  }, [editingEntry, masterPassword, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!masterPassword) {
      // 关闭当前表单，让父组件处理主密码设置
      onClose()
      return
    }

    const data = {
      website,
      username,
      password,
    }

    const encrypted = encryptData(JSON.stringify(data), masterPassword)

    if (editingId) {
      updateEntry(editingId, {
        encrypted_data: encrypted,
        category,
      })
    } else {
      addEntry({
        user_id: 'current-user', // 在实际应用中应从认证系统获取
        encrypted_data: encrypted,
        category,
      })
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? '编辑密码' : '添加密码'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            网站/应用名称
          </label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            用户名/邮箱
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            分类
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如: 社交媒体、工作、个人"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {editingId ? '更新' : '添加'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

