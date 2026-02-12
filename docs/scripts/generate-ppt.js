const pptxgen = require('pptxgenjs');

// 创建演示文稿
const pres = new pptxgen();

// 设置演示文稿属性
pres.author = 'VideoPlat Team';
pres.title = 'VideoPlat - 在线视频会议平台';
pres.subject = '项目介绍';
pres.layout = 'LAYOUT_16x9';

// 配色方案（活力创新风格）
const COLORS = {
  primary: '6366F1',      // 活力紫
  secondary: '14B8A6',    // 青绿色
  accent: 'F59E0B',       // 明亮橙
  success: '10B981',      // 翠绿色
  background: 'FFFFFF',   // 纯白
  lightBg: 'F8FAFC',      // 浅灰
  text: '1E293B',         // 深灰
  textLight: '64748B'     // 浅灰文字
};

// 第 1 页：封面页
function createCoverSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  // 顶部装饰条
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.15,
    fill: { color: COLORS.primary }
  });

  // 主标题
  slide.addText('VideoPlat', {
    x: 0.5, y: 2.2, w: 9, h: 1.2,
    fontSize: 66,
    bold: true,
    color: COLORS.primary,
    align: 'center',
    fontFace: 'Arial Black'
  });

  // 副标题
  slide.addText('在线视频会议平台', {
    x: 0.5, y: 3.5, w: 9, h: 0.7,
    fontSize: 36,
    color: COLORS.text,
    align: 'center',
    fontFace: 'Arial'
  });

  // 描述
  slide.addText('类似 Zoom 的企业级视频会议系统', {
    x: 0.5, y: 4.3, w: 9, h: 0.5,
    fontSize: 22,
    color: COLORS.textLight,
    align: 'center',
    italic: true
  });

  // Beta 标签
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.2, y: 5.2, w: 1.6, h: 0.5,
    fill: { color: COLORS.accent }
  });

  slide.addText('Beta 版本', {
    x: 4.2, y: 5.2, w: 1.6, h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  });
}

// 第 2 页：项目概览
function createOverviewSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  // 标题
  slide.addText('项目概览', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 左侧：项目定位
  slide.addText('项目定位', {
    x: 0.8, y: 1.5, w: 4, h: 0.5,
    fontSize: 26,
    bold: true,
    color: COLORS.text
  });

  const positioning = [
    '• 在线视频会议系统',
    '• 类似 Zoom 的解决方案',
    '• 支持远程办公、在线教育',
    '• 适用于团队协作、视频面试'
  ];

  slide.addText(positioning.join('\n'), {
    x: 0.8, y: 2.2, w: 4, h: 2,
    fontSize: 18,
    color: COLORS.text,
    lineSpacing: 36
  });

  // 右侧：核心功能
  slide.addText('核心功能', {
    x: 5.2, y: 1.5, w: 4, h: 0.5,
    fontSize: 26,
    bold: true,
    color: COLORS.text
  });

  const features = [
    '✓ 多人视频通话（最多10人）',
    '✓ 会议录制与回放',
    '✓ 实时文字聊天',
    '✓ 屏幕共享',
    '✓ 参与者管理',
    '✓ 游客模式支持'
  ];

  slide.addText(features.join('\n'), {
    x: 5.2, y: 2.2, w: 4, h: 3,
    fontSize: 18,
    color: COLORS.success,
    lineSpacing: 36
  });

  // 底部亮点框
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 5.3, w: 8.4, h: 0.8,
    fill: { color: COLORS.lightBg }
  });

  slide.addText('🎯 最多支持 10 人同时在线视频通话', {
    x: 0.8, y: 5.3, w: 8.4, h: 0.8,
    fontSize: 24,
    bold: true,
    color: COLORS.primary,
    align: 'center',
    valign: 'middle'
  });
}

