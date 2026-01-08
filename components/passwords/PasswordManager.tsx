/**
 * 密码管理组件示例
 * 展示如何使用 Supabase 和 Zustand 进行密码管理
 */

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/store/useUser'
import { storePassword, getPasswords } from '@/utils/passwords'
import { encryptData, decryptData } from '@/lib/crypto'

interface PasswordItem {
  id: string
  account: string
  password: string
}

export default function PasswordManager() {
  const user = useUser((state) => state.user)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [masterPassword, setMasterPassword] = useState('')
  const [masterPasswordInput, setMasterPasswordInput] = useState('')
  const [storedPasswords, setStoredPasswords] = useState<PasswordItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 从云端加载密码
  const fetchPasswords = async () => {
    if (!user || !masterPassword) return

    setIsLoading(true)
    setErrorMessage('')

    try {
      const passwords = await getPasswords(user.id)
      const decryptedPasswords: PasswordItem[] = passwords.map((p: any) => {
        try {
          const decrypted = decryptData(p.encrypted_data, masterPassword)
          const parsed = JSON.parse(decrypted)
          return {
            id: p.id,
            account: parsed.account || '',
            password: parsed.password || '',
          }
        } catch (error) {
          console.error('解密密码失败:', error)
          return {
            id: p.id,
            account: '解密失败',
            password: '',
          }
        }
      })
      setStoredPasswords(decryptedPasswords)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '获取密码失败'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 添加密码
  const handleAddPassword = async () => {
    if (!user) {
      setErrorMessage('请先登录！')
      return
    }

    if (!masterPassword) {
      setErrorMessage('请先设置主密码！')
      return
    }

    if (!account || !password) {
      setErrorMessage('请填写账号和密码！')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      // 加密密码数据
      const passwordData = JSON.stringify({ account, password })
      const encryptedPassword = encryptData(passwordData, masterPassword)

      // 存储到数据库
      await storePassword(user.id, encryptedPassword)

      // 清空表单
      setAccount('')
      setPassword('')

      // 刷新密码列表
      await fetchPasswords()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '保存密码失败'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 组件挂载时加载密码
  useEffect(() => {
    if (user && masterPassword) {
      fetchPasswords()
    }
  }, [user, masterPassword])

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          请先登录以使用密码管理功能
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          密码管理器
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          安全存储和管理你的账号密码
        </p>
      </div>

      {/* 主密码设置 */}
      {!masterPassword && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            设置主密码（用于加密你的密码）
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={masterPasswordInput}
              onChange={(e) => setMasterPasswordInput(e.target.value)}
              placeholder="输入主密码"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => {
                if (masterPasswordInput.trim()) {
                  setMasterPassword(masterPasswordInput)
                  setMasterPasswordInput('')
                }
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              设置
            </button>
          </div>
        </div>
      )}

      {/* 添加密码表单 */}
      {masterPassword && (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            添加新密码
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                账号名称
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="例如：Gmail、GitHub"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                placeholder="输入密码"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleAddPassword}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '保存密码'}
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* 已保存的密码列表 */}
      {masterPassword && (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              已保存的密码
            </h4>
            <button
              onClick={fetchPasswords}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-secondary-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? '加载中...' : '刷新'}
            </button>
          </div>
          {storedPasswords.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              还没有保存任何密码
            </p>
          ) : (
            <ul className="space-y-2">
              {storedPasswords.map((item) => (
                <li
                  key={item.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.account}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {item.password ? '••••••••' : item.password}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

