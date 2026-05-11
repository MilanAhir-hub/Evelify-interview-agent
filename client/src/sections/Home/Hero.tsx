import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Play, ShieldCheck } from 'lucide-react';
import type{ RootState } from '../../redux/store';
import AuthPopup from '../../components/AuthPopup';

const Hero = () => {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleStartInterview = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setShowAuthPopup(true);
    }
  };

  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute top-40 left-1/3 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] -z-10"></div>

      <div className="container mx-auto px-6 text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-100/80">
            Powered by Advanced GPT-4o
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <span className="text-white">Master Your Next</span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Interview with AI
          </span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Practice with realistic, industry-specific mock interviews. Get instant behavioral feedback and improve your confidence before the real big day.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <button 
            onClick={handleStartInterview}
            className="group relative bg-white text-black font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center gap-3 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-[0.98]"
          >
            <span>Start Mock Interview</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="flex items-center gap-3 py-4 px-10 rounded-2xl text-white font-semibold border border-white/10 hover:bg-white/5 transition-all">
            <Play className="w-4 h-4 fill-white" />
            <span>View History</span>
          </button>
        </div>

        {/* Social Proof / Trust */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">Privacy Focused</span>
          </div>
          <div className="h-4 w-px bg-white/20 hidden md:block"></div>
          <span className="text-sm font-medium">10,000+ Interviews Conducted</span>
          <div className="h-4 w-px bg-white/20 hidden md:block"></div>
          <span className="text-sm font-medium">98% User Satisfaction</span>
        </div>
      </div>
      
      {/* Auth Popup */}
      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}
    </section>
  );
};

export default Hero;