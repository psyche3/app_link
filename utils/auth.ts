/**
 * 用户认证操作工具函数
 * 提供登录、注册、登出等基础认证功能
 */

import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

/**
 * 用户登录
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 用户数据和会话信息
 */
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('登录错误:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * 用户注册
 * @param email - 用户邮箱
 * @param password - 用户密码
 * @returns 用户数据和会话信息
 */
export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('注册错误:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * 用户登出
 */
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('登出错误:', error.message)
    throw new Error(error.message)
  }
}

