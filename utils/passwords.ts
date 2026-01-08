/**
 * 密码管理工具函数
 * 用于存储和获取用户密码
 */

import { supabase } from '@/lib/supabase'

/**
 * 存储密码到数据库
 * @param userId - 用户 ID
 * @param passwordData - 加密后的密码数据
 * @returns 存储结果
 */
export const storePassword = async (userId: string, passwordData: string) => {
  const { data, error } = await supabase
    .from('passwords')
    .insert([{ user_id: userId, encrypted_data: passwordData }])
    .select()
    .single()

  if (error) {
    console.error('存储密码错误:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * 获取用户的所有密码
 * @param userId - 用户 ID
 * @returns 密码列表
 */
export const getPasswords = async (userId: string) => {
  const { data, error } = await supabase
    .from('passwords')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取密码错误:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * 更新密码
 * @param id - 密码条目 ID
 * @param passwordData - 加密后的密码数据
 * @returns 更新结果
 */
export const updatePassword = async (id: string, passwordData: string) => {
  const { data, error } = await supabase
    .from('passwords')
    .update({ encrypted_data: passwordData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('更新密码错误:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * 删除密码
 * @param id - 密码条目 ID
 */
export const deletePassword = async (id: string) => {
  const { error } = await supabase.from('passwords').delete().eq('id', id)

  if (error) {
    console.error('删除密码错误:', error.message)
    throw new Error(error.message)
  }
}

