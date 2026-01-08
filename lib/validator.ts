/**
 * 数据校验工具函数
 */

/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证 URL 格式
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证密码强度
 */
export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
}

export const validatePasswordStrength = (
  password: string
): PasswordStrength => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score++
  } else {
    feedback.push('密码长度至少为 8 位')
  }

  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('包含小写字母')
  }

  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('包含大写字母')
  }

  if (/[0-9]/.test(password)) {
    score++
  } else {
    feedback.push('包含数字')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('包含特殊字符')
  }

  return { score, feedback }
}

/**
 * 验证文件类型
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const baseType = type.split('/')[0]
      return file.type.startsWith(baseType + '/')
    }
    return file.type === type
  })
}

/**
 * 验证文件大小
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * 验证 JSON 字符串
 */
export const validateJSONString = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

