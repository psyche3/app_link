import { Tool } from './types'

export const tools: Tool[] = [
  {
    id: '1',
    slug: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化、压缩和验证 JSON 数据',
    icon: 'Braces',
    category: '格式化',
    tags: ['json', '格式化', '验证'],
  },
  {
    id: '2',
    slug: 'password-generator',
    name: '密码生成器',
    description: '生成安全随机密码',
    icon: 'Key',
    category: '安全',
    tags: ['密码', '生成', '安全'],
  },
  {
    id: '3',
    slug: 'timestamp-converter',
    name: '时间戳转换',
    description: 'UNIX 时间戳与可读时间互转',
    icon: 'Clock',
    category: '时间',
    tags: ['时间戳', '时间', '转换'],
  },
  {
    id: '4',
    slug: 'regex-tester',
    name: '正则测试器',
    description: '测试和调试正则表达式',
    icon: 'Code',
    category: '开发工具',
    tags: ['正则', 'regex', '测试'],
  },
  {
    id: '5',
    slug: 'mock-data-generator',
    name: 'Mock 数据生成器',
    description: '生成结构化随机测试数据',
    icon: 'Database',
    category: '开发工具',
    tags: ['mock', '数据', '测试'],
  },
  {
    id: '6',
    slug: 'uuid-generator',
    name: 'UUID 生成器',
    description: '快速生成随机 UUID',
    icon: 'Hash',
    category: '开发工具',
    tags: ['uuid', '生成', '标识符'],
  },
  {
    id: '7',
    slug: 'jwt-decoder',
    name: 'JWT 解析器',
    description: '解码和验证 JWT Token',
    icon: 'Lock',
    category: '安全',
    tags: ['jwt', 'token', '解析'],
  },
  {
    id: '8',
    slug: 'encryption-tool',
    name: '加密解密工具',
    description: '集成 Base64、哈希、AES/DES、RSA 等常用加解密功能',
    icon: 'Shield',
    category: '安全',
    tags: ['加密', '解密', 'base64', 'hash'],
  },
  {
    id: '9',
    slug: 'cron-generator',
    name: 'Cron 表达式工具',
    description: '解析、生成 Cron 表达式并查看执行时间',
    icon: 'CalendarClock',
    category: '开发工具',
    tags: ['cron', '定时任务', '调度'],
  },
  {
    id: '10',
    slug: 'url-parser',
    name: 'URL 查询编辑器',
    description: '解析、编辑并重新生成 URL 及查询参数',
    icon: 'Link2',
    category: '网络',
    tags: ['url', 'query', '参数'],
  },
]

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug)
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((tool) => tool.category === category)
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase()
  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

