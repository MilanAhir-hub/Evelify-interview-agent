import React, { ReactNode } from 'react';

interface ModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const ModeCard = ({ title, description, icon }: ModeCardProps) => {
  return (
    <div className="group p-8 rounded-3xl bg-gradient-to-b from-[#111111] to-[#0a0a0a] border border-white/5 hover:border-blue-500/30 transition-all duration-300">
      {/* Icon Area */}
      <div className="mb-6 inline-flex p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
        {icon}
      </div>

      {/* Text Area */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
        {description}
      </p>

      {/* Subtle indicator */}
      <div className="mt-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active Mode</span>
      </div>
    </div>
  );
};

export default ModeCard;
