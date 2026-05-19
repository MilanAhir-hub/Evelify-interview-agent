import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Play, ShieldCheck, Brain } from 'lucide-react';
import type { RootState } from '../../redux/store';
import AuthPopup from '../../components/AuthPopup';

const Hero = () => {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleStartInterview = () => {
    if (isAuthenticated) {
      navigate('/interview');
    } else {
      setShowAuthPopup(true);
    }
  };

  const handleViewHistory = () => {
    if (isAuthenticated) {
      navigate('/history');
    } else {
      setShowAuthPopup(true);
    }
  };

  const handleStartAptitude = () => {
    if (isAuthenticated) {
      navigate('/aptitude');
    } else {
      setShowAuthPopup(true);
    }
  };

  return (
      <section className="relative pt-40 pb-32 overflow-hidden bg-gradient-to-b from-[#0B1120] via-[#0A0F1C] to-[#070A14]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=%2260%22_height=%2260%22_viewBox=%220_0_60_60%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg_fill=%22none%22_fill-rule=%22evenodd%22%3E%3Cg_fill=%22%233B82F6%22_fill-opacity=%220.03%22%3E%3Cpath_d=%22M36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] -z-10"
      />
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-1/3 right-0 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 shadow-sm"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </motion.div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-200/80">
            Powered by Advanced GPT-4o
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-white">Master Your Next</span>
          <br />
          <motion.span 
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="bg-gradient-to-r from-blue-500 via-indigo-400 to-indigo-500 bg-clip-text text-transparent bg-[length:200%_auto]"
          >
            Interview with AI
          </motion.span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto text-gray-400 text-base md:text-lg leading-relaxed mb-10"
        >
          Practice with realistic, industry-specific mock interviews. Get instant behavioral feedback and improve your confidence before the real big day.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            onClick={handleStartInterview}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0B1120]"
          >
            <span>Start Mock Interview</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={handleStartAptitude}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(99, 102, 241, 0.15)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 py-3.5 px-8 rounded-xl text-indigo-200 font-semibold border border-indigo-500/35 bg-indigo-950/10 hover:bg-indigo-950/20 hover:border-indigo-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0B1120]"
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Practice Aptitude</span>
          </motion.button>

          <motion.button 
            onClick={handleViewHistory}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(31, 41, 55, 0.3)", borderColor: "rgba(75, 85, 99, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 py-3.5 px-8 rounded-xl text-gray-200 font-medium border border-gray-700/80 bg-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#0B1120]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>View History</span>
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center items-center gap-6 md:gap-12 text-gray-400/70"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">Privacy Focused</span>
          </motion.div>
          <div className="h-4 w-px bg-gray-700/50 hidden md:block"></div>
          <span className="text-sm font-medium">10,000+ Interviews Conducted</span>
          <div className="h-4 w-px bg-gray-700/50 hidden md:block"></div>
          <span className="text-sm font-medium">98% User Satisfaction</span>
        </motion.div>
      </div>

      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}
    </section>
  )
};

export default Hero;