// 第 3 页：技术架构总览
function createArchitectureSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('技术架构', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 架构图（简化版）
  const boxes = [
    { text: '浏览器\n(React)', x: 1, y: 1.8, w: 1.8, h: 0.8, color: COLORS.primary },
    { text: 'Nginx\n反向代理', x: 4, y: 1.8, w: 1.8, h: 0.8, color: COLORS.secondary },
    { text: 'Spring Boot\n后端 API', x: 2.5, y: 3.2, w: 1.8, h: 0.8, color: COLORS.accent },
    { text: 'Redis\n缓存', x: 5, y: 3.2, w: 1.5, h: 0.8, color: COLORS.success },
    { text: 'PostgreSQL\n数据库', x: 7.2, y: 3.2, w: 1.8, h: 0.8, color: COLORS.primary },
    { text: 'Agora 声网\n媒体服务器', x: 2.5, y: 4.6, w: 1.8, h: 0.8, color: COLORS.secondary }
  ];

  boxes.forEach(box => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: box.x, y: box.y, w: box.w, h: box.h,
      fill: { color: box.color }
    });

    slide.addText(box.text, {
      x: box.x, y: box.y, w: box.w, h: box.h,
      fontSize: 14,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });
  });

  // 技术栈标签
  slide.addText('技术栈', {
    x: 0.5, y: 5.7, w: 9, h: 0.4,
    fontSize: 22,
    bold: true,
    color: COLORS.text
  });

  const techStack = 'React • Spring Boot • PostgreSQL • Redis • Agora • Docker • Nginx • JWT • WebSocket';
  slide.addText(techStack, {
    x: 0.5, y: 6.2, w: 9, h: 0.4,
    fontSize: 16,
    color: COLORS.textLight,
    align: 'center'
  });
}

// 第 4 页：前端技术栈
function createFrontendSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('前端架构', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 四象限布局
  const quadrants = [
    {
      title: '核心框架',
      items: ['React 18', 'Zustand 状态管理', 'React Router', 'Ant Design UI'],
      x: 0.8, y: 1.5, color: COLORS.primary
    },
    {
      title: '开发工具',
      items: ['Vite 构建工具', 'Tailwind CSS', 'CSS Modules', 'Axios HTTP'],
      x: 5.2, y: 1.5, color: COLORS.secondary
    },
    {
      title: '音视频能力',
      items: ['Agora Web SDK', 'WebRTC 通信', '屏幕共享', '设备管理'],
      x: 0.8, y: 3.8, color: COLORS.accent
    },
    {
      title: '视频播放',
      items: ['Video.js 播放器', 'MP4 回放', 'HLS 流媒体', '播放控制'],
      x: 5.2, y: 3.8, color: COLORS.success
    }
  ];

  quadrants.forEach(q => {
    // 标题背景
    slide.addShape(pres.ShapeType.roundRect, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fill: { color: q.color }
    });

    slide.addText(q.title, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    // 内容
    slide.addText(q.items.map(item => `• ${item}`).join('\n'), {
      x: q.x + 0.2, y: q.y + 0.6, w: 3.6, h: 1.5,
      fontSize: 16,
      color: COLORS.text,
      lineSpacing: 28
    });
  });

  // 底部统计
  slide.addText('📊 28 个核心文件 | 5,449 行代码', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 22,
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });
}

// 第 5 页：后端技术栈
function createBackendSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('后端架构', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  const quadrants = [
    {
      title: '核心框架',
      items: ['Spring Boot 3.x', 'Spring Data JPA', 'Maven 项目管理', 'PostgreSQL 数据库'],
      x: 0.8, y: 1.5, color: COLORS.secondary
    },
    {
      title: '安全认证',
      items: ['Spring Security', 'JWT Token', '用户认证', '权限管理'],
      x: 5.2, y: 1.5, color: COLORS.primary
    },
    {
      title: '实时通信',
      items: ['Spring WebSocket', '信令服务', '实时聊天', 'Redis 缓存'],
      x: 0.8, y: 3.8, color: COLORS.success
    },
    {
      title: 'API 文档',
      items: ['SpringDoc OpenAPI', 'Swagger UI', 'REST API', '15 个接口'],
      x: 5.2, y: 3.8, color: COLORS.accent
    }
  ];

  quadrants.forEach(q => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fill: { color: q.color }
    });

    slide.addText(q.title, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    slide.addText(q.items.map(item => `• ${item}`).join('\n'), {
      x: q.x + 0.2, y: q.y + 0.6, w: 3.6, h: 1.5,
      fontSize: 16,
      color: COLORS.text,
      lineSpacing: 28
    });
  });

  slide.addText('📊 35+ Java 文件 | 9,069 行代码 | 15 个 REST API', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 22,
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });
}

