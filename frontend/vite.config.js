import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite 配置文档: https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // React 插件配置
    plugins: [react()],

    // 路径别名配置
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),  // 使用 @ 代替 src 路径
      },
    },

    // 开发服务器配置
    server: {
      port: 3000,  // 开发服务器端口
      proxy: {
        // 代理 API 请求到后端，避免跨域问题
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,  // 修改请求头中的 origin
        },
      },
    },

    // 生产构建配置
    build: {
      outDir: 'dist',  // 构建输出目录
      sourcemap: false,  // 生产环境不生成 sourcemap
      // Rollup 打包配置
      rollupOptions: {
        output: {
          // 手动分包，优化加载性能
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],  // React 核心库
            'agora-vendor': ['agora-rtc-sdk-ng'],  // Agora SDK 单独打包
            'ui-vendor': ['antd'],  // UI 组件库单独打包
          },
        },
      },
    },
  }
})
