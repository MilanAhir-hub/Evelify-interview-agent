import { motion, type ReactNode } from 'framer-motion';

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
      className="relative group p-8 rounded-3xl bg-[#111111] border border-white/10 hover:border-blue-500/50 transition-all duration-300"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-blue-600/5 rounded-3xl blur-2xl"
      />
      
      <motion.div 
        className="absolute top-6 right-8 text-5xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors"
        whileHover={{ scale: 1.1 }}
      >
        {step}
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-all"
      >
        {icon}
      </motion.div>

      <motion.h3 
        whileHover={{ x: 4 }}
        className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors"
      >
        {title}
      </motion.h3>
      <p className="text-gray-400 text-sm leading-relaxed font-light">
        {description}
      </p>

      <motion.div 
        whileHover={{ width: 80 }}
        className="mt-8 w-12 h-1 bg-white/10 rounded-full group-hover:bg-blue-600 transition-all"
      />
    </motion.div>
  );
};

export default StepCard;