// 第 6 页：核心功能展示（1/2）
function createFeaturesSlide1() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('核心功能 - 用户与会议管理', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 左侧：用户管理
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 4, h: 4.2,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.primary, width: 3 }
  });

  slide.addText('👤 用户管理', {
    x: 0.8, y: 1.7, w: 4, h: 0.5,
    fontSize: 24,
    bold: true,
    color: COLORS.text,
    align: 'center'
  });

  const userFeatures = [
    '✓ 用户注册和登录',
    '✓ 游客模式（无需注册）',
    '✓ JWT Token 认证',
    '✓ 用户信息管理',
    '✓ 安全的密码加密'
  ];

  slide.addText(userFeatures.join('\n'), {
    x: 1.2, y: 2.5, w: 3.2, h: 2.8,
    fontSize: 18,
    color: COLORS.success,
    lineSpacing: 36
  });

  // 右侧：会议室管理
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 1.5, w: 4, h: 4.2,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.secondary, width: 3 }
  });

  slide.addText('🎥 会议室管理', {
    x: 5.2, y: 1.7, w: 4, h: 0.5,
    fontSize: 24,
    bold: true,
    color: COLORS.text,
    align: 'center'
  });

  const roomFeatures = [
    '✓ 创建会议室',
    '✓ 加入会议（房间号）',
    '✓ 多人视频通话（最多10人）',
    '✓ 参与者列表管理',
    '✓ 离开/结束会议'
  ];

  slide.addText(roomFeatures.join('\n'), {
    x: 5.6, y: 2.5, w: 3.2, h: 2.8,
    fontSize: 18,
    color: COLORS.success,
    lineSpacing: 36
  });

  // 底部提示
  slide.addText('💡 支持注册用户和游客两种模式，灵活便捷', {
    x: 0.5, y: 6.1, w: 9, h: 0.5,
    fontSize: 18,
    italic: true,
    color: COLORS.textLight,
    align: 'center'
  });
}

// 第 7 页：核心功能展示（2/2）
function createFeaturesSlide2() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('核心功能 - 录制与通信', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 左侧：录制功能
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 4, h: 4.2,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.accent, width: 3 }
  });

  slide.addText('📹 录制功能', {
    x: 0.8, y: 1.7, w: 4, h: 0.5,
    fontSize: 24,
    bold: true,
    color: COLORS.text,
    align: 'center'
  });

  const recordingFeatures = [
    '✓ 会议云端录制',
    '✓ MP4 格式存储',
    '✓ 录制列表查看',
    '✓ Video.js 回放',
    '✓ 录制文件管理'
  ];

  slide.addText(recordingFeatures.join('\n'), {
    x: 1.2, y: 2.5, w: 3.2, h: 2.8,
    fontSize: 18,
    color: COLORS.success,
    lineSpacing: 36
  });

  // 右侧：实时通信
  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 1.5, w: 4, h: 4.2,
    fill: { color: COLORS.lightBg },
    line: { color: COLORS.success, width: 3 }
  });

  slide.addText('💬 实时通信', {
    x: 5.2, y: 1.7, w: 4, h: 0.5,
    fontSize: 24,
    bold: true,
    color: COLORS.text,
    align: 'center'
  });

  const commFeatures = [
    '✓ WebSocket 实时消息',
    '✓ 会议室内文字聊天',
    '✓ 消息历史记录',
    '✓ 屏幕共享',
    '✓ 音视频设备控制'
  ];

  slide.addText(commFeatures.join('\n'), {
    x: 5.6, y: 2.5, w: 3.2, h: 2.8,
    fontSize: 18,
    color: COLORS.success,
    lineSpacing: 36
  });

  slide.addText('🎬 支持 1280x720 和 1920x1080 高清录制', {
    x: 0.5, y: 6.1, w: 9, h: 0.5,
    fontSize: 18,
    italic: true,
    color: COLORS.textLight,
    align: 'center'
  });
}

