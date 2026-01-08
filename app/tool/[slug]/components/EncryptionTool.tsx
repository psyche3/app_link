'use client'

import { useState } from 'react'
import CryptoJS from 'crypto-js'
import forge from 'node-forge'
import { cn } from '@/lib/utils'

const sectionCard = 'p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4'
const sectionTitle = 'text-lg font-semibold text-gray-900 dark:text-white'
const labelStyle = 'text-sm font-medium text-gray-600 dark:text-gray-300'
const inputStyle =
  'w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
const textAreaStyle = cn(inputStyle, 'min-h-[120px] resize-y')

const hashAlgorithms = [
  { label: 'MD5', value: 'MD5' },
  { label: 'SHA1', value: 'SHA1' },
  { label: 'SHA256', value: 'SHA256' },
  { label: 'SHA512', value: 'SHA512' },
]

export default function EncryptionTool() {
  // Base64
  const [base64Input, setBase64Input] = useState('')
  const [base64Result, setBase64Result] = useState('')
  const [base64Error, setBase64Error] = useState('')

  // URL
  const [urlInput, setUrlInput] = useState('')
  const [urlResult, setUrlResult] = useState('')

  // JWT
  const [jwtInput, setJwtInput] = useState('')
  const [jwtHeader, setJwtHeader] = useState('')
  const [jwtPayload, setJwtPayload] = useState('')
  const [jwtError, setJwtError] = useState('')

  // Hash
  const [hashInput, setHashInput] = useState('')
  const [hashAlgorithm, setHashAlgorithm] = useState('MD5')
  const [hashResult, setHashResult] = useState('')

  // AES / DES
  const [aesPlain, setAesPlain] = useState('')
  const [aesKey, setAesKey] = useState('')
  const [aesIv, setAesIv] = useState('')
  const [aesResult, setAesResult] = useState('')
  const [desPlain, setDesPlain] = useState('')
  const [desKey, setDesKey] = useState('')
  const [desIv, setDesIv] = useState('')
  const [desResult, setDesResult] = useState('')

  // RSA
  const [rsaPublicKey, setRsaPublicKey] = useState('')
  const [rsaPrivateKey, setRsaPrivateKey] = useState('')
  const [rsaPlain, setRsaPlain] = useState('')
  const [rsaCipher, setRsaCipher] = useState('')
  const [rsaResult, setRsaResult] = useState('')

  const safeBase64Encode = (text: string) => {
    return typeof window === 'undefined'
      ? Buffer.from(text, 'utf-8').toString('base64')
      : window.btoa(unescape(encodeURIComponent(text)))
  }

  const safeBase64Decode = (text: string) => {
    return typeof window === 'undefined'
      ? Buffer.from(text, 'base64').toString('utf-8')
      : decodeURIComponent(escape(window.atob(text)))
  }

  const handleBase64Encode = () => {
    try {
      setBase64Result(safeBase64Encode(base64Input))
      setBase64Error('')
    } catch (error) {
      setBase64Error('编码失败，请检查输入内容')
    }
  }

  const handleBase64Decode = () => {
    try {
      setBase64Result(safeBase64Decode(base64Input))
      setBase64Error('')
    } catch (error) {
      setBase64Error('解码失败，请输入合法的 Base64 字符串')
    }
  }

  const handleUrlEncode = () => {
    setUrlResult(encodeURIComponent(urlInput))
  }

  const handleUrlDecode = () => {
    try {
      setUrlResult(decodeURIComponent(urlInput))
    } catch (error) {
      setUrlResult('解码失败：输入的 URL 可能不合法')
    }
  }

  const handleJwtDecode = () => {
    try {
      const [header, payload] = jwtInput.split('.')
      if (!header || !payload) {
        throw new Error('无效的 JWT')
      }
      const decode = (part: string) => {
        const padded = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
        const json =
          typeof window === 'undefined'
            ? Buffer.from(padded, 'base64').toString('utf-8')
            : decodeURIComponent(escape(window.atob(padded)))
        return JSON.parse(json)
      }
      setJwtHeader(JSON.stringify(decode(header), null, 2))
      setJwtPayload(JSON.stringify(decode(payload), null, 2))
      setJwtError('')
    } catch (error) {
      setJwtHeader('')
      setJwtPayload('')
      setJwtError('解析失败，请检查 JWT 格式')
    }
  }

  const handleHash = () => {
    if (!hashInput) {
      setHashResult('')
      return
    }
    let result = ''
    switch (hashAlgorithm) {
      case 'MD5':
        result = CryptoJS.MD5(hashInput).toString()
        break
      case 'SHA1':
        result = CryptoJS.SHA1(hashInput).toString()
        break
      case 'SHA256':
        result = CryptoJS.SHA256(hashInput).toString()
        break
      case 'SHA512':
        result = CryptoJS.SHA512(hashInput).toString()
        break
      default:
        break
    }
    setHashResult(result)
  }

  const handleAesEncrypt = () => {
    if (!aesKey) {
      setAesResult('请输入密钥')
      return
    }
    try {
      const options = aesIv ? { iv: CryptoJS.enc.Utf8.parse(aesIv) } : undefined
      const encrypted = CryptoJS.AES.encrypt(aesPlain, CryptoJS.enc.Utf8.parse(aesKey), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        ...options,
      })
      setAesResult(encrypted.toString())
    } catch (error) {
      setAesResult('加密失败，请检查输入')
    }
  }

  const handleAesDecrypt = () => {
    if (!aesKey) {
      setAesResult('请输入密钥')
      return
    }
    try {
      const options = aesIv ? { iv: CryptoJS.enc.Utf8.parse(aesIv) } : undefined
      const decrypted = CryptoJS.AES.decrypt(aesPlain, CryptoJS.enc.Utf8.parse(aesKey), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        ...options,
      })
      setAesResult(decrypted.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      setAesResult('解密失败，请检查密文或密钥')
    }
  }

  const handleDesEncrypt = () => {
    if (!desKey) {
      setDesResult('请输入密钥')
      return
    }
    try {
      const options = desIv ? { iv: CryptoJS.enc.Utf8.parse(desIv) } : undefined
      const encrypted = CryptoJS.DES.encrypt(desPlain, CryptoJS.enc.Utf8.parse(desKey), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        ...options,
      })
      setDesResult(encrypted.toString())
    } catch (error) {
      setDesResult('加密失败，请检查输入')
    }
  }

  const handleDesDecrypt = () => {
    if (!desKey) {
      setDesResult('请输入密钥')
      return
    }
    try {
      const options = desIv ? { iv: CryptoJS.enc.Utf8.parse(desIv) } : undefined
      const decrypted = CryptoJS.DES.decrypt(desPlain, CryptoJS.enc.Utf8.parse(desKey), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        ...options,
      })
      setDesResult(decrypted.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      setDesResult('解密失败，请检查密文或密钥')
    }
  }

  const handleRsaEncrypt = () => {
    try {
      const publicKey = forge.pki.publicKeyFromPem(rsaPublicKey)
      const encrypted = publicKey.encrypt(rsaPlain, 'RSAES-PKCS1-V1_5')
      setRsaResult(forge.util.encode64(encrypted))
    } catch (error) {
      setRsaResult('RSA 加密失败，请检查公钥格式或输入内容')
    }
  }

  const handleRsaDecrypt = () => {
    try {
      const privateKey = forge.pki.privateKeyFromPem(rsaPrivateKey)
      const decrypted = privateKey.decrypt(forge.util.decode64(rsaCipher), 'RSAES-PKCS1-V1_5')
      setRsaResult(decrypted)
    } catch (error) {
      setRsaResult('RSA 解密失败，请检查私钥或密文')
    }
  }

  return (
    <div className="space-y-6">
      {/* Base64 */}
      <section className={sectionCard}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={sectionTitle}>Base64 编解码</h3>
          {base64Error && <span className="text-sm text-red-500">{base64Error}</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>输入</label>
            <textarea
              className={cn(textAreaStyle, 'h-[400px]')}
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              placeholder="输入文本或 Base64 字符串"
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={handleBase64Encode}>
                编码
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg" onClick={handleBase64Decode}>
                解码
              </button>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>结果</label>
            <textarea className={cn(textAreaStyle, 'h-[400px]')} value={base64Result} readOnly placeholder="结果" />
          </div>
        </div>
      </section>

      {/* URL Encode */}
      <section className={sectionCard}>
        <h3 className={cn(sectionTitle, 'mb-4')}>URL 编解码</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>输入</label>
            <textarea
              className={cn(textAreaStyle, 'h-[400px]')}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="输入 URL 或参数"
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={handleUrlEncode}>
                Encode
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg" onClick={handleUrlDecode}>
                Decode
              </button>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>结果</label>
            <textarea className={cn(textAreaStyle, 'h-[400px]')} value={urlResult} readOnly placeholder="结果" />
          </div>
        </div>
      </section>

      {/* JWT */}
      <section className={sectionCard}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={sectionTitle}>JWT 解码</h3>
          {jwtError && <span className="text-sm text-red-500">{jwtError}</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>输入</label>
            <textarea
              className={cn(textAreaStyle, 'h-[200px]')}
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="输入 JWT Token"
            />
            <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={handleJwtDecode}>
              解码
            </button>
          </div>
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>结果</label>
            <div className="grid gap-4 h-[200px]">
              <div>
                <p className={cn(labelStyle, 'mb-2')}>Header</p>
                <textarea className={cn(textAreaStyle, 'h-[90px]')} value={jwtHeader} readOnly placeholder="Header JSON" />
              </div>
              <div>
                <p className={cn(labelStyle, 'mb-2')}>Payload</p>
                <textarea className={cn(textAreaStyle, 'h-[90px]')} value={jwtPayload} readOnly placeholder="Payload JSON" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hash */}
      <section className={sectionCard}>
        <h3 className={cn(sectionTitle, 'mb-4')}>哈希生成</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>输入</label>
            <textarea
              className={cn(textAreaStyle, 'h-[300px]')}
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="输入文本"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className={labelStyle}>算法</label>
              <select className={cn(inputStyle, 'flex-1')} value={hashAlgorithm} onChange={(e) => setHashAlgorithm(e.target.value)}>
                {hashAlgorithms.map((algo) => (
                  <option key={algo.value} value={algo.value}>
                    {algo.label}
                  </option>
                ))}
              </select>
              <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={handleHash}>
                生成
              </button>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>结果</label>
            <textarea className={cn(textAreaStyle, 'h-[300px]')} value={hashResult} readOnly placeholder="哈希结果" />
          </div>
        </div>
      </section>

      {/* AES */}
      <section className={sectionCard}>
        <h3 className={cn(sectionTitle, 'mb-4')}>AES 加密 / 解密</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>输入</label>
            <textarea
              className={cn(textAreaStyle, 'h-[200px]')}
              value={aesPlain}
              onChange={(e) => setAesPlain(e.target.value)}
              placeholder="输入明文或密文"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className={labelStyle}>密钥</p>
                <input className={inputStyle} value={aesKey} onChange={(e) => setAesKey(e.target.value)} placeholder="例如：1234567890abcdef" />
              </div>
              <div>
                <p className={labelStyle}>IV（可选）</p>
                <input className={inputStyle} value={aesIv} onChange={(e) => setAesIv(e.target.value)} placeholder="16 字节向量" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={handleAesEncrypt}>
                加密
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg" onClick={handleAesDecrypt}>
                解密
              </button>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>结果</label>
            <textarea className={cn(textAreaStyle, 'h-[200px]')} value={aesResult} readOnly placeholder="结果" />
          </div>
        </div>
      </section>

      {/* DES */}
      <section className={sectionCard}>
        <h3 className={cn(sectionTitle, 'mb-4')}>DES 加密 / 解密</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>输入</label>
            <textarea
              className={cn(textAreaStyle, 'h-[200px]')}
              value={desPlain}
              onChange={(e) => setDesPlain(e.target.value)}
              placeholder="输入明文或密文"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className={labelStyle}>密钥</p>
                <input className={inputStyle} value={desKey} onChange={(e) => setDesKey(e.target.value)} placeholder="例如：12345678" />
              </div>
              <div>
                <p className={labelStyle}>IV（可选）</p>
                <input className={inputStyle} value={desIv} onChange={(e) => setDesIv(e.target.value)} placeholder="8 字节向量" />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={handleDesEncrypt}>
                加密
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg" onClick={handleDesDecrypt}>
                解密
              </button>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>结果</label>
            <textarea className={cn(textAreaStyle, 'h-[200px]')} value={desResult} readOnly placeholder="结果" />
          </div>
        </div>
      </section>

      {/* RSA */}
      <section className={sectionCard}>
        <h3 className={cn(sectionTitle, 'mb-4')}>RSA 公钥加密 / 私钥解密</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>输入</label>
            <div className="grid gap-3">
              <div>
                <p className={labelStyle}>公钥（PEM）</p>
                <textarea className={cn(textAreaStyle, 'h-[100px]')} value={rsaPublicKey} onChange={(e) => setRsaPublicKey(e.target.value)} placeholder="-----BEGIN PUBLIC KEY-----" />
              </div>
              <div>
                <p className={labelStyle}>私钥（PEM）</p>
                <textarea className={cn(textAreaStyle, 'h-[100px]')} value={rsaPrivateKey} onChange={(e) => setRsaPrivateKey(e.target.value)} placeholder="-----BEGIN PRIVATE KEY-----" />
              </div>
              <div>
                <p className={labelStyle}>明文</p>
                <textarea className={cn(textAreaStyle, 'h-[100px]')} value={rsaPlain} onChange={(e) => setRsaPlain(e.target.value)} placeholder="输入要加密的内容" />
                <button className="mt-2 w-full px-4 py-2 bg-primary text-white rounded-lg" onClick={handleRsaEncrypt}>
                  公钥加密
                </button>
              </div>
              <div>
                <p className={labelStyle}>密文（Base64）</p>
                <textarea className={cn(textAreaStyle, 'h-[100px]')} value={rsaCipher} onChange={(e) => setRsaCipher(e.target.value)} placeholder="输入要解密的密文" />
                <button className="mt-2 w-full px-4 py-2 bg-gray-700 text-white rounded-lg" onClick={handleRsaDecrypt}>
                  私钥解密
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <label className={labelStyle}>结果</label>
            <textarea className={cn(textAreaStyle, 'h-[400px]')} value={rsaResult} readOnly placeholder="结果" />
          </div>
        </div>
      </section>
    </div>
  )
}
