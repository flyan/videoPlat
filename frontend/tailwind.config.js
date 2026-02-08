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
        // 渐变色系
        gradient: {
          purple: {
            from: '#667eea',
            to: '#764ba2',
          },
          pink: {
            from: '#f093fb',
            to: '#f5576c',
          },
          blue: {
            from: '#4facfe',
            to: '#00f2fe',
          },
          green: {
            from: '#43e97b',
            to: '#38f9d7',
          },
        },
      },
      // 自定义动画
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
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
