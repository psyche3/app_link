'use client'

import { Settings, Moon, Sun, Globe, Bell } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            设置
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理你的应用偏好设置
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              主题设置
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                theme === 'light'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              浅色模式
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              深色模式
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              语言设置
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('zh')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                language === 'zh'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              简体中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                language === 'en'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Account Settings */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              账号设置
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            账号功能正在开发中，敬请期待...
          </p>
        </div>
      </div>
    </div>
  )
}

