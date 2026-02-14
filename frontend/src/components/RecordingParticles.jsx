import React, { useEffect, useRef } from 'react';

/**
 * 录制粒子组件
 * 录制时显示红色粒子从四周向中心汇聚
 */
const RecordingParticles = ({ isRecording }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 录制粒子类
    class RecordingParticle {
      constructor() {
        // 从边缘随机位置开始
        const side = Math.floor(Math.random() * 4);
        switch (side) {
          case 0: // 顶部
            this.x = Math.random() * canvas.width;
            this.y = 0;
            break;
          case 1: // 右侧
            this.x = canvas.width;
            this.y = Math.random() * canvas.height;
            break;
          case 2: // 底部
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            break;
          case 3: // 左侧
            this.x = 0;
            this.y = Math.random() * canvas.height;
            break;
        }

        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
      }

      update() {
        // 向中心移动
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          this.x += (dx / distance) * this.speed;
          this.y += (dy / distance) * this.speed;
          return true;
        }
        return false;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 初始化粒子
    const initParticles = () => {
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push(new RecordingParticle());
      }
    };

    initParticles();

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter((particle) => {
        const alive = particle.update();
        particle.draw(ctx);
        return alive;
      });

      // 补充新粒子
      if (particlesRef.current.length < 50) {
        particlesRef.current.push(new RecordingParticle());
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <canvas
      ref={canvasRef}
      className="recording-particles"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

export default RecordingParticles;
