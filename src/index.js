/**
 * Cloudflare Workers API 中转服务
 * 用于小程序安全调用第三方 AI API（智谱 GLM-4V）
 * 
 * API Key 在 Cloudflare 控制台设置：ZHIPU_API_KEY
 */

export default {
  async fetch(request, env) {
    // ========== CORS 配置（允许小程序跨域访问）==========
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // 实际生产建议限制为小程序域名
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    // 处理预检请求 (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ========== 路由处理 ==========
    const url = new URL(request.url);
    const path = url.pathname;

    // 健康检查端点
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'miniprogram-api-proxy',
      }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // API 分析端点（智谱 GLM-4V）
    if (path === '/api/analyze' || path === '/api/v1/analyze') {
      return handleAnalyze(request, env, corsHeaders);
    }

    // 默认返回 404
    return new Response(JSON.stringify({
      error: 'Not Found',
      path: path,
      availableEndpoints: [
        'GET /health',
        'POST /api/analyze',
      ],
    }), {
      status: 404,
      headers: corsHeaders,
    });
  },
};

/**
 * 处理图片分析请求
 * 转发给智谱 AI GLM-4V-Flash
 */
async function handleAnalyze(request, env, corsHeaders) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method Not Allowed',
      message: '请使用 POST 方法',
    }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // 获取 API Key（从环境变量，不会暴露在前端）
  const API_KEY = env.ZHIPU_API_KEY;

  if (!API_KEY) {
    console.error('[ERROR] ZHIPU_API_KEY 未配置');
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: 'API Key 未配置',
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    // 解析请求体
    const body = await request.json();
    console.log('[Request]', {
      model: body.model,
      hasMessages: !!body.messages,
      messageCount: body.messages?.length || 0,
    });

    // 智谱 AI API 端点
    const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    // 转发请求到智谱 AI
    const proxyResponse = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model || 'glm-4v-flash',
        messages: body.messages || [],
        temperature: body.temperature || 0.3,
        top_p: body.top_p || 0.5,
        stream: false,
      }),
    });

    // 记录响应状态
    const responseStatus = proxyResponse.status;
    console.log('[Response]', {
      status: responseStatus,
      statusText: proxyResponse.statusText,
    });

    // 获取响应数据
    const responseData = await proxyResponse.json();

    // 如果智谱 API 返回错误，返回友好错误消息
    if (responseStatus !== 200 || responseData.error) {
      console.error('[Zhipu Error]', responseData);
      return new Response(JSON.stringify({
        error: 'AI API Error',
        status: responseStatus,
        message: responseData.error?.message || '智谱 AI API 调用失败',
        details: responseData,
      }), {
        status: responseStatus,
        headers: corsHeaders,
      });
    }

    // 成功返回结果
    console.log('[Success]', {
      model: responseData.model,
      promptLength: responseData.choices?.[0]?.message?.content?.length || 0,
      usage: responseData.usage,
    });

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    console.error('[Proxy Error]', err);
    return new Response(JSON.stringify({
      error: 'Proxy Error',
      message: err.message,
      stack: err.stack,
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
