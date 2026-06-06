import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const GlassCard = ({ 
  children, 
  className, 
  hoverEffect = true, 
  glowOnHover = false, 
  animate = true, 
  onClick,
  ...props 
}) => {
  const cardClasses = twMerge(
    'bg-white border border-border shadow-sm rounded-2xl rounded-xl p-5 border transition-all duration-300',
    hoverEffect && 'hover:-translate-y-1 hover:border-slate-700/50 hover:shadow-2xl hover:shadow-primary/5',
    glowOnHover && 'hover:shadow-[0_0_20px_1px_rgba(20,184,166,0.15)]',
    onClick && 'cursor-pointer',
    className
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        whileHover={hoverEffect ? { scale: 1.01 } : {}}
        onClick={onClick}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div onClick={onClick} className={cardClasses} {...props}>
      {children}
    </div>
  );
};
export default GlassCard;
