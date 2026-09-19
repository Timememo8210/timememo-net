/* ============================================
   墨记Web — 全局配置
   API 通过 Cloudflare Worker 代理，前端零 API Key 暴露
   ============================================ */

window.MOJI_CONFIG = {
  // Worker 代理地址（部署后替换为实际 Worker URL）
  // 本地开发：'http://localhost:8787/api/chat/completions'
  // 部署后：  'https://moji-api.xxx.workers.dev/api/chat/completions'
  API_URL: 'https://moji-api.xiaobo.workers.dev/api/chat/completions',

  // 模型配置
  MODEL: 'glm-4-flash',

  // API调用参数
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048
};
