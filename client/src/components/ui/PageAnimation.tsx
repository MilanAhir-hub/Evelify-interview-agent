import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  className?: string;
}

export const FadeIn = ({ 
  children, 
  delay = 0, 
  direction = 'up', 
  duration = 0.6,
  className = ''
}: FadeInProps) => {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: -40 },
    right: { x: 40 },
    none: {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const StaggerContainer = ({ children, delay = 0.1, className = '' }: StaggerProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: { transition: { staggerChildren: delay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleIn = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideIn = ({ 
  children, 
  from = 'left', 
  delay = 0,
  className = '' 
}: { 
  children: ReactNode; 
  from?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  className?: string;
}) => {
  const offsets = {
    left: { x: -60, y: 0 },
    right: { x: 60, y: 0 },
    top: { x: 0, y: -60 },
    bottom: { x: 0, y: 60 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Float = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Pulse = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.02, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const shimmerAnimation = {
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
  backgroundSize: "200% 100%",
  animation: "shimmer 2s infinite" as const
};

export const GlowPulse = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 20px rgba(59, 130, 246, 0.3)",
          "0 0 40px rgba(59, 130, 246, 0.5)",
          "0 0 20px rgba(59, 130, 246, 0.3)"
        ]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};