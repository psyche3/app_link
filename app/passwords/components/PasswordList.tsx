'use client'

import { usePasswordStore } from '@/store/usePasswordStore'
import PasswordCard from './PasswordCard'
import { PasswordEntry } from '@/lib/types'

interface PasswordListProps {
  onEdit: (id: string) => void
}

export default function PasswordList({ onEdit }: PasswordListProps) {
  const { entries, deleteEntry, masterPassword, decryptData } = usePasswordStore()

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个密码条目吗？')) {
      deleteEntry(id)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">还没有保存任何密码</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          点击&ldquo;添加密码&rdquo;按钮开始添加
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <PasswordCard
          key={entry.id}
          entry={entry}
          onEdit={() => onEdit(entry.id)}
          onDelete={() => handleDelete(entry.id)}
        />
      ))}
    </div>
  )
}

