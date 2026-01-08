'use client'

import { useState } from 'react'
import { Buffer } from 'buffer'
import CryptoJS from 'crypto-js'
import { Copy } from 'lucide-react'
import JsonTreeView from '@/components/ui/JsonTreeView'

const safeDecode = (input: string) => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
  if (typeof window === 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf-8')
  }
  return decodeURIComponent(escape(window.atob(base64)))
}

export default function JwtDecoder() {
  const [token, setToken] = useState('')
  const [header, setHeader] = useState<any>(null)
  const [payload, setPayload] = useState<any>(null)
  const [signature, setSignature] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyResult, setVerifyResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'header' | 'payload' | 'signature' | null>(null)

  const decodeToken = () => {
    try {
      setError('')
      setVerifyResult('')
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('无效的 JWT Token 格式，必须包含 header.payload.signature')
      }

      const headerObj = JSON.parse(safeDecode(parts[0]))
      const payloadObj = JSON.parse(safeDecode(parts[1]))
      setHeader(headerObj)
      setPayload(payloadObj)
      setSignature(parts[2])
    } catch (err) {
      setError(err instanceof Error ? err.message : '解码失败')
      setHeader(null)
      setPayload(null)
      setSignature('')
    }
  }

  const handleCopy = async (text: string, type: typeof copied) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const verifySignature = () => {
    if (!secret) {
      setVerifyResult('请输入用于验证的 secret')
      return
    }
    try {
      const [headerPart, payloadPart, signaturePart] = token.split('.')
      if (!headerPart || !payloadPart || !signaturePart) {
        setVerifyResult('Token 不完整')
        return
      }
      const data = `${headerPart}.${payloadPart}`
      const expectedSignature = CryptoJS.HmacSHA256(data, secret).toString(CryptoJS.enc.Base64)
      const normalized = expectedSignature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      if (normalized === signaturePart) {
        setVerifyResult('✅ 签名验证通过 (HS256)')
      } else {
        setVerifyResult('❌ 签名验证失败')
      }
    } catch (error) {
      setVerifyResult('验证失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="输入 JWT Token..."
          className="w-full h-32 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <button
          onClick={decodeToken}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          解码
        </button>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {header && payload && (
        <>
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text白色">Header</h3>
              <button
                onClick={() => handleCopy(JSON.stringify(header, null, 2), 'header')}
                className="text-sm text-primary flex items-center gap-1"
              >
                <Copy className="w-4 h-4" /> {copied === 'header' ? '已复制' : '复制 JSON'}
              </button>
            </div>
            <JsonTreeView data={header} />
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payload</h3>
              <button
                onClick={() => handleCopy(JSON.stringify(payload, null, 2), 'payload')}
                className="text-sm text-primary flex items-center gap-1"
              >
                <Copy className="w-4 h-4" /> {copied === 'payload' ? '已复制' : '复制 JSON'}
              </button>
            </div>
            <JsonTreeView data={payload} />
          </section>

          <section className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Signature</h3>
              {signature && (
                <button
                  onClick={() => handleCopy(signature, 'signature')}
                  className="text-sm text-primary flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" /> {copied === 'signature' ? '已复制' : '复制签名'}
                </button>
              )}
            </div>
            <div className="font-mono text-sm break-all text-gray-700 dark:text-gray-200">
              {signature || '无签名信息'}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Secret（可选，用于 HS256 验证）</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="输入用于验证的 secret"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <button
                onClick={verifySignature}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                验证签名 (HS256)
              </button>
              {verifyResult && <p className="text-sm text-gray-600 dark:text-gray-300">{verifyResult}</p>}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

