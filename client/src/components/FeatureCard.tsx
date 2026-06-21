import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

const colorMap: Record<string, string> = {
  'blue-500': 'from-blue-500/30 to-blue-500/0',
  'emerald-500': 'from-emerald-500/30 to-emerald-500/0',
  'purple-500': 'from-purple-500/30 to-purple-500/0',
  'pink-500': 'from-pink-500/30 to-pink-500/0',
};

const borderColorMap: Record<string, string> = {
  'blue-500': 'blue-500',
  'emerald-500': 'emerald-500',
  'purple-500': 'purple-500',
  'pink-500': 'pink-500',
};

const FeatureCard = ({ title, description, icon, color }: FeatureCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="relative group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl dark:bg-[#111111]/50 light:bg-white/50 dark:border-white/5 light:border-gray-200 hover:dark:border-white/10 hover:light:border-gray-300 transition-all duration-500 overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br ${colorMap[color] || colorMap['blue-500']} rounded-full blur-[60px] sm:blur-[80px]`}
      />
      
      <div className="relative mb-5 sm:mb-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`absolute inset-0 bg-gradient-to-br ${colorMap[color] || colorMap['blue-500']} blur-xl rounded-xl`}
        />
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="relative w-12 h-12 sm:w-14 sm:h-14 dark:bg-white/5 light:bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center dark:border-white/10 light:border-gray-200 group-hover:dark:border-white/20 group-hover:light:border-gray-300 transition-all duration-500"
        >
          {icon}
        </motion.div>
      </div>

      <motion.h3 
        whileHover={{ x: 4 }}
        className="text-base sm:text-lg md:text-xl font-bold dark:text-white light:text-gray-900 mb-3 sm:mb-4"
      >
        {title}
      </motion.h3>
      <p className="dark:text-gray-400 light:text-gray-600 text-xs sm:text-sm leading-relaxed font-light">
        {description}
      </p>

      <motion.div 
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.7 }}
        className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-${borderColorMap[color] || 'blue-500'} to-transparent`}
      />
    </motion.div>
  );
};

export default FeatureCard;
