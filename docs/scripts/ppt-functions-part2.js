
// 第 6 页：核心功能展示（1/2）
function createFeaturesSlide1() {
  const slide = pres.addSlide();
  slide.background = { fill: COLORS.background };

  slide.addText('核心功能 - 用户与会议管理', {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    ...FONTS.title
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: 4, h: 4,
    fill: { type: 'solid', color: COLORS.lightBg },
    line: { type: 'solid', color: COLORS.primary, width: 2 }
  });

  slide.addText('👤 用户管理', {
    x: 0.8, y: 1.7, w: 4, h: 0.5,
    ...FONTS.subtitle,
    align: 'center'
  });

  const userFeatures = [
    '✓ 用户注册和登录',
    '✓ 游客模式（无需注册）',
    '✓ JWT Token 认证',
    '✓ 用户信息管理',
    '✓ 安全的密码加密'
  ];

  slide.addText(userFeatures.join('\\n'), {
    x: 1.2, y: 2.5, w: 3.2, h: 2.5,
    ...FONTS.body,
    lineSpacing: 32,
    color: COLORS.success
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: 5.2, y: 1.5, w: 4, h: 4,
    fill: { type: 'solid', color: COLORS.lightBg },
    line: { type: 'solid', color: COLORS.secondary, width: 2 }
  });

  slide.addText('🎥 会议室管理', {
    x: 5.2, y: 1.7, w: 4, h: 0.5,
    ...FONTS.subtitle,
    align: 'center'
  });

  const roomFeatures = [
    '✓ 创建会议室',
    '✓ 加入会议（房间号）',
    '✓ 多人视频通话（最多10人）',
    '✓ 参与者列表管理',
    '✓ 离开/结束会议'
  ];

  slide.addText(roomFeatures.join('\\n'), {
    x: 5.6, y: 2.5, w: 3.2, h: 2.5,
    ...FONTS.body,
    lineSpacing: 32,
    color: COLORS.success
  });

  slide.addText('💡 支持注册用户和游客两种模式，灵活便捷', {
    x: 0.5, y: 6.0, w: 9, h: 0.5,
    fontSize: 18,
    italic: true,
    color: COLORS.textLight,
    align: 'center'
  });
}
