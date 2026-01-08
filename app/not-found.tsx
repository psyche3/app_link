import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          页面未找到
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          抱歉，您访问的页面不存在
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}

