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

// 字体样式
const FONTS = {
  title: { size: 44, bold: true, color: COLORS.primary },
  subtitle: { size: 28, bold: true, color: COLORS.text },
  heading: { size: 24, bold: true, color: COLORS.text },
  body: { size: 18, color: COLORS.text },
  small: { size: 16, color: COLORS.textLight }
};

// 第 1 页：封面页
function createCoverSlide() {
  const slide = pres.addSlide();

  // 背景渐变
  slide.background = { fill: COLORS.background };

  // 装饰性渐变条
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 1.5,
    fill: { type: 'solid', color: COLORS.primary, transparency: 10 }
  });

  // 主标题
  slide.addText('VideoPlat', {
    x: 0.5, y: 2.5, w: 9, h: 1.2,
    fontSize: 60,
    bold: true,
    color: COLORS.primary,
    align: 'center'
  });

  // 副标题
  slide.addText('在线视频会议平台', {
    x: 0.5, y: 3.8, w: 9, h: 0.8,
    fontSize: 32,
    color: COLORS.text,
    align: 'center'
  });

  // 描述
  slide.addText('类似 Zoom 的企业级视频会议系统', {
    x: 0.5, y: 4.7, w: 9, h: 0.6,
    fontSize: 24,
    color: COLORS.textLight,
    align: 'center',
    italic: true
  });

  // Beta 标签
  slide.addShape(pres.ShapeType.roundRect, {
    x: 4.2, y: 5.5, w: 1.6, h: 0.5,
    fill: { type: 'solid', color: COLORS.accent },
    line: { type: 'none' }
  });

  slide.addText('Beta 版本', {
    x: 4.2, y: 5.5, w: 1.6, h: 0.5,
    fontSize: 18,
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
  slide.addText('项目概览 - 我们在做什么？', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    ...FONTS.title
  });

  // 左侧：项目定位
  slide.addText('项目定位', {
    x: 0.8, y: 1.3, w: 4, h: 0.5,
    ...FONTS.subtitle
  });

  const positioning = [
    '• 在线视频会议系统',
    '• 类似 Zoom 的解决方案',
    '• 支持远程办公、在线教育',
    '• 适用于团队协作、视频面试'
  ];

  slide.addText(positioning.join('\n'), {
    x: 0.8, y: 2.0, w: 4, h: 2.5,
    ...FONTS.body,
    lineSpacing: 32
  });

  // 右侧：核心功能
  slide.addText('核心功能', {
    x: 5.2, y: 1.3, w: 4, h: 0.5,
    ...FONTS.subtitle
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
    x: 5.2, y: 2.0, w: 4, h: 3,
    ...FONTS.body,
    lineSpacing: 32,
    color: COLORS.success
  });

  // 底部亮点
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 5.0, w: 8.4, h: 0.8,
    fill: { type: 'solid', color: COLORS.lightBg },
    line: { type: 'none' }
  });

  slide.addText('🎯 最多支持 10 人同时在线视频通话', {
    x: 0.8, y: 5.0, w: 8.4, h: 0.8,
    fontSize: 22,
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

  // 标题
  slide.addText('技术架构 - 现代化全栈方案', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    ...FONTS.title
  });

  // 架构图（简化版）
  const boxes = [
    { text: '浏览器\n(React)', x: 1, y: 1.5, color: COLORS.primary },
    { text: 'Nginx\n反向代理', x: 4, y: 1.5, color: COLORS.secondary },
    { text: 'Spring Boot\n后端 API', x: 2.5, y: 3.2, color: COLORS.accent },
    { text: 'Redis\n缓存', x: 5, y: 3.2, color: COLORS.success },
    { text: 'PostgreSQL\n数据库', x: 7.5, y: 3.2, color: COLORS.primary },
    { text: 'Agora 声网\n媒体服务器', x: 2.5, y: 4.8, color: COLORS.secondary }
  ];

  boxes.forEach(box => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: box.x, y: box.y, w: 2, h: 0.8,
      fill: { type: 'solid', color: box.color },
      line: { type: 'none' }
    });

    slide.addText(box.text, {
      x: box.x, y: box.y, w: 2, h: 0.8,
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });
  });

  // 技术栈标签云
  slide.addText('技术栈', {
    x: 0.5, y: 5.8, w: 9, h: 0.4,
    ...FONTS.heading
  });

  const techStack = 'React • Spring Boot • PostgreSQL • Redis • Agora • Docker • Nginx • JWT • WebSocket';
  slide.addText(techStack, {
    x: 0.5, y: 6.3, w: 9, h: 0.5,
    fontSize: 16,
    color: COLORS.textLight,
    align: 'center'
  });
}

// 第 4 页：前端技术栈
function createFrontendSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  // 标题
  slide.addText('前端架构 - 现代化 React 生态', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    ...FONTS.title
  });

  // 四象限布局
  const quadrants = [
    {
      title: '核心框架',
      items: ['React 18', 'Zustand 状态管理', 'React Router', 'Ant Design UI'],
      x: 0.8, y: 1.5
    },
    {
      title: '开发工具',
      items: ['Vite 构建工具', 'Tailwind CSS', 'CSS Modules', 'Axios HTTP'],
      x: 5.2, y: 1.5
    },
    {
      title: '音视频能力',
      items: ['Agora Web SDK', 'WebRTC 通信', '屏幕共享', '设备管理'],
      x: 0.8, y: 3.8
    },
    {
      title: '视频播放',
      items: ['Video.js 播放器', 'MP4 回放', 'HLS 流媒体', '播放控制'],
      x: 5.2, y: 3.8
    }
  ];

  quadrants.forEach(q => {
    // 标题背景
    slide.addShape(pres.ShapeType.roundRect, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fill: { type: 'solid', color: COLORS.primary },
      line: { type: 'none' }
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
      x: q.x, y: q.y + 0.6, w: 4, h: 1.5,
      ...FONTS.body,
      lineSpacing: 28
    });
  });

  // 底部统计
  slide.addText('📊 28 个核心文件 | 5,449 行代码', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 20,
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });
}

// 第 5 页：后端技术栈
function createBackendSlide() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  // 标题
  slide.addText('后端架构 - 企业级 Spring Boot', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    ...FONTS.title
  });

  // 四象限布局
  const quadrants = [
    {
      title: '核心框架',
      items: ['Spring Boot 3.x', 'Spring Data JPA', 'Maven 项目管理', 'PostgreSQL 数据库'],
      x: 0.8, y: 1.5
    },
    {
      title: '安全认证',
      items: ['Spring Security', 'JWT Token', '用户认证', '权限管理'],
      x: 5.2, y: 1.5
    },
    {
      title: '实时通信',
      items: ['Spring WebSocket', '信令服务', '实时聊天', 'Redis 缓存'],
      x: 0.8, y: 3.8
    },
    {
      title: 'API 文档',
      items: ['SpringDoc OpenAPI', 'Swagger UI', 'REST API', '15 个接口'],
      x: 5.2, y: 3.8
    }
  ];

  quadrants.forEach(q => {
    // 标题背景
    slide.addShape(pres.ShapeType.roundRect, {
      x: q.x, y: q.y, w: 4, h: 0.5,
      fill: { type: 'solid', color: COLORS.secondary },
      line: { type: 'none' }
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
      x: q.x, y: q.y + 0.6, w: 4, h: 1.5,
      ...FONTS.body,
      lineSpacing: 28
    });
  });

  // 底部统计
  slide.addText('📊 35+ Java 文件 | 9,069 行代码 | 15 个 REST API', {
    x: 0.5, y: 6.2, w: 9, h: 0.5,
    fontSize: 20,
    bold: true,
    color: COLORS.accent,
    align: 'center'
  });
}


// 第 6-14 页函数将在下一步添加
