/**
 * 用户认证相关 API
 */

import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

/**
 * 用户注册
 */
export const signUp = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    // 检查 Supabase 客户端是否已正确初始化
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase 客户端未初始化，请检查环境变量配置'),
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return {
        user: null,
        session: null,
        error: new Error(error.message),
      }
    }

    // 注册成功，即使需要邮箱验证（user 可能为 null）
    return {
      user: data.user,
      session: data.session,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('注册失败'),
    }
  }
}

/**
 * 用户登录
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    // 检查 Supabase 客户端是否已正确初始化
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase 客户端未初始化，请检查环境变量配置'),
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        user: null,
        session: null,
        error: new Error(error.message),
      }
    }

    if (!data.user || !data.session) {
      return {
        user: null,
        session: null,
        error: new Error('登录失败：未获取到用户信息或会话'),
      }
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('登录失败'),
    }
  }
}

/**
 * 用户登出
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('登出失败'),
    }
  }
}

/**
 * 获取当前用户
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // 先检查是否有会话，避免在没有会话时调用 getUser() 抛出错误
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // 没有会话是正常情况（用户未登录），直接返回 null
      return null
    }

    // 有会话时才获取用户信息
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      // 只有在有会话但获取用户失败时才记录错误
      // 检查是否是会话缺失错误（可能是会话已过期）
      if (error.message?.includes('session') || error.message?.includes('Session')) {
        // 会话相关错误，静默处理
        return null
      }
      console.error('获取用户失败:', error)
      return null
    }

    return user
  } catch (error) {
    // 检查是否是会话缺失错误
    if (
      error instanceof Error &&
      (error.message?.includes('session') ||
        error.message?.includes('Session') ||
        error.name?.includes('AuthSessionMissing'))
    ) {
      // 会话缺失是正常情况，静默处理
      return null
    }
    console.error('获取用户失败:', error)
    return null
  }
}

/**
 * 获取当前会话
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      // 会话相关错误通常是正常情况（用户未登录），不记录错误
      if (
        error.message?.includes('session') ||
        error.message?.includes('Session') ||
        error.name?.includes('AuthSessionMissing')
      ) {
        return null
      }
      console.error('获取会话失败:', error)
      return null
    }

    return session
  } catch (error) {
    // 检查是否是会话缺失错误
    if (
      error instanceof Error &&
      (error.message?.includes('session') ||
        error.message?.includes('Session') ||
        error.name?.includes('AuthSessionMissing'))
    ) {
      // 会话缺失是正常情况，静默处理
      return null
    }
    console.error('获取会话失败:', error)
    return null
  }
}

/**
 * 重置密码
 */
export const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('重置密码失败'),
    }
  }
}

/**
 * 更新密码
 */
export const updatePassword = async (
  newPassword: string
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('更新密码失败'),
    }
  }
}

