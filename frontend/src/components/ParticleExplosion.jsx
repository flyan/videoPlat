import React, { useEffect, useRef } from 'react';

/**
 * 粒子爆炸组件
 * 用于按钮点击等交互效果
 */
const ParticleExplosion = ({ x, y, color = '#ff6b35', onComplete }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particleCount = 25;

    // 粒子类
    class ExplosionParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.98;
        this.speedY *= 0.98;
        this.life -= this.decay;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      isDead() {
        return this.life <= 0;
      }
    }

    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new ExplosionParticle(x, y));
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.update();
        particle.draw(ctx);
        return !particle.isDead();
      });

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [x, y, color, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default ParticleExplosion;
