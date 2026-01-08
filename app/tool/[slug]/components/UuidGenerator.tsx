'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateUUID as generateUUIDUtil } from '@/lib/crypto'

export default function UuidGenerator() {
  const [uuid, setUuid] = useState('')
  const [count, setCount] = useState(1)
  const [copied, setCopied] = useState(false)

  const generateUUID = () => {
    return generateUUIDUtil()
  }

  const generate = () => {
    if (count === 1) {
      setUuid(generateUUID())
    } else {
      const uuids = Array.from({ length: count }, () => generateUUID())
      setUuid(uuids.join('\n'))
    }
  }

  const copyToClipboard = async () => {
    if (uuid) {
      await navigator.clipboard.writeText(uuid)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            生成的 UUID
          </label>
          <div className="flex gap-2">
            <button
              onClick={generate}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!uuid}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
                !uuid && 'opacity-50 cursor-not-allowed'
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
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <textarea
            value={uuid}
            readOnly
            className="w-full h-32 font-mono text-sm text-gray-900 dark:text-white bg-transparent resize-none focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            生成数量: {count}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={generate}
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          生成 UUID
        </button>
      </div>
    </div>
  )
}

