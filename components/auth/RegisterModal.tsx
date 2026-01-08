'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/store/useAuth'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { validateEmail, validatePasswordStrength } from '@/lib/validator'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string[]
  } | null>(null)

  const { signUp, isLoading, error, clearError, user } = useAuth()
  const [successMessage, setSuccessMessage] = useState('')

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
      // 检查是否需要邮箱验证（注册后立即检查用户状态）
      // 如果启用了邮箱验证，user 可能为 null
      setTimeout(() => {
        const currentUser = useAuth.getState().user
        if (!currentUser) {
          // 需要邮箱验证
          setSuccessMessage(
            '注册成功！请检查你的邮箱并点击验证链接以完成注册。'
          )
          // 3秒后关闭模态框
          setTimeout(() => {
            onClose()
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            setPasswordStrength(null)
            setSuccessMessage('')
          }, 3000)
        } else {
          // 直接登录成功
          onClose()
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setPasswordStrength(null)
          setSuccessMessage('')
        }
      }, 100)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="注册" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
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

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading || !!emailError || !!passwordError}
            className="flex-1"
          >
            {isLoading ? '注册中...' : '注册'}
          </Button>
        </div>

        {onSwitchToLogin && (
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              已有账号？{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                立即登录
              </button>
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}

