# 🤖 MiniProgram API Proxy

Cloudflare Workers API 中转服务，用于小程序安全调用第三方 AI API。

## 📁 项目结构

```
miniprogram-api-proxy/
├── src/
│   └── index.js          # Workers 主代码
├── package.json          # 项目配置
├── wrangler.toml         # Wrangler 配置
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 自动部署
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
# 本地启动，模拟 Workers 环境
npm run dev
```

### 3. 部署到 Cloudflare

#### 首次部署

```bash
# 登录 Cloudflare（需要拥有账号）
npx wrangler login

# 创建资源
npx wrangler deploy

# 设置 API Key 环境变量（重要！）
npx wrangler secret put ZHIPU_API_KEY
# 输入你的智谱 AI API Key

# 设置 Cloudflare 账户 ID（如需）
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
```

#### 自动部署（推荐）

1. 在 [GitHub](https://github.com/new) 创建仓库 `miniprogram-api-proxy`
2. 推送代码：
   ```bash
   git init
   git add .
   git commit -m "init: first commit"
   git remote add origin git@github.com:YOUR_USERNAME/miniprogram-api-proxy.git
   git push -u origin main
   ```
3. 在 GitHub 仓库设置中添加 Secrets：
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API Token（从 https://dash.cloudflare.com/profile/api-tokens 获取）
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID
4. 每次推送到 `main` 分支自动部署

## 🔑 API Key 获取

| 服务 | 地址 |
|------|------|
| **Cloudflare API Token** | https://dash.cloudflare.com/profile/api-tokens |
| **智谱 AI API Key** | https://open.bigmodel.cn/ |

## 🌐 API 使用

### 健康检查

```bash
curl https://YOUR_WORKER_NAME.YOUR_USERNAME.workers.dev/health
```

### 分析图片（调用智谱 GLM-4V）

```bash
curl -X POST https://YOUR_WORKER_NAME.YOUR_USERNAME.workers.dev/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4v-flash",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}},
          {"type": "text", "text": "Describe this image"}
        ]
      }
    ]
  }'
```

## 📱 小程序调用示例

```javascript
const API_BASE_URL = 'https://YOUR_WORKER_NAME.YOUR_USERNAME.workers.dev';

wx.request({
  url: `${API_BASE_URL}/api/analyze`,
  method: 'POST',
  header: {
    'Content-Type': 'application/json',
  },
  data: {
    model: 'glm-4v-flash',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageSrc } },
          { type: 'text', text: 'Please analyze this image and output an English prompt for image generation.' }
        ]
      }
    ],
    temperature: 0.3,
    top_p: 0.5,
  },
  success: (res) => {
    console.log('分析结果:', res.data);
    // res.data.choices[0].message.content 就是生成的提示词
  },
  fail: (err) => {
    console.error('请求失败:', err);
  }
});
```

## ⚙️ 免费额度

| 服务 | 免费额度 |
|------|----------|
| **Cloudflare Workers** | 100,000 请求/天 |
| **GitHub Actions** | 2,000 分钟/月 |

## 🔒 安全提示

1. ✅ **API Key 安全**：智谱 AI API Key 存在 Cloudflare 环境变量中，不会暴露在前端
2. ✅ **CORS 限制**：默认允许所有来源，生产环境建议改为特定小程序域名
3. ⚠️ **监控用量**：在 Cloudflare 控制台监控请求量，防止滥用

## 📊 监控

1. 登录 Cloudflare Dashboard
2. 进入 Workers 服务 → Analytics
3. 查看请求数、错误率、延迟等指标

---

**Created with ❤️ for MiniProgram + Cloudflare + AI**
