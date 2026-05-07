import React, { useRef, useState } from 'react';
// import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './AnimatedCard.css';

const AnimatedCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  glowColor = '#6366f1',
  ...props 
}) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`animated-card ${variant} ${className}`}
      style={{
        '--glow-color': glowColor
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <div className="card-content">
        {children}
      </div>
      
      <div 
        className="card-glow"
        style={{
          opacity: isHovered ? 0.6 : 0,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
      />
      
      <div className="card-shine" />
    </div>
  );
};

export default AnimatedCard;