// 第 8 页：代码规模统计
function createCodeStatsSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('项目规模', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 总体统计
  slide.addText('整体规模', {
    x: 0.8, y: 1.3, w: 8.4, h: 0.4,
    fontSize: 26,
    bold: true,
    color: COLORS.text
  });

  const overallStats = [
    '📁 总文件数：976 个文件',
    '📝 总代码量：约 50 万行',
    '💻 代码文件：732 个（26万行）',
    '📚 文档文件：86 个（2万行）'
  ];

  slide.addText(overallStats.join('\n'), {
    x: 1.2, y: 2.0, w: 7.6, h: 1.5,
    fontSize: 18,
    color: COLORS.text,
    lineSpacing: 32
  });

  // 核心代码分布
  slide.addText('核心代码分布', {
    x: 0.8, y: 3.7, w: 8.4, h: 0.4,
    fontSize: 26,
    bold: true,
    color: COLORS.text
  });

  const codeDistribution = [
    { label: '后端 Java', value: 9069, color: COLORS.primary },
    { label: '前端 JSX', value: 3737, color: COLORS.secondary },
    { label: '样式 CSS', value: 3270, color: COLORS.accent },
    { label: '前端 JS', value: 1712, color: COLORS.success }
  ];

  let yPos = 4.4;
  codeDistribution.forEach(item => {
    slide.addText(item.label, {
      x: 1.2, y: yPos, w: 2, h: 0.35,
      fontSize: 16,
      color: COLORS.text
    });

    const barWidth = (item.value / 10000) * 5;
    slide.addShape(pres.ShapeType.rect, {
      x: 3.5, y: yPos, w: barWidth, h: 0.35,
      fill: { color: item.color }
    });

    slide.addText(item.value.toString() + ' 行', {
      x: 3.5 + barWidth + 0.1, y: yPos, w: 1.5, h: 0.35,
      fontSize: 16,
      bold: true,
      color: item.color,
      valign: 'middle'
    });

    yPos += 0.5;
  });

  slide.addText('📖 72 个 Markdown 文档，体现完善的文档体系', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 20,
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });
}

// 第 9 页：部署架构
function createDeploymentSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('部署方案', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // Docker Compose 架构
  slide.addText('Docker Compose 容器化部署', {
    x: 0.8, y: 1.5, w: 8.4, h: 0.5,
    fontSize: 24,
    bold: true,
    color: COLORS.text,
    align: 'center'
  });

  const deploymentSteps = [
    '1. 配置环境变量：cp .env.example .env',
    '2. 启动所有服务：docker-compose up -d',
    '3. 访问应用：https://192.168.10.9 或 https://localhost'
  ];

  slide.addText(deploymentSteps.join('\n'), {
    x: 1.5, y: 2.5, w: 7, h: 1.5,
    fontSize: 18,
    color: COLORS.text,
    lineSpacing: 36
  });

  // 特性列表
  slide.addText('部署特性', {
    x: 0.8, y: 4.3, w: 8.4, h: 0.4,
    fontSize: 24,
    bold: true,
    color: COLORS.text
  });

  const features = [
    '✓ 自动 HTTPS 配置',
    '✓ Nginx 反向代理',
    '✓ 容器自动重启',
    '✓ 一键启动所有服务'
  ];

  slide.addText(features.join('\n'), {
    x: 1.5, y: 5.0, w: 7, h: 1.5,
    fontSize: 18,
    color: COLORS.success,
    lineSpacing: 32
  });
}

// 第 10 页：管理后台
function createAdminSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('管理功能', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  const quadrants = [
    {
      title: '用户管理',
      items: ['用户列表', '用户详情', '权限管理', '账号状态'],
      x: 0.8, y: 1.5, color: COLORS.primary
    },
    {
      title: '会议室管理',
      items: ['会议列表', '会议详情', '参与者管理', '会议统计'],
      x: 5.2, y: 1.5, color: COLORS.secondary
    },
    {
      title: '录制管理',
      items: ['录制列表', '文件管理', '存储统计', '删除清理'],
      x: 0.8, y: 3.8, color: COLORS.accent
    },
    {
      title: '操作日志',
      items: ['用户操作', '系统日志', '错误追踪', '审计记录'],
      x: 5.2, y: 3.8, color: COLORS.success
    }
  ];

  quadrants.forEach(q => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fill: { color: q.color }
    });

    slide.addText(q.title, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    slide.addText(q.items.map(item => `• ${item}`).join('\n'), {
      x: q.x + 0.2, y: q.y + 0.6, w: 3.6, h: 1.5,
      fontSize: 16,
      color: COLORS.text,
      lineSpacing: 28
    });
  });

  slide.addText('🎛️ 完整的后台管理系统，支持全面的运营管理', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 20,
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });
}

