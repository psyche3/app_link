# DevToolHub

一个现代化的开发工具集合网站，基于 React + Next.js + Tailwind CSS + TypeScript 构建。

## 功能特性

- 🛠️ 多种开发工具（JSON格式化、密码生成、PDF转换等）
- 🔐 密码记事本（AES 加密存储）
- ⭐ 收藏夹功能
- 🎨 暗色/亮色主题切换
- 📱 响应式设计
- ☁️ Supabase 云同步（可选）
- 🔍 工具搜索功能
- 📊 最近使用记录

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **后端**: Supabase (Auth + Database)
- **动画**: Framer Motion
- **图标**: Lucide React
- **加密**: CryptoJS

## 项目结构

```
app/
├── layout.tsx           # 全局布局
├── page.tsx             # 首页
├── favorites/           # 收藏夹页面
├── passwords/           # 密码记事本
│   └── components/      # 密码管理组件
├── tool/[slug]/         # 动态工具页
│   └── components/      # 工具组件
└── settings/            # 设置页面

components/
├── layout/              # 布局组件
├── tools/               # 工具相关组件
└── ui/                  # 通用 UI 组件

lib/
├── tools.ts             # 工具数据
├── types.ts             # TypeScript 类型
├── utils.ts             # 工具函数
├── supabase.ts          # Supabase 客户端
├── formatJSON.ts        # JSON 格式化函数
├── crypto.ts            # 加密解密函数
├── validator.ts         # 数据校验函数
└── api.ts               # API 请求封装

store/
├── useStore.ts          # 全局状态管理（最近使用、语言）
├── usePasswordStore.ts  # 密码管理状态（支持云同步）
├── useFavorites.ts      # 收藏夹状态（支持云同步）
├── useAuth.ts           # 用户认证状态
├── useToolHistory.ts    # 工具使用历史状态
└── useTheme.ts          # 主题状态管理

lib/
├── auth.ts              # 用户认证 API
└── api.ts               # Supabase API 封装

components/
└── auth/
    ├── LoginModal.tsx   # 登录弹窗
    └── RegisterModal.tsx # 注册弹窗
```

## 开发环境

- Node.js >= 18.0
- pnpm 或 npm

## 安装与运行

### 1. 安装依赖

```bash
# 使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 2. 配置环境变量

复制 `env.example` 文件为 `.env.local`：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，填入你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 注意：如果没有 Supabase 配置，应用仍可正常运行，但云同步功能将不可用。

### 3. 运行开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
# 使用 pnpm
pnpm build

# 或使用 npm
npm run build
```

### 5. 启动生产服务器

```bash
# 使用 pnpm
pnpm start

# 或使用 npm
npm start
```

## 可用工具

1. **JSON 格式化** - 格式化、压缩和验证 JSON 数据，支持下载
2. **图片拼接** - 将多张图片水平或垂直拼接成一张大图
3. **PDF 转 Word** - 将 PDF 文件转换为 Word 文档（需要配置 CloudConvert API）
4. **密码生成器** - 生成安全随机密码，支持自定义长度和字符集，支持下载
5. **时间戳转换** - UNIX 时间戳与可读时间互转
6. **正则测试器** - 测试和调试正则表达式，实时高亮显示匹配结果
7. **UUID 生成器** - 快速生成随机 UUID
8. **JWT 解析器** - 解码和验证 JWT Token
9. **Mock 数据生成器** - 生成结构化随机测试数据

更多工具正在开发中...

## 功能说明

### 密码记事本

- 使用 AES 加密算法加密存储
- 支持分类管理
- 主密码保护
- 一键复制账号密码

### 收藏夹

- 快速收藏常用工具
- 本地存储（LocalStorage）
- 支持取消收藏

### 主题切换

- 支持亮色/暗色主题
- 自动保存用户偏好
- 系统主题检测（计划中）

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 其他平台

项目可以部署到任何支持 Next.js 的平台，如：
- Netlify
- Railway
- AWS Amplify
- 自托管服务器

## 开发计划

- [x] V1.0 - 基础工具和页面
- [x] V2.0 - 收藏夹和最近使用
- [x] V3.0 - 密码记事本
- [x] V3.1 - 功能模块完善（JSON格式化、图片拼接、PDF转Word）
- [ ] V4.0 - Supabase 集成
- [ ] V5.0 - AI 助手
- [ ] V6.0 - 插件系统

## API 配置

### CloudConvert API（PDF 转 Word）

PDF 转 Word 功能需要配置 CloudConvert API Key。详细配置步骤请参考 [API 配置指南](./docs/API_SETUP.md)。

快速配置：
1. 注册 [CloudConvert](https://cloudconvert.com) 账号
2. 获取 API Key
3. 在 `.env.local` 中添加：`CLOUDCONVERT_API_KEY=your_api_key`
4. 重启开发服务器

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 联系方式

如有问题或建议，请提交 Issue。
