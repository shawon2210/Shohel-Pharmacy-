import React from 'react';
// import { motion } from 'framer-motion';
import FloatingButton from './FloatingButton';
import './IconGrid.css';

const IconGrid = ({ 
  items = [], 
  columns = 4, 
  gap = '1rem',
  variant = 'default',
  onItemClick,
  className = ''
}) => {


  const getGridColumns = () => {
    if (typeof columns === 'object') {
      return {
        gridTemplateColumns: `repeat(${columns.desktop || 4}, 1fr)`,
        '--mobile-columns': columns.mobile || 2,
        '--tablet-columns': columns.tablet || 3
      };
    }
    return {
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      '--mobile-columns': Math.min(columns, 2),
      '--tablet-columns': Math.min(columns, 3)
    };
  };

  return (
    <div
      className={`icon-grid ${variant} ${className}`}
      style={{
        gap,
        ...getGridColumns()
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={`grid-item ${item.priority || ''} ${item.featured ? 'featured' : ''}`}
        >
          {variant === 'floating' ? (
            <FloatingButton
              icon={item.icon}
              onClick={() => onItemClick?.(item)}
              variant={item.variant || 'primary'}
              size={item.size || 'md'}
              tooltip={item.tooltip || item.title}
              badge={item.badge}
              className={item.className}
            />
          ) : (
            <button
              className={`grid-button ${item.variant || 'default'}`}
              onClick={() => onItemClick?.(item)}
            >
              <div className="button-background" />
              
              <div className="button-content">
                <div className="button-icon">
                  <item.icon />
                </div>
                
                {item.title && (
                  <div className="button-text">
                    <div className="button-title">{item.title}</div>
                    {item.subtitle && (
                      <div className="button-subtitle">{item.subtitle}</div>
                    )}
                  </div>
                )}
                
                {item.badge && (
                  <div className="button-badge">
                    {item.badge}
                  </div>
                )}
              </div>
              
              <div className="button-shine" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default IconGrid;