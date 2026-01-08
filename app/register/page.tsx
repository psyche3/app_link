'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/store/useAuth'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { validateEmail, validatePasswordStrength } from '@/lib/validator'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string[]
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { signUp, isLoading, error, clearError, isAuthenticated, user } =
    useAuth()

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('请输入有效的邮箱地址')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    const strength = validatePasswordStrength(value)
    setPasswordStrength(strength)

    if (value && strength.score < 3) {
      setPasswordError('密码强度较弱，建议包含大小写字母、数字和特殊字符')
    } else {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSuccessMessage('')

    // 验证
    if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    const strength = validatePasswordStrength(password)
    if (strength.score < 2) {
      setPasswordError('密码强度不足')
      return
    }

    const success = await signUp(email, password)
    if (success) {
      // 检查是否需要邮箱验证
      setTimeout(() => {
        const currentUser = useAuth.getState().user
        if (!currentUser) {
          // 需要邮箱验证
          setSuccessMessage(
            '注册成功！请检查你的邮箱并点击验证链接以完成注册。'
          )
          // 3秒后重定向到登录页
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          // 直接登录成功
          router.push('/')
        }
      }, 100)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* 返回首页链接 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* 注册卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              注册
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              创建你的 DevToolHub 账号
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
              {emailError && (
                <p className="text-xs text-red-500 dark:text-red-400">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="至少 8 位字符"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              {passwordError && (
                <p className="text-xs text-red-500 dark:text-red-400">{passwordError}</p>
              )}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.score
                            ? level <= 2
                              ? 'bg-red-500'
                              : level === 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {passwordStrength.feedback.join('、')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400">两次输入的密码不一致</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !!emailError || !!passwordError}
              className="w-full"
            >
              {isLoading ? '注册中...' : '注册'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

