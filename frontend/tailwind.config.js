/** @type {import('tailwindcss').Config} */
export default {
  // 指定需要扫描的文件，用于生成 CSS
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // 主题配置
  theme: {
    extend: {
      // 自定义主题色 - 蓝色系
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // 主色调
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },

  plugins: [],

  // 核心插件配置
  corePlugins: {
    preflight: false,  // 禁用 Tailwind 的基础样式重置，避免与 Ant Design 样式冲突
  },
}
