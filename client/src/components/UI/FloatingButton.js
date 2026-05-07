import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import './FloatingButton.css';

const FloatingButton = ({ 
  icon: Icon, 
  onClick, 
  variant = 'primary',
  size = 'md',
  tooltip,
  badge,
  className = '',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="floating-button-container">
      <button
        className={`floating-button ${variant} ${size} ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        {...props}
      >
        <div className="button-glow" />
        
        <div className="button-icon">
          <Icon />
        </div>

        {badge && (
          <div className="button-badge">
            {badge}
          </div>
        )}

        <div className="button-ripple" />
      </button>

      {tooltip && isHovered && (
        <div className="button-tooltip">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default FloatingButton;