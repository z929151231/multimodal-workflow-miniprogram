export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS 头，让所有域名都能访问
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 根路径 → 返回 index.html
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return env.ASSETS.fetch(request);
    }

    // 其他路径 → 404
    return new Response('Not Found', { 
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  },
};