// 第 11 页：待开发功能
function createRoadmapSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('产品路线图', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 近期计划
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 8.4, h: 0.5,
    fill: { color: COLORS.primary }
  });

  slide.addText('近期计划（优先级高）', {
    x: 0.8, y: 1.5, w: 8.4, h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  });

  const nearTerm = [
    '• 虚拟背景 - 视频背景替换/模糊',
    '• 白板功能 - 实时协作白板',
    '• 文件共享 - 会议中分享文档',
    '• 会议邀请 - 邮件/链接邀请'
  ];

  slide.addText(nearTerm.join('\n'), {
    x: 1.2, y: 2.2, w: 7.6, h: 1.2,
    fontSize: 16,
    color: COLORS.text,
    lineSpacing: 28
  });

  // 中期计划
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 3.6, w: 8.4, h: 0.5,
    fill: { color: COLORS.secondary }
  });

  slide.addText('中期计划（优先级中）', {
    x: 0.8, y: 3.6, w: 8.4, h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  });

  const midTerm = [
    '• 实时字幕 - 语音转文字',
    '• 会议转录 - 完整会议记录',
    '• AI 摘要 - 自动生成会议纪要',
    '• 实时翻译 - 多语言实时翻译'
  ];

  slide.addText(midTerm.join('\n'), {
    x: 1.2, y: 4.3, w: 7.6, h: 1.2,
    fontSize: 16,
    color: COLORS.text,
    lineSpacing: 28
  });

  // 长期计划
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 5.7, w: 8.4, h: 0.5,
    fill: { color: COLORS.accent }
  });

  slide.addText('长期计划（优先级低）', {
    x: 0.8, y: 5.7, w: 8.4, h: 0.5,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle'
  });

  const longTerm = '• 数字人/虚拟形象  • 会议分组  • 投票功能  • 举手发言';

  slide.addText(longTerm, {
    x: 1.2, y: 6.4, w: 7.6, h: 0.4,
    fontSize: 16,
    color: COLORS.text
  });
}

// 第 12 页：技术亮点
function createHighlightsSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('技术亮点', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  const highlights = [
    {
      icon: '🚀',
      title: '现代化技术栈',
      desc: 'React 18 + Spring Boot 3.x + Agora，采用最新技术'
    },
    {
      icon: '✅',
      title: '完整功能实现',
      desc: '视频通话、录制回放、实时聊天、管理后台全覆盖'
    },
    {
      icon: '📝',
      title: '优秀代码质量',
      desc: '清晰的分层架构，72 个文档文件，注释完善'
    },
    {
      icon: '🐳',
      title: '便捷部署方式',
      desc: 'Docker Compose 一键启动，自动 HTTPS 配置'
    },
    {
      icon: '🔧',
      title: '可扩展架构',
      desc: '模块化设计，易于添加新功能和二次开发'
    }
  ];

  let yPos = 1.8;
  highlights.forEach(h => {
    slide.addText(h.icon, {
      x: 1.2, y: yPos, w: 0.6, h: 0.6,
      fontSize: 36,
      align: 'center',
      valign: 'middle'
    });

    slide.addText(h.title, {
      x: 2.0, y: yPos, w: 7, h: 0.3,
      fontSize: 20,
      bold: true,
      color: COLORS.text
    });

    slide.addText(h.desc, {
      x: 2.0, y: yPos + 0.35, w: 7, h: 0.25,
      fontSize: 16,
      color: COLORS.textLight
    });

    yPos += 0.9;
  });
}

