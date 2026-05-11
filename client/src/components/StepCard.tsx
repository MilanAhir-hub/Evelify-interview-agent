import React, { ReactNode } from 'react';

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: ReactNode;
}

const StepCard = ({ step, title, description, icon }: StepCardProps) => {
  return (
    <div className="relative group p-8 rounded-3xl bg-[#111111] border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2">
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity"></div>
      
      {/* Step Number Badge */}
      <div className="absolute top-6 right-8 text-5xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors">
        {step}
      </div>

      {/* Icon */}
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-all">
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed font-light">
        {description}
      </p>

      {/* Bottom accent line */}
      <div className="mt-8 w-12 h-1 bg-white/10 rounded-full group-hover:w-20 group-hover:bg-blue-600 transition-all"></div>
    </div>
  );
};

export default StepCard;
