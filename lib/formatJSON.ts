/**
 * JSON 格式化工具函数
 */

export interface FormatJSONOptions {
  indent?: number
  sortKeys?: boolean
}

/**
 * 格式化 JSON 字符串
 * @param jsonString - 输入的 JSON 字符串
 * @param options - 格式化选项
 * @returns 格式化后的 JSON 字符串
 * @throws 如果 JSON 格式无效
 */
export const formatJSON = (
  jsonString: string,
  options: FormatJSONOptions = {}
): string => {
  try {
    const { indent = 2, sortKeys = false } = options
    const json = JSON.parse(jsonString)

    if (sortKeys) {
      const sortedJson = sortObjectKeys(json)
      return JSON.stringify(sortedJson, null, indent)
    }

    return JSON.stringify(json, null, indent)
  } catch (error) {
    throw new Error('无效的 JSON 格式')
  }
}

/**
 * 压缩 JSON 字符串（移除所有空格和换行）
 * @param jsonString - 输入的 JSON 字符串
 * @returns 压缩后的 JSON 字符串
 * @throws 如果 JSON 格式无效
 */
export const minifyJSON = (jsonString: string): string => {
  try {
    const json = JSON.parse(jsonString)
    return JSON.stringify(json)
  } catch (error) {
    throw new Error('无效的 JSON 格式')
  }
}

/**
 * 验证 JSON 字符串是否有效
 * @param jsonString - 要验证的 JSON 字符串
 * @returns 验证结果和错误信息
 */
export const validateJSON = (
  jsonString: string
): { valid: boolean; error?: string } => {
  try {
    JSON.parse(jsonString)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

/**
 * 递归排序对象的键
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => sortObjectKeys(item))
  }

  if (obj !== null && typeof obj === 'object') {
    const sorted: any = {}
    const keys = Object.keys(obj).sort()
    keys.forEach((key) => {
      sorted[key] = sortObjectKeys(obj[key])
    })
    return sorted
  }

  return obj
}

