import { motion, type ReactNode } from 'framer-motion';

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
      className="group p-8 rounded-3xl bg-gradient-to-b from-[#111111] to-[#0a0a0a] border border-white/5 hover:border-blue-500/30 transition-all duration-300"
    >
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="mb-6 inline-flex p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all"
      >
        {icon}
      </motion.div>

      <motion.h3 
        whileHover={{ x: 4 }}
        className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors"
      >
        {title}
      </motion.h3>
      <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
        {description}
      </p>

      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="mt-6 flex items-center gap-1.5"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-blue-500"
        />
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active Mode</span>
      </motion.div>
    </motion.div>
  );
};

export default ModeCard;
