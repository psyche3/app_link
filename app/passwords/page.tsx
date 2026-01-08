'use client'

import { useState, useEffect } from 'react'
import PasswordList from './components/PasswordList'
import PasswordForm from './components/PasswordForm'
import MasterPasswordModal from './components/MasterPasswordModal'
import { usePasswordStore } from '@/store/usePasswordStore'
import { useAuth } from '@/store/useAuth'
import { Lock, RefreshCw } from 'lucide-react'

export default function PasswordsPage() {
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [editingPassword, setEditingPassword] = useState<string | null>(null)
  const [pendingAddPassword, setPendingAddPassword] = useState(false)
  const {
    masterPassword,
    setMasterPassword,
    entries,
    loadPasswordsFromCloud,
    syncPasswords,
    isLoading,
  } = usePasswordStore()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!masterPassword && entries.length > 0) {
      setShowMasterPasswordModal(true)
    }
  }, [masterPassword, entries.length])

  useEffect(() => {
    if (isAuthenticated && masterPassword) {
      loadPasswordsFromCloud()
    }
  }, [isAuthenticated, masterPassword, loadPasswordsFromCloud])

  const handleMasterPasswordSet = (password: string) => {
    setMasterPassword(password)
    setShowMasterPasswordModal(false)
    // 如果之前想要添加密码，现在打开添加密码表单
    if (pendingAddPassword) {
      setPendingAddPassword(false)
      setTimeout(() => {
        setShowPasswordForm(true)
      }, 100)
    }
  }

  const handleAddPassword = () => {
    // 如果没有设置主密码，先显示设置主密码的模态框
    if (!masterPassword) {
      setPendingAddPassword(true)
      setShowMasterPasswordModal(true)
      return
    }
    setEditingPassword(null)
    setShowPasswordForm(true)
  }

  const handleEditPassword = (id: string) => {
    // 如果没有设置主密码，先显示设置主密码的模态框
    if (!masterPassword) {
      setPendingAddPassword(false)
      setShowMasterPasswordModal(true)
      return
    }
    setEditingPassword(id)
    setShowPasswordForm(true)
  }

  const handleCloseForm = () => {
    setShowPasswordForm(false)
    setEditingPassword(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              密码记事本
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              安全存储和管理你的账号密码
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAuthenticated && (
            <button
              onClick={syncPasswords}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '同步中...' : '同步到云端'}
            </button>
          )}
          <button
            onClick={handleAddPassword}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            添加密码
          </button>
        </div>
      </div>

      {/* 主密码提示 */}
      {!masterPassword && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                需要设置主密码
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                主密码用于加密你的所有密码数据，确保数据安全。请设置一个强密码并妥善保管，丢失后将无法恢复。
              </p>
              <button
                onClick={() => setShowMasterPasswordModal(true)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                立即设置主密码
              </button>
            </div>
          </div>
        </div>
      )}

      <PasswordList onEdit={handleEditPassword} />

      {showMasterPasswordModal && (
        <MasterPasswordModal
          isOpen={showMasterPasswordModal}
          onClose={() => setShowMasterPasswordModal(false)}
          onSet={handleMasterPasswordSet}
        />
      )}

      {showPasswordForm && (
        <PasswordForm
          isOpen={showPasswordForm}
          onClose={handleCloseForm}
          editingId={editingPassword}
        />
      )}
    </div>
  )
}

