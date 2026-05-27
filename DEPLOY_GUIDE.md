# 🚀 Cloudflare Workers 部署指南

完整部署步骤，按照顺序操作即可。

---

## 📋 准备工作

| 项目 | 说明 |
|------|------|
| **Node.js** | 需要 v18+ |
| **GitHub 账号** | 用于代码托管 |
| **Cloudflare 账号** | 免费注册：https://dash.cloudflare.com/sign-up |
| **智谱 AI API Key** | https://open.bigmodel.cn/ |

---

## 📦 步骤 1：安装 Cloudflare CLI

```bash
# 全局安装 Wrangler（Cloudflare 官方 CLI 工具）
npm install -g wrangler

# 验证安装
wrangler --version
```

---

## 🔑 步骤 2：登录 Cloudflare

```bash
# 打开浏览器登录你的 Cloudflare 账号
wrangler login
```

成功后会看到：
```
✓ Logged in as <your-email>
✓ Account ID: <your-account-id>
```

---

## 📤 步骤 3：部署 Workers

### 3.1 进入项目目录

```bash
cd D:/projects/miniprogram-workers
```

### 3.2 安装依赖

```bash
npm install
```

### 3.3 设置 API Key（关键步骤！）

```bash
# 将智谱 AI API Key 设置为 Workers 环境变量
npx wrangler secret put ZHIPU_API_KEY
```

系统会提示你输入密钥，粘贴你的智谱 AI API Key：
```
4c5103ef14254a5da223e5de0bd27879.Pt0orCbAoQGgXwSU
```

### 3.4 首次部署

```bash
# 部署到 Cloudflare
npx wrangler deploy
```

部署成功后会看到：
```
🎉 Uploaded miniprogram-api-proxy (XXms)
🔨 Generated an output bundle at ./dist

Your Worker has access to the following secrets:
1. ZHIPU_API_KEY (api key)

👀 View the live output of your Worker's logs at:
https://dash.cloudflare.com/<your-account>/workers/<your-worker-name>/logs
```

---

## 🌐 步骤 4：获取 Workers URL

部署完成后，Cloudflare 会生成一个 URL，格式如下：

```
https://miniprogram-api-proxy.<your-name>.workers.dev
```

你可以在以下地方找到：
1. **终端输出** — 部署完成后直接显示
2. **Cloudflare 控制台** — Workers & Pages → 你的 Worker → Details

---

## 📱 步骤 5：修改小程序代码

打开 `D:/projects/miniprogram/config/api-config.js`，修改 Workers 地址：

```javascript
module.exports = {
  proxy: {
    // 替换为你的 Workers URL
    baseUrl: 'https://miniprogram-api-proxy.your-name.workers.dev',
    analyzeEndpoint: '/api/analyze',
  },
  // ...
};
```

---

## ⚠️ 步骤 6：配置微信域名白名单

### 6.1 登录微信公众平台

https://mp.weixin.qq.com

### 6.2 配置合法域名

1. 进入 **开发 → 开发管理 → 开发设置**
2. 找到 **服务器域名** 部分
3. 点击 **request 合法域名** 的「修改」按钮
4. 添加你的 Workers URL：
   ```
   https://miniprogram-api-proxy.your-name.workers.dev
   ```
5. 保存并提交

### 6.3 审核时间

- 通常 **几小时内** 完成审核
- 可以在 **微信公众平台 → 通知中心** 查看审核进度
- Workers 域名通常审核较快，因为 Cloudflare 是可信基础设施

---

## 🧪 步骤 7：测试

### 7.1 健康检查

在浏览器访问：
```
https://miniprogram-api-proxy.your-name.workers.dev/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2026-05-27T...",
  "service": "miniprogram-api-proxy"
}
```

### 7.2 小程序真机测试

1. 打开微信开发者工具
2. 编译小程序
3. 点击 **预览** 按钮
4. 微信扫码进入小程序
5. 上传测试图片，点击 **一键生成**

---

## 📊 监控与日志

### Cloudflare 控制台

访问：https://dash.cloudflare.com → Workers & Pages → 你的 Worker

- **Analytics** — 查看请求量、错误率、延迟
- **Logs** — 实时查看 Workers 日志
- **Triggers** — 管理域名路由

### 小程序 Console

在微信开发者工具的 **Console** 面板查看日志：
```
[Workers] 响应状态: 200
[Workers] 响应数据: {...}
[AI] 分析结果: ...
```

---

## 🔧 常见问题

### Q: 部署失败，显示 "Account ID not found"

**A**: 在 `wrangler.toml` 中添加账户 ID：

```toml
account_id = "你的账户ID"  # 从 https://dash.cloudflare.com/account/account-details 获取
```

### Q: Workers 返回 500 错误

**A**: 检查 Cloudflare 控制台日志，通常是：
- API Key 未正确设置
- 智谱 AI API 端点变更
- 请求体格式问题

### Q: 小程序请求失败 "network timeout"

**A**: 
- 确认域名已在微信后台添加并通过审核
- 在开发者工具勾选「不校验合法域名」进行本地测试

### Q: 需要多个 API 怎么办？

**A**: 修改 `src/index.js` 添加更多路由：
```javascript
// 添加新的路由
if (path === '/api/qwen') {
  return handleQwen(request, env, corsHeaders);
}
```

---

## 💰 费用说明

| 项目 | 费用 |
|------|------|
| **Cloudflare Workers** | 🆓 免费 100,000 请求/天 |
| **智谱 AI GLM-4V-Flash** | 🆓 永久免费（有额度限制） |
| **GitHub Actions 自动部署** | 🆓 2,000 分钟/月 |
| **微信域名审核** | 🆓 免费 |

**个人使用完全免费！**

---

## ✅ 完成清单

- [ ] 安装 Wrangler CLI
- [ ] 登录 Cloudflare (`wrangler login`)
- [ ] 设置 ZHIPU_API_KEY 环境变量
- [ ] 首次部署 (`npx wrangler deploy`)
- [ ] 记录 Workers URL
- [ ] 修改小程序 `api-config.js` 中的 Workers URL
- [ ] 微信后台添加 request 合法域名
- [ ] 等待域名审核通过
- [ ] 真机测试成功

---

**祝你部署顺利！遇到问题随时问我。** 🚀
