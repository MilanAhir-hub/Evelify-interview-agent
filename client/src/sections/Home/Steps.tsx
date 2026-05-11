import React from 'react';
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
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <StepCard 
              key={index}
              step={item.step}
              title={item.title}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;
