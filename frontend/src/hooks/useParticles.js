import { useEffect, useRef, useState } from 'react';

/**
 * 粒子系统 Hook
 * 提供高性能的 Canvas 粒子动画
 */
export const useParticles = (options = {}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(true);

  // 默认配置
  const config = {
    particleCount: getResponsiveParticleCount(),
    particleColor: options.particleColor || '#ff6b35',
    particleSize: options.particleSize || 2,
    particleSpeed: options.particleSpeed || 0.5,
    connectionDistance: options.connectionDistance || 120,
    mouseRadius: options.mouseRadius || 150,
    mouseAttraction: options.mouseAttraction || 0.05,
    ...options,
  };

  // 响应式粒子数量
  function getResponsiveParticleCount() {
    const width = window.innerWidth;
    if (width >= 1024) return 150; // 桌面
    if (width >= 768) return 80;   // 平板
    return 40;                      // 移动端
  }

  // 性能检测
  function shouldEnableParticles() {
    // 检查用户偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return false;

    // 检查设备性能
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;

    // 低端设备降级
    if (cores < 4 || memory < 4) return false;

    // 移动端检测
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (isMobile && window.innerWidth < 768) return false;

    return true;
  }

  // 粒子类
  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.vx = (Math.random() - 0.5) * config.particleSpeed;
      this.vy = (Math.random() - 0.5) * config.particleSpeed;
      this.size = config.particleSize;
    }

    update(mouse) {
      // 鼠标吸引效果
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.mouseRadius) {
          const force = (config.mouseRadius - distance) / config.mouseRadius;
          this.vx += dx * force * config.mouseAttraction;
          this.vy += dy * force * config.mouseAttraction;
        }
      }

      // 更新位置
      this.x += this.vx;
      this.y += this.vy;

      // 边界检测
      if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

      // 限制速度
      const maxSpeed = config.particleSpeed * 2;
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }

      // 摩擦力
      this.vx *= 0.99;
      this.vy *= 0.99;
    }

    draw(ctx) {
      ctx.fillStyle = config.particleColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 初始化粒子
  const initParticles = (canvas) => {
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle(canvas));
    }
    return particles;
  };

  // 绘制连线
  const drawConnections = (ctx, particles) => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.connectionDistance) {
          const opacity = 1 - distance / config.connectionDistance;
          ctx.strokeStyle = `rgba(255, 107, 53, ${opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };

  // 动画循环
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新和绘制粒子
    particlesRef.current.forEach((particle) => {
      particle.update(mouseRef.current);
      particle.draw(ctx);
    });

    // 绘制连线
    drawConnections(ctx, particlesRef.current);

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // 处理窗口大小变化
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 重新初始化粒子
    particlesRef.current = initParticles(canvas);
  };

  // 处理鼠标移动
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 处理鼠标离开
  const handleMouseLeave = () => {
    mouseRef.current = { x: 0, y: 0 };
  };

  // 初始化
  useEffect(() => {
    const enabled = shouldEnableParticles();
    setIsEnabled(enabled);

    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置 Canvas 尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 初始化粒子
    particlesRef.current = initParticles(canvas);

    // 启动动画
    animate();

    // 事件监听
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 清理
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { canvasRef, isEnabled };
};