// 第 13 页：适用场景
function createScenariosSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('应用场景', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  const scenarios = [
    {
      title: '企业应用',
      items: ['远程办公会议', '团队协作沟通', '客户视频会议', '在线培训'],
      x: 0.8, y: 1.5, color: COLORS.primary
    },
    {
      title: '教育场景',
      items: ['在线课堂', '远程教学', '学术研讨', '视频答疑'],
      x: 5.2, y: 1.5, color: COLORS.secondary
    },
    {
      title: '技术学习',
      items: ['WebRTC 实践', '全栈开发学习', '系统架构设计', '容器化部署'],
      x: 0.8, y: 3.8, color: COLORS.accent
    },
    {
      title: '二次开发',
      items: ['定制化功能', '私有化部署', '集成到现有系统', '商业化应用'],
      x: 5.2, y: 3.8, color: COLORS.success
    }
  ];

  scenarios.forEach(s => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: s.x, y: s.y, w: 4, h: 0.5,
      fill: { color: s.color }
    });

    slide.addText(s.title, {
      x: s.x, y: s.y, w: 4, h: 0.5,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });

    slide.addText(s.items.map(item => `• ${item}`).join('\n'), {
      x: s.x + 0.2, y: s.y + 0.6, w: 3.6, h: 1.5,
      fontSize: 16,
      color: COLORS.text,
      lineSpacing: 28
    });
  });

  slide.addText('🌟 广泛的应用价值，适合多种使用场景', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 20,
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });
}

// 第 14 页：总结与展望
function createSummarySlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('总结', {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 40,
    bold: true,
    color: COLORS.primary
  });

  // 项目特点
  slide.addText('VideoPlat 的价值', {
    x: 0.8, y: 1.5, w: 8.4, h: 0.5,
    fontSize: 26,
    bold: true,
    color: COLORS.text
  });

  const features = [
    '✅ 完整的核心功能：视频通话、录制、回放、聊天',
    '✅ 良好的代码组织：清晰的分层架构',
    '✅ 丰富的文档：72 个文档文件，详细的开发和部署指南',
    '✅ 容器化部署：Docker Compose 一键启动',
    '🔄 持续迭代：多个高级功能待开发'
  ];

  slide.addText(features.join('\n'), {
    x: 1.2, y: 2.2, w: 7.6, h: 2.5,
    fontSize: 18,
    color: COLORS.text,
    lineSpacing: 36
  });

  // 项目状态
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2, y: 5.0, w: 6, h: 0.8,
    fill: { color: COLORS.lightBg }
  });

  slide.addText('当前状态：Beta 测试版本', {
    x: 2, y: 5.0, w: 6, h: 0.4,
    fontSize: 22,
    bold: true,
    color: COLORS.primary,
    align: 'center',
    valign: 'middle'
  });

  slide.addText('适合场景：学习 WebRTC、视频会议系统开发、全栈项目实践', {
    x: 2, y: 5.4, w: 6, h: 0.4,
    fontSize: 16,
    color: COLORS.textLight,
    align: 'center',
    valign: 'middle'
  });

  // 感谢
  slide.addText('感谢观看', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 28,
    bold: true,
    color: COLORS.primary,
    align: 'center'
  });
}

// 生成 PPT
async function generatePresentation() {
  console.log('开始生成 VideoPlat 项目介绍 PPT...');

  createCoverSlide();
  console.log('✓ 第 1 页：封面页');

  createOverviewSlide();
  console.log('✓ 第 2 页：项目概览');

  createArchitectureSlide();
  console.log('✓ 第 3 页：技术架构总览');

  createFrontendSlide();
  console.log('✓ 第 4 页：前端技术栈');

  createBackendSlide();
  console.log('✓ 第 5 页：后端技术栈');

  createFeaturesSlide1();
  console.log('✓ 第 6 页：核心功能展示（1/2）');

  createFeaturesSlide2();
  console.log('✓ 第 7 页：核心功能展示（2/2）');

  createCodeStatsSlide();
  console.log('✓ 第 8 页：代码规模统计');

  createDeploymentSlide();
  console.log('✓ 第 9 页：部署架构');

  createAdminSlide();
  console.log('✓ 第 10 页：管理后台');

  createRoadmapSlide();
  console.log('✓ 第 11 页：待开发功能');

  createHighlightsSlide();
  console.log('✓ 第 12 页：技术亮点');

  createScenariosSlide();
  console.log('✓ 第 13 页：适用场景');

  createSummarySlide();
  console.log('✓ 第 14 页：总结与展望');

  const fileName = 'VideoPlat-项目介绍.pptx';
  await pres.writeFile({ fileName });
  console.log(`\n✅ PPT 生成成功：${fileName}`);
  console.log('共 14 页，使用活力创新风格配色');
}

// 运行生成函数
generatePresentation().catch(err => {
  console.error('生成 PPT 时出错：', err);
  process.exit(1);
});



