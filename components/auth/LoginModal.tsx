'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/store/useAuth'
import { AlertCircle } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister?: () => void
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const success = await signIn(email, password)
    if (success) {
      onClose()
      setEmail('')
      setPassword('')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="登录" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => {
              // TODO: 实现忘记密码功能
              alert('忘记密码功能开发中...')
            }}
          >
            忘记密码？
          </button>
        </div>

        <div className="flex gap-3 pt-2">
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
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </div>

        {onSwitchToRegister && (
          <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              还没有账号？{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary hover:underline font-medium"
              >
                立即注册
              </button>
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}

