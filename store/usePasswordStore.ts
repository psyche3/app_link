import { create } from 'zustand'
import { PasswordEntry } from '@/lib/types'
import { encryptData as encrypt, decryptData as decrypt } from '@/lib/crypto'
import {
  getPasswords as getPasswordsApi,
  addPassword as addPasswordApi,
  updatePassword as updatePasswordApi,
  deletePassword as deletePasswordApi,
} from '@/lib/api'
import { supabase } from '@/lib/supabase'

/**
 * 密码记事本状态管理
 * 支持本地存储和 Supabase 云同步
 */
interface PasswordState {
  entries: PasswordEntry[]
  masterPassword: string | null
  isLoading: boolean
  error: string | null

  setMasterPassword: (password: string | null) => void
  setEntries: (entries: PasswordEntry[]) => void
  
  // 本地操作
  addEntry: (entry: Omit<PasswordEntry, 'id' | 'created_at' | 'updated_at'>) => void
  updateEntry: (id: string, entry: Partial<PasswordEntry>) => void
  deleteEntry: (id: string) => void
  encryptData: (data: string, password: string) => string
  decryptData: (encryptedData: string, password: string) => string

  // 云同步操作
  syncPasswords: () => Promise<void>
  loadPasswordsFromCloud: () => Promise<void>
}

export const usePasswordStore = create<PasswordState>((set, get) => ({
  entries: [],
  masterPassword: null,
  isLoading: false,
  error: null,

  setMasterPassword: (password) => set({ masterPassword: password }),

  setEntries: (entries) => set({ entries }),

  addEntry: async (entry) => {
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    set((state) => ({ entries: [...state.entries, newEntry] }))

    // 如果用户已登录，同步到云端
    const syncToCloud = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && get().masterPassword) {
        try {
          await addPasswordApi(user.id, entry.encrypted_data, entry.category)
        } catch (error) {
          console.error('同步密码到云端失败:', error)
        }
      }
    }
    syncToCloud()
  },

  updateEntry: async (id, updates) => {
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updated_at: new Date().toISOString() }
          : entry
      ),
    }))

    // 如果用户已登录，同步到云端
    const syncToCloud = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user && updates.encrypted_data) {
        try {
          await updatePasswordApi(id, updates.encrypted_data, updates.category || '')
        } catch (error) {
          console.error('更新云端密码失败:', error)
        }
      }
    }
    syncToCloud()
  },

  deleteEntry: async (id) => {
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    }))

    // 如果用户已登录，同步到云端
    const syncToCloud = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          await deletePasswordApi(id)
        } catch (error) {
          console.error('从云端删除密码失败:', error)
        }
      }
    }
    syncToCloud()
  },

  encryptData: (data, password) => {
    return encrypt(data, password)
  },

  decryptData: (encryptedData, password) => {
    return decrypt(encryptedData, password)
  },

  // 同步密码到云端
  syncPasswords: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    set({ isLoading: true, error: null })

    try {
      const { entries, masterPassword } = get()
      if (!masterPassword) {
        throw new Error('请先设置主密码')
      }

      // 获取云端密码
      const cloudPasswords = await getPasswordsApi(user.id)

      // 合并本地和云端密码
      const allPasswords = [...entries]

      // 添加云端有但本地没有的
      for (const cloudPassword of cloudPasswords) {
        const exists = entries.find((e) => e.id === cloudPassword.id)
        if (!exists) {
          allPasswords.push(cloudPassword as PasswordEntry)
        }
      }

      // 同步本地有但云端没有的
      for (const entry of entries) {
        const exists = cloudPasswords.find((p: any) => p.id === entry.id)
        if (!exists) {
          await addPasswordApi(user.id, entry.encrypted_data, entry.category)
        }
      }

      set({ entries: allPasswords })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '同步失败',
      })
    } finally {
      set({ isLoading: false })
    }
  },

  // 从云端加载密码
  loadPasswordsFromCloud: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    set({ isLoading: true, error: null })

    try {
      const cloudPasswords = await getPasswordsApi(user.id)
      set({ entries: cloudPasswords as PasswordEntry[] })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载失败',
      })
    } finally {
      set({ isLoading: false })
    }
  },
}))

