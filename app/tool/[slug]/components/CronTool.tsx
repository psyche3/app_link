'use client'

import { useEffect, useMemo, useState } from 'react'
import { parseExpression } from 'cron-parser'
import { Copy, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
const hourOptions = Array.from({ length: 24 }, (_, i) => i)
const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
const weekdayOptions = [
  { label: '周日', value: 0 },
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
]

const timezoneOptions = [
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

const cronTemplates = [
  { label: '每分钟', value: '* * * * *', description: '每分钟执行一次' },
  { label: '每小时整点', value: '0 * * * *', description: '每小时第 0 分执行' },
  { label: '每天 9:30', value: '30 9 * * *', description: '每天 9:30 执行' },
  { label: '每周一 10:00', value: '0 10 * * 1', description: '每周一上午 10 点执行' },
  { label: '每月 1 日凌晨', value: '0 0 1 * *', description: '每月 1 号 00:00 执行' },
]

const defaultBuilder = {
  minute: '*',
  hour: '*',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '*',
}

export default function CronTool() {
  const [expression, setExpression] = useState('* * * * *')
  const [builder, setBuilder] = useState(defaultBuilder)
  const [timezone, setTimezone] = useState('Asia/Shanghai')
  const [nextRuns, setNextRuns] = useState<string[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    updateNextRuns(expression, timezone)
  }, [expression, timezone])

  const updateNextRuns = (expr: string, tz: string) => {
    try {
      const interval = parseExpression(expr, { tz })
      const runs: string[] = []
      for (let i = 0; i < 5; i++) {
        runs.push(interval.next().toDate().toLocaleString('zh-CN', { timeZone: tz }))
      }
      setNextRuns(runs)
      setError('')
    } catch (err) {
      setNextRuns([])
      setError(err instanceof Error ? err.message : '解析失败')
    }
  }

  const handleExpressionChange = (value: string) => {
    setExpression(value)
    const [minute, hour, dayOfMonth, month, dayOfWeek] = value.split(' ')
    if ([minute, hour, dayOfMonth, month, dayOfWeek].every(Boolean)) {
      setBuilder({
        minute,
        hour,
        dayOfMonth,
        month,
        dayOfWeek,
      })
    }
  }

  const handleBuilderChange = (field: keyof typeof builder, value: string) => {
    const updated = { ...builder, [field]: value }
    setBuilder(updated)
    setExpression(
      `${updated.minute} ${updated.hour} ${updated.dayOfMonth} ${updated.month} ${updated.dayOfWeek}`
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expression)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const description = useMemo(() => {
    if (expression === '* * * * *') return '每分钟执行一次'
    if (expression === '0 * * * *') return '每小时整点执行'
    if (expression === '0 0 * * *') return '每天午夜执行'
    return ''
  }, [expression])

  return (
    <div className="space-y-6">
      <section className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cron 表达式
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              className="w-full p-3 font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> 已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> 复制
              </>
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            时区
          </label>
          <select
            className="w-full md:w-1/2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">未来执行时间</h4>
          <div className="space-y-2">
            {nextRuns.length > 0 ? (
              nextRuns.map((run, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {run}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">暂无结果</p>
            )}
          </div>
        </div>
      </section>

      <section className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">图形化构建器</h3>
          <button
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-lg flex items-center gap-2"
            onClick={() => {
              setBuilder(defaultBuilder)
              setExpression('* * * * *')
            }}
          >
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BuilderSelect
            label="分钟"
            value={builder.minute}
            options={minuteOptions.map((v) => ({ label: v.toString(), value: v.toString() }))}
            onChange={(val) => handleBuilderChange('minute', val)}
          />
          <BuilderSelect
            label="小时"
            value={builder.hour}
            options={hourOptions.map((v) => ({ label: v.toString(), value: v.toString() }))}
            onChange={(val) => handleBuilderChange('hour', val)}
          />
          <BuilderSelect
            label="日"
            value={builder.dayOfMonth}
            options={dayOptions.map((v) => ({ label: v.toString(), value: v.toString() }))}
            onChange={(val) => handleBuilderChange('dayOfMonth', val)}
          />
          <BuilderSelect
            label="月"
            value={builder.month}
            options={monthOptions.map((v) => ({ label: v.toString(), value: v.toString() }))}
            onChange={(val) => handleBuilderChange('month', val)}
          />
          <BuilderSelect
            label="星期"
            value={builder.dayOfWeek}
            options={weekdayOptions.map((v) => ({ label: v.label, value: v.value.toString() }))}
            onChange={(val) => handleBuilderChange('dayOfWeek', val)}
            allowAsterisk
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">常用模板</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {cronTemplates.map((tpl) => (
            <button
              key={tpl.value}
              className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary transition-colors bg-white dark:bg-gray-800"
              onClick={() => handleExpressionChange(tpl.value)}
            >
              <p className="font-semibold text-gray-900 dark:text-white">{tpl.label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tpl.description}</p>
              <p className="mt-2 font-mono text-sm text-primary">{tpl.value}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

interface BuilderSelectProps {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  allowAsterisk?: boolean
}

function BuilderSelect({ label, value, options, onChange, allowAsterisk = true }: BuilderSelectProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <select
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {allowAsterisk && (
          <option value="*">任意</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

