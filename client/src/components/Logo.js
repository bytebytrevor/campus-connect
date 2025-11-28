import React from 'react';

const Logo = ({ className = "w-40 h-40", size = "default" }) => {
  return (
    <img 
      src="/logo.webp" 
      alt="CampusConnect Logo" 
      className={className}
      style={{ 
        backgroundColor: 'transparent', 
        mixBlendMode: 'multiply', 
        width: size === 'large' ? '400px' : size === 'small' ? '120px' : '160px',
        height: size === 'large' ? '400px' : size === 'small' ? '120px' : '160px'
      }}
    />
  );
};

export default Logo;