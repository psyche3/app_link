/**
 * 加密解密工具函数
 */

import CryptoJS from 'crypto-js'

/**
 * 生成随机密码
 * @param length - 密码长度
 * @param options - 密码选项
 * @returns 生成的密码
 */
export interface PasswordOptions {
  includeUppercase?: boolean
  includeLowercase?: boolean
  includeNumbers?: boolean
  includeSymbols?: boolean
}

export const generatePassword = (
  length: number,
  options: PasswordOptions = {}
): string => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let charset = ''
  if (includeUppercase) charset += uppercase
  if (includeLowercase) charset += lowercase
  if (includeNumbers) charset += numbers
  if (includeSymbols) charset += symbols

  if (!charset) {
    throw new Error('至少需要选择一种字符类型')
  }

  let password = ''
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}

/**
 * 使用 AES 加密数据
 * @param data - 要加密的数据
 * @param password - 加密密码
 * @returns 加密后的字符串
 */
export const encryptData = (data: string, password: string): string => {
  try {
    return CryptoJS.AES.encrypt(data, password).toString()
  } catch (error) {
    throw new Error('加密失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

/**
 * 使用 AES 解密数据
 * @param encryptedData - 加密的数据
 * @param password - 解密密码
 * @returns 解密后的字符串
 */
export const decryptData = (encryptedData: string, password: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    
    if (!decrypted) {
      throw new Error('解密失败：密码错误或数据损坏')
    }
    
    return decrypted
  } catch (error) {
    throw new Error('解密失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

/**
 * 生成随机 UUID
 * @returns UUID 字符串
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

