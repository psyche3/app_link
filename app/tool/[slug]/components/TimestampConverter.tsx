'use client'

import { useMemo, useState } from 'react'
import { Copy, Check } from 'lucide-react'

const timezones = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
]

interface ResultPayload {
  human: string
  seconds: string
  milliseconds: string
  iso: string
}

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('')
  const [timestampUnit, setTimestampUnit] = useState<'seconds' | 'milliseconds'>('seconds')
  const [date, setDate] = useState('')
  const [timezone, setTimezone] = useState('Asia/Shanghai')
  const [result, setResult] = useState<ResultPayload | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat('zh-CN', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [timezone]
  )

  const computeResult = (dateObj: Date) => {
    const seconds = Math.floor(dateObj.getTime() / 1000).toString()
    const milliseconds = dateObj.getTime().toString()
    const human = formatter.format(dateObj)
    const iso = dateObj.toISOString()
    setResult({ human, seconds, milliseconds, iso })
  }

  const convertTimestampToDate = () => {
    if (!timestamp) {
      setResult(null)
      return
    }
    const value = Number(timestamp)
    if (Number.isNaN(value)) {
      alert('请输入有效的数字时间戳')
      return
    }
    const dateObj = timestampUnit === 'seconds' ? new Date(value * 1000) : new Date(value)
    if (Number.isNaN(dateObj.getTime())) {
      alert('无法解析这个时间戳')
      return
    }
    computeResult(dateObj)
    setDate(dateObj.toISOString().slice(0, 16))
  }

  const convertDateToTimestamp = () => {
    const dateObj = date ? new Date(date) : new Date()
    if (Number.isNaN(dateObj.getTime())) {
      alert('请输入有效的日期时间')
      return
    }
    computeResult(dateObj)
    setTimestamp(Math.floor(dateObj.getTime() / 1000).toString())
  }

  const copyText = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const loadCurrentTime = () => {
    const now = new Date()
    setTimestamp(Math.floor(now.getTime() / 1000).toString())
    setDate(now.toISOString().slice(0, 16))
    computeResult(now)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          onClick={loadCurrentTime}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full md:w-auto"
        >
          获取当前时间
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400">时区：</span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">时间戳 → 日期</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">时间戳</label>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="例如：1700000000"
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={timestampUnit}
                  onChange={(e) => setTimestampUnit(e.target.value as 'seconds' | 'milliseconds')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="seconds">秒</option>
                  <option value="milliseconds">毫秒</option>
                </select>
              </div>
            </div>
            <button
              onClick={convertTimestampToDate}
              className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              转换
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">日期 → 时间戳</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">日期时间</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={convertDateToTimestamp}
              className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              转换
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
          <ResultRow
            label="人类可读"
            value={result.human}
            copied={copiedField === 'human'}
            onCopy={() => copyText(result.human, 'human')}
          />
          <ResultRow
            label="时间戳（秒）"
            value={result.seconds}
            copied={copiedField === 'seconds'}
            onCopy={() => copyText(result.seconds, 'seconds')}
          />
          <ResultRow
            label="时间戳（毫秒）"
            value={result.milliseconds}
            copied={copiedField === 'milliseconds'}
            onCopy={() => copyText(result.milliseconds, 'milliseconds')}
          />
          <ResultRow
            label="ISO 8601"
            value={result.iso}
            copied={copiedField === 'iso'}
            onCopy={() => copyText(result.iso, 'iso')}
          />
        </div>
      )}
    </div>
  )
}

interface ResultRowProps {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}

function ResultRow({ label, value, copied, onCopy }: ResultRowProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-sm text-gray-900 dark:text-white">
        <span className="flex-1 break-all">{value}</span>
        <button
          onClick={onCopy}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
        </button>
      </div>
    </div>
  )
}


