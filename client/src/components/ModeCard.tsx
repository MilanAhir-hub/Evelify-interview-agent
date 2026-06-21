import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const ModeCard = ({ title, description, icon }: ModeCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
      transition={{ duration: 0.3 }}
      className="group p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl dark:bg-gradient-to-b dark:from-[#111111] dark:to-[#0a0a0a] light:bg-gradient-to-b light:from-white light:to-gray-50 dark:border-white/5 light:border-gray-200 hover:dark:border-blue-500/30 hover:light:border-blue-300 transition-all duration-300"
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="mb-4 sm:mb-6 inline-flex p-2.5 sm:p-3 rounded-lg sm:rounded-xl dark:bg-blue-500/5 light:bg-blue-50 dark:border-blue-500/10 light:border-blue-200 group-hover:dark:bg-blue-500/10 group-hover:light:bg-blue-100 group-hover:dark:border-blue-500/20 group-hover:light:border-blue-300 transition-all"
      >
        {icon}
      </motion.div>

      <motion.h3 
        whileHover={{ x: 4 }}
        className="text-base sm:text-lg md:text-xl font-bold dark:text-white light:text-gray-900 mb-1.5 sm:mb-2 group-hover:text-blue-400 transition-colors"
      >
        {title}
      </motion.h3>
      <p className="dark:text-gray-500 light:text-gray-500 text-xs sm:text-sm leading-relaxed group-hover:dark:text-gray-400 group-hover:light:text-gray-600 transition-colors">
        {description}
      </p>

      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="mt-4 sm:mt-6 flex items-center gap-1.5"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-blue-500"
        />
        <span className="text-[9px] sm:text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active Mode</span>
      </motion.div>
    </motion.div>
  );
};

export default ModeCard;
