/**
 * 简化的登录组件示例
 * 展示如何使用 useUser 和 utils/auth 进行用户认证
 */

'use client'

import { useState } from 'react'
import { loginUser, registerUser } from '@/utils/auth'
import { useUser } from '@/store/useUser'

export default function SimpleLogin() {
  const { user, setUser, logout } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleLogin = async () => {
    setErrorMessage('')

    try {
      const data = await loginUser(email, password)
      
      if (data.user) {
        // 登录成功，更新用户状态
        setUser({
          id: data.user.id,
          email: data.user.email || '',
        })
        setEmail('')
        setPassword('')
      } else {
        setErrorMessage('登录失败，请检查你的凭据。')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '登录失败'
      )
    }
  }

  const handleRegister = async () => {
    setErrorMessage('')

    try {
      const data = await registerUser(email, password)
      
      if (data.user) {
        // 注册成功，更新用户状态
        setUser({
          id: data.user.id,
          email: data.user.email || '',
        })
        setEmail('')
        setPassword('')
      } else {
        setErrorMessage('注册失败，请检查你的信息。')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '注册失败'
      )
    }
  }

  const handleLogout = async () => {
    try {
      const { logoutUser } = await import('@/utils/auth')
      await logoutUser()
      logout()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 如果用户已登录，显示用户信息
  if (user) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          已登录
        </h2>
        <div className="space-y-2 mb-4">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">用户 ID:</span> {user.id}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">邮箱:</span> {user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          登出
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {isLogin ? '登录' : '注册'}
      </h2>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
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
            placeholder="请输入密码"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={isLogin ? handleLogin : handleRegister}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {isLogin ? '登录' : '注册'}
        </button>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setErrorMessage('')
            }}
            className="text-sm text-primary hover:underline"
          >
            {isLogin
              ? '还没有账号？立即注册'
              : '已有账号？立即登录'}
          </button>
        </div>
      </div>
    </div>
  )
}

