/**
 * API 请求封装
 */

import { supabase } from './supabase'

/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 通用 API 请求函数
 */
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || '请求失败',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    }
  }
}

/**
 * Supabase 相关 API
 */

/**
 * 获取用户收藏的工具
 */
export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 添加收藏
 */
export const addFavorite = async (userId: string, toolSlug: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      tool_slug: toolSlug,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 删除收藏
 */
export const removeFavorite = async (userId: string, toolSlug: string) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('tool_slug', toolSlug)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * 获取密码条目
 */
export const getPasswords = async (userId: string) => {
  const { data, error } = await supabase
    .from('passwords')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 添加密码条目
 */
export const addPassword = async (
  userId: string,
  encryptedData: string,
  category: string
) => {
  const { data, error } = await supabase
    .from('passwords')
    .insert({
      user_id: userId,
      encrypted_data: encryptedData,
      category,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 更新密码条目
 */
export const updatePassword = async (
  id: string,
  encryptedData: string,
  category: string
) => {
  const { data, error } = await supabase
    .from('passwords')
    .update({
      encrypted_data: encryptedData,
      category,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 删除密码条目
 */
export const deletePassword = async (id: string) => {
  const { error } = await supabase.from('passwords').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * 添加工具使用历史
 */
export const addToolHistory = async (userId: string, toolSlug: string) => {
  const { data, error } = await supabase
    .from('history')
    .insert({
      user_id: userId,
      tool_slug: toolSlug,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 获取工具使用历史
 */
export const getToolHistory = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

