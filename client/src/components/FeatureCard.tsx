import React, { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

const FeatureCard = ({ title, description, icon, color }: FeatureCardProps) => {
  return (
    <div className="relative group p-8 rounded-[2rem] bg-[#111111]/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden">
      {/* Background Gradient on Hover */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 bg-${color}/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Icon with Glowing Border */}
      <div className="relative mb-8">
        <div className={`absolute inset-0 bg-${color}/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        <div className="relative w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 group-hover:scale-110 transition-all duration-500">
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-4 group-hover:translate-x-1 transition-transform">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed font-light">
        {description}
      </p>

      {/* Subtle bottom detail */}
      <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-${color} to-transparent group-hover:w-full transition-all duration-700`}></div>
    </div>
  );
};

export default FeatureCard;
