import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.jsx'
import './index.css'

// Ant Design 赛博朋克主题配置
const theme = {
  token: {
    colorPrimary: '#ff6b35',      // 主色：橙色霓虹
    colorInfo: '#ff6b35',          // 信息色：橙色霓虹
    colorLink: '#ff6b35',          // 链接色：橙色霓虹
    colorSuccess: '#10b981',       // 成功色：保持绿色
    colorWarning: '#f59e0b',       // 警告色：保持黄色
    colorError: '#ef4444',         // 错误色：保持红色
    borderRadius: 12,              // 圆角：12px
    colorBgContainer: '#ffffff',   // 容器背景：白色
  },
  components: {
    Button: {
      primaryShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
    },
    Input: {
      activeBorderColor: '#ff6b35',
      hoverBorderColor: '#ff9166',
    },
    Select: {
      optionSelectedBg: 'rgba(255, 107, 53, 0.1)',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={zhCN} theme={theme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
