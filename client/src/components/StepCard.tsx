import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const StepCard = ({ step, title, description, icon }: StepCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="relative group p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl dark:bg-[#111111] light:bg-white dark:border-white/10 light:border-gray-200 hover:dark:border-blue-500/50 hover:light:border-blue-400 transition-all duration-300"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-blue-600/5 rounded-2xl sm:rounded-3xl blur-xl"
      />
      
      <motion.div 
        className="absolute top-4 sm:top-5 md:top-6 right-5 sm:right-6 md:right-8 text-4xl sm:text-5xl font-black dark:text-white/5 light:text-gray-200 group-hover:text-blue-500/10 transition-colors"
        whileHover={{ scale: 1.1 }}
      >
        {step}
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-14 md:h-14 dark:bg-white/5 light:bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 dark:border-white/10 light:border-gray-200 group-hover:dark:bg-blue-600/10 group-hover:light:bg-blue-50 group-hover:dark:border-blue-500/20 group-hover:light:border-blue-200 transition-all"
      >
        {icon}
      </motion.div>

      <motion.h3 
        whileHover={{ x: 4 }}
        className="text-lg sm:text-xl font-bold dark:text-white light:text-gray-900 mb-2 sm:mb-3 group-hover:text-blue-400 transition-colors"
      >
        {title}
      </motion.h3>
      <p className="dark:text-gray-400 light:text-gray-600 text-xs sm:text-sm leading-relaxed font-light">
        {description}
      </p>

      <motion.div 
        whileHover={{ width: 80 }}
        className="mt-6 sm:mt-8 w-12 h-1 dark:bg-white/10 light:bg-gray-200 rounded-full group-hover:bg-blue-600 transition-all"
      />
    </motion.div>
  );
};

export default StepCard;
