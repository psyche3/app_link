'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MockDataGenerator() {
  const [count, setCount] = useState(5)
  const [dataType, setDataType] = useState('user')
  const [generatedData, setGeneratedData] = useState('')
  const [copied, setCopied] = useState(false)

  const generateMockData = () => {
    const generators: Record<string, () => any> = {
      user: () => ({
        id: Math.floor(Math.random() * 10000),
        name: `User${Math.floor(Math.random() * 1000)}`,
        email: `user${Math.floor(Math.random() * 1000)}@example.com`,
        age: Math.floor(Math.random() * 50) + 18,
        createdAt: new Date().toISOString(),
      }),
      product: () => ({
        id: Math.floor(Math.random() * 10000),
        name: `Product${Math.floor(Math.random() * 1000)}`,
        price: (Math.random() * 1000).toFixed(2),
        category: ['Electronics', 'Clothing', 'Food', 'Books'][Math.floor(Math.random() * 4)],
        inStock: Math.random() > 0.5,
      }),
      post: () => ({
        id: Math.floor(Math.random() * 10000),
        title: `Post Title ${Math.floor(Math.random() * 1000)}`,
        content: `This is the content of post ${Math.floor(Math.random() * 1000)}`,
        author: `Author${Math.floor(Math.random() * 100)}`,
        views: Math.floor(Math.random() * 10000),
        publishedAt: new Date().toISOString(),
      }),
    }

    const generator = generators[dataType]
    if (!generator) {
      setGeneratedData('')
      return
    }

    const data = Array.from({ length: count }, generator)
    setGeneratedData(JSON.stringify(data, null, 2))
  }

  const copyToClipboard = async () => {
    if (generatedData) {
      await navigator.clipboard.writeText(generatedData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    generateMockData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            数据类型
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="user">用户 (User)</option>
            <option value="product">产品 (Product)</option>
            <option value="post">文章 (Post)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            生成数量: {count}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={generateMockData}
        className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
      >
        生成数据
      </button>

      {generatedData && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              生成的数据
            </label>
            <button
              onClick={copyToClipboard}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制
                </>
              )}
            </button>
          </div>
          <pre className="w-full p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-auto max-h-96">
            {generatedData}
          </pre>
        </div>
      )}
    </div>
  )
}

