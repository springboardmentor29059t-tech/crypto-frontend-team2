import React from 'react';

const Icon = ({ name, size = 24, className = "" }) => {
  return <i className={`ph ph-${name} ${className}`} style={{ fontSize: size }}></i>;
};

export default Icon;
