// 全局配置文件
// 在实际工程中，部分配置可能来自 .env 文件

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  NOT_FOUND: '/404',
  FORBIDDEN: '/403'
};

export const APP_CONFIG = {
  // 基础配置
  APP_NAME: 'VectorAdmin Pro',
  VERSION: '1.0.2',
  
  // 网络配置
  // 开启 Mock 模式以修复 "Network Error"
  USE_MOCK_API: true, 
  API_BASE_URL: process.env.NODE_ENV === 'production' ? 'https://api.vectoradmin.com' : '/api',
  TIMEOUT: 10000,
  
  // 开发服务器配置 (仅作为示例展示工程化配置项，实际生效需在 vite.config.ts)
  DEV_SERVER: {
    PORT: 8000, // Frontend Port
    OPEN: true,
    CORS: true,
    PROXY: {
      '/api': {
        target: 'http://localhost:8001', // Backend Port
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      }
    }
  },

  // 存储键名
  STORAGE_KEYS: {
    TOKEN: 'token',
    THEME: 'theme_settings',
    USER_INFO: 'user_info',
    REMEMBER_ME: 'remember_me_expires'
  },

  ROUTES
};