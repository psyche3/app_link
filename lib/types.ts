export interface Tool {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: string
  tags: string[]
}

export interface Favorite {
  id: string
  user_id: string
  tool_slug: string
  created_at: string
}

export interface PasswordEntry {
  id: string
  user_id: string
  encrypted_data: string
  category: string
  created_at: string
  updated_at: string
}

export interface History {
  id: string
  user_id: string
  tool_slug: string
  timestamp: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

