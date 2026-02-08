/**
 * 在主页添加管理台入口的示例代码
 *
 * 将以下代码添加到 Home.jsx 中
 */

// 1. 在导入部分添加管理台图标
import {
  VideoCameraOutlined,
  PlusOutlined,
  LogoutOutlined,
  HistoryOutlined,
  LockOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
  DashboardOutlined, // 添加这一行
} from '@ant-design/icons'

// 2. 在用户菜单中添加管理台选项（仅管理员可见）
// 找到 userMenuItems 定义，修改为：

const userMenuItems = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人资料',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置',
  },
  // 添加管理台入口（仅管理员可见）
  ...(user?.role === 'admin'
    ? [
        {
          type: 'divider',
        },
        {
          key: 'admin',
          icon: <DashboardOutlined />,
          label: '管理台',
          onClick: () => navigate('/admin'),
        },
      ]
    : []),
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
    onClick: handleLogout,
  },
]

// 3. 或者在快速访问区域添加管理台卡片（仅管理员可见）
// 找到快速访问部分，在 quick-access-grid 中添加：

<section className="quick-access-section">
  <h2 className="section-title">快速访问</h2>
  <div className="quick-access-grid">
    {/* 管理台入口（仅管理员可见） */}
    {user?.role === 'admin' && (
      <div
        className="quick-access-card"
        onClick={() => navigate('/admin')}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="qa-icon">
          <DashboardOutlined />
        </div>
        <span className="qa-label">管理台</span>
      </div>
    )}

    <div
      className="quick-access-card"
      onClick={() => navigate('/recordings')}
    >
      <div className="qa-icon">
        <HistoryOutlined />
      </div>
      <span className="qa-label">录制记录</span>
    </div>

    <div className="quick-access-card">
      <div className="qa-icon">
        <SettingOutlined />
      </div>
      <span className="qa-label">个人设置</span>
    </div>

    <div className="quick-access-card">
      <div className="qa-icon">
        <QuestionCircleOutlined />
      </div>
      <span className="qa-label">帮助中心</span>
    </div>

    <div className="quick-access-card">
      <div className="qa-icon">
        <MessageOutlined />
      </div>
      <span className="qa-label">反馈建议</span>
    </div>
  </div>
</section>

// 4. 或者在顶部导航栏添加管理台按钮（仅管理员可见）
// 找到 header-right 部分，添加：

<div className="header-right">
  {/* 管理台按钮（仅管理员可见） */}
  {user?.role === 'admin' && (
    <Button
      icon={<DashboardOutlined />}
      type="text"
      className="header-button"
      onClick={() => navigate('/admin')}
    >
      管理台
    </Button>
  )}

  <Button
    icon={<HistoryOutlined />}
    type="text"
    className="header-button"
    onClick={() => navigate('/recordings')}
  >
    录制记录
  </Button>

  <Dropdown
    menu={{ items: userMenuItems }}
    placement="bottomRight"
    trigger={['click']}
  >
    <div className="user-profile">
      <Avatar size={36} className="user-avatar">
        {(user?.nickname || user?.username)?.[0]?.toUpperCase()}
      </Avatar>
      <div className="user-info">
        <span className="user-name">
          {user?.nickname || user?.username}
        </span>
        {user?.userType === 'GUEST' && (
          <span className="user-badge">游客</span>
        )}
      </div>
    </div>
  </Dropdown>
</div>

// 5. 如果需要在 Home.css 中添加管理台卡片的特殊样式：

/*
.quick-access-card[style*="linear-gradient"] {
  color: white;
}

.quick-access-card[style*="linear-gradient"] .qa-icon {
  background: rgba(255, 255, 255, 0.2);
}

.quick-access-card[style*="linear-gradient"]:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}
*/

/**
 * 推荐方案：
 *
 * 1. 在用户下拉菜单中添加管理台入口（方案 2）
 *    - 优点：不占用主界面空间，只对管理员可见
 *    - 适合：管理台不是频繁使用的功能
 *
 * 2. 在快速访问区域添加管理台卡片（方案 3）
 *    - 优点：醒目，易于访问
 *    - 适合：管理员需要经常访问管理台
 *
 * 3. 在顶部导航栏添加管理台按钮（方案 4）
 *    - 优点：最醒目，一键直达
 *    - 适合：管理台是核心功能
 *
 * 可以同时使用多个方案，提供多个入口。
 */
