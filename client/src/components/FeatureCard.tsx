import { motion, type ReactNode } from 'framer-motion';

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

const iconColorMap: Record<string, string> = {
  'blue-500': 'text-blue-400',
  'emerald-500': 'text-emerald-400',
  'purple-500': 'text-purple-400',
  'pink-500': 'text-pink-400',
};

const FeatureCard = ({ title, description, icon, color }: FeatureCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="relative group p-8 rounded-[2rem] bg-[#111111]/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${colorMap[color] || colorMap['blue-500']} rounded-full blur-[80px]`}
      />
      
      <div className="relative mb-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`absolute inset-0 bg-gradient-to-br ${colorMap[color] || colorMap['blue-500']} blur-xl rounded-2xl`}
        />
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="relative w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-500"
        >
          {icon}
        </motion.div>
      </div>

      <motion.h3 
        whileHover={{ x: 4 }}
        className="text-xl font-bold text-white mb-4"
      >
        {title}
      </motion.h3>
      <p className="text-gray-400 text-sm leading-relaxed font-light">
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
