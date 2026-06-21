import { motion } from 'framer-motion';
import ModeCard from '../../components/ModeCard';
import { Users, Code2, Waves, Zap } from 'lucide-react';

const Modes = () => {
  const modes = [
    {
      title: "HR Interview Mode",
      description: "Focus on behavioral questions, cultural fit, and communication based evaluation to ace your HR rounds.",
      icon: <Users className="w-6 h-6 text-blue-400" />
    },
    {
      title: "Technical Mode",
      description: "Deep technical questioning based on your selected role. Test your coding, system design, and domain knowledge.",
      icon: <Code2 className="w-6 h-6 text-blue-400" />
    },
    {
      title: "Confidence Detection",
      description: "Advanced tone and voice analysis. Get insights into your confidence levels and speaking clarity during the session.",
      icon: <Waves className="w-6 h-6 text-blue-400" />
    },
    {
      title: "Credits System",
      description: "Seamless credits management. Unlock premium interview sessions and advanced AI features easily.",
      icon: <Zap className="w-6 h-6 text-blue-400" />
    }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-32 dark:bg-[#080808] light:bg-gray-100 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-indigo-600/5"
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-12 md:mb-16"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-8 sm:w-10 h-[1px] bg-blue-500 origin-left"
            />
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-blue-500 text-xs sm:text-sm font-bold uppercase tracking-widest"
            >
              Versatile Experience
            </motion.span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white light:text-gray-900 tracking-tight">
            Multiple Interview <motion.span 
              initial={{ backgroundPosition: "0% 50%" }}
              whileInView={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              viewport={{ once: true }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-blue-500 bg-gradient-to-r from-blue-400 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent"
            >
              Modes
            </motion.span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modes.map((mode, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <ModeCard 
                title={mode.title}
                description={mode.description}
                icon={mode.icon}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modes;
