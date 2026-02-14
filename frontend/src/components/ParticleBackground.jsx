import React from 'react';
import { useParticles } from '../hooks/useParticles';

/**
 * 粒子背景组件
 * 提供动态粒子效果背景
 */
const ParticleBackground = ({
  className = '',
  particleColor = '#ff6b35',
  particleCount,
  style = {}
}) => {
  const { canvasRef, isEnabled } = useParticles({
    particleColor,
    particleCount,
  });

  if (!isEnabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`particle-background ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        ...style,
      }}
    />
  );
};

export default ParticleBackground;
