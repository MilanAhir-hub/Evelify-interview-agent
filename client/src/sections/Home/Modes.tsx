import React from 'react';
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
    <section className="py-24 bg-[#080808]">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-[1px] bg-blue-500"></div>
            <span className="text-blue-500 text-sm font-bold uppercase tracking-widest">Versatile Experience</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Multiple Interview <span className="text-blue-500">Modes</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modes.map((mode, index) => (
            <ModeCard 
              key={index}
              title={mode.title}
              description={mode.description}
              icon={mode.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Modes;
