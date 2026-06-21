import { motion } from 'framer-motion';
import StepCard from '../../components/StepCard';
import { Briefcase, Mic, Timer } from 'lucide-react';

const Steps = () => {
  const steps = [
    {
      step: "01",
      title: "Role & Experience Selection",
      description: "AI adjusts difficulty based on selected job role. Personalized questions tailored to your experience level.",
      icon: <Briefcase className="w-7 h-7 text-blue-400" />
    },
    {
      step: "02",
      title: "Smart Voice Interview",
      description: "Dynamic follow-up questions based on your answers. Realistic conversation flow to test your verbal skills.",
      icon: <Mic className="w-7 h-7 text-purple-400" />
    },
    {
      step: "03",
      title: "Timer Based Simulations",
      description: "Real interview pressure with time tracking. Learn to manage your time and answer effectively under stress.",
      icon: <Timer className="w-7 h-7 text-pink-400" />
    }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-32 relative overflow-hidden dark:bg-[#050505] light:bg-gray-50">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent dark:via-white/5 light:via-gray-200 to-transparent"
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold dark:text-white light:text-gray-900 mb-3 sm:mb-4">How it works</h2>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full origin-center"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <StepCard 
                step={item.step}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;
