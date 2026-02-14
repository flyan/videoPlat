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
      // 自定义主题色 - 赛博朋克暖色霓虹系统
      colors: {
        primary: {
          50: '#fff5f0',
          100: '#ffe8dc',
          200: '#ffd1b9',
          300: '#ffb896',
          400: '#ff9166',
          500: '#ff6b35',  // 橙色霓虹
          600: '#e65530',
          700: '#cc4028',
          800: '#b32d1f',
          900: '#991d16',
        },
        secondary: {
          50: '#ffe5f5',
          100: '#ffcceb',
          200: '#ff99d7',
          300: '#ff66c3',
          400: '#ff33af',
          500: '#ff1493',  // 粉色霓虹
          600: '#e6127d',
          700: '#cc1067',
          800: '#b30e51',
          900: '#990c3b',
        },
        accent: {
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff9c2',
          300: '#fff6a3',
          400: '#fff385',
          500: '#ffd700',  // 金色霓虹
          600: '#e6c200',
          700: '#ccad00',
          800: '#b39800',
          900: '#998300',
        },
        neon: {
          orange: '#ff6b35',
          pink: '#ff1493',
          purple: '#d946ef',
          gold: '#ffd700',
          cyan: '#00ffff',
        },
        dark: {
          50: '#1e1e2e',
          100: '#1a0a2e',
          200: '#0f0520',
          300: '#0a0a1a',
          400: '#050510',
        },
      },
      // 自定义动画
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'shimmer': 'shimmer 3s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
        'border-rotate': 'borderRotate 3s linear infinite',
        'speaking-pulse': 'speakingPulse 1s ease-in-out infinite',
        'particle-float': 'particleFloat 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in-glow': 'scaleInGlow 0.5s ease-out',
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
      // 自定义缓动函数
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // 自定义阴影
      boxShadow: {
        'glow-sm': '0 0 10px rgba(255, 107, 53, 0.3)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.3), 0 0 40px rgba(255, 20, 147, 0.2)',
        'glow-lg': '0 0 30px rgba(255, 107, 53, 0.5), 0 0 60px rgba(255, 20, 147, 0.3)',
        'glow-accent': '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2)',
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 20, 147, 0.5), 0 0 40px rgba(255, 20, 147, 0.3)',
        'neon-gold': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
      },
    },
  },

  plugins: [],

  // 核心插件配置
  corePlugins: {
    preflight: false,  // 禁用 Tailwind 的基础样式重置，避免与 Ant Design 样式冲突
  },
}
