# API 配置指南

## CloudConvert API 配置

PDF 转 Word 功能需要使用 CloudConvert API。以下是配置步骤：

### 1. 注册 CloudConvert 账号

访问 [CloudConvert](https://cloudconvert.com) 并注册账号。

### 2. 获取 API Key

1. 登录 CloudConvert 账号
2. 前往 [API Keys 页面](https://cloudconvert.com/dashboard/api-keys)
3. 创建新的 API Key
4. 复制 API Key（注意：API Key 只会显示一次，请妥善保存）

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```env
CLOUDCONVERT_API_KEY=your_cloudconvert_api_key
```

### 4. 重启开发服务器

配置环境变量后，需要重启开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
pnpm dev
```

### 5. 测试功能

1. 访问 `/tool/pdf-to-word` 页面
2. 上传一个 PDF 文件
3. 点击"开始转换"按钮
4. 等待转换完成
5. 下载转换后的 Word 文件

## API 限制

- **免费版限制**：
  - 每天 25 次转换
  - 文件大小限制：1GB
  - 转换时间限制：120 分钟

- **付费版**：
  - 更多转换次数
  - 更大的文件大小限制
  - 更快的转换速度
  - 优先处理

## 故障排除

### 错误：API Key 未配置

**解决方案**：
1. 检查 `.env.local` 文件是否存在
2. 确认 `CLOUDCONVERT_API_KEY` 环境变量已正确设置
3. 重启开发服务器

### 错误：转换失败

**可能原因**：
1. API Key 无效或已过期
2. 文件格式不支持
3. 文件大小超过限制
4. 网络连接问题

**解决方案**：
1. 检查 API Key 是否有效
2. 确认文件格式为 PDF
3. 检查文件大小是否超过限制（50MB）
4. 检查网络连接

### 错误：转换超时

**解决方案**：
1. 尝试使用较小的文件
2. 检查网络连接
3. 稍后重试

## 替代方案

如果 CloudConvert API 不可用，可以考虑以下替代方案：

1. **本地转换**：使用 LibreOffice 命令行工具
2. **其他云服务**：使用其他 PDF 转换服务
3. **客户端转换**：使用浏览器端的 PDF.js 库（功能有限）

## 相关链接

- [CloudConvert API 文档](https://cloudconvert.com/api/v2)
- [CloudConvert 定价](https://cloudconvert.com/pricing)
- [API Keys 管理](https://cloudconvert.com/dashboard/api-keys)

