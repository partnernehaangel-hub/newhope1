import React from 'react';

export const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={`glass-panel rounded-2xl p-8 ${className}`} {...props}>
    {children}
  </div>
);
