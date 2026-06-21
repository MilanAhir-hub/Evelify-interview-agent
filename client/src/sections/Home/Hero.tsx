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
      <section className="relative pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 md:pb-32 overflow-hidden dark:bg-gradient-to-b dark:from-[#0B1120] dark:via-[#0A0F1C] dark:to-[#070A14] light:bg-gradient-to-b light:from-gray-50 light:via-white light:to-gray-100">
        <div className="absolute inset-0 dark:bg-[url('data:image/svg+xml,%3Csvg_width=%2260%22_height=%2260%22_viewBox=%220_0_60_60%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg_fill=%22none%22_fill-rule=%22evenodd%22%3E%3Cg_fill=%22%233B82F6%22_fill-opacity=%220.03%22%3E%3Cpath_d=%22M36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] light:bg-[url('data:image/svg+xml,%3Csvg_width=%2260%22_height=%2260%22_viewBox=%220_0_60_60%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg_fill=%22none%22_fill-rule=%22evenodd%22%3E%3Cg_fill=%22%233B82F6%22_fill-opacity=%220.05%22%3E%3Cpath_d=%22M36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-20 light:opacity-40 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[600px] lg:w-[800px] h-[200px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-blue-600/15 dark:bg-blue-600/15 light:bg-blue-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -z-10"
      />
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-1/3 right-0 w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[150px] sm:h-[250px] md:h-[350px] lg:h-[400px] bg-indigo-600/10 dark:bg-indigo-600/10 light:bg-indigo-500/8 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-white/5 light:bg-gray-900/5 backdrop-blur-sm dark:border-white/10 light:border-gray-200 mb-6 sm:mb-8 shadow-sm"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3.5 sm:w-3.5 h-3.5 text-blue-400" />
          </motion.div>
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider dark:text-blue-200/80 light:text-blue-600">
            Powered by Advanced GPT-4o
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
        >
          <span className="dark:text-white light:text-gray-900">Master Your Next</span>
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
          className="max-w-xl sm:max-w-2xl mx-auto dark:text-gray-400 light:text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10"
        >
          Practice with realistic, industry-specific mock interviews. Get instant behavioral feedback and improve your confidence before the real big day.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <motion.button
            onClick={handleStartInterview}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-[#0B1120] light:focus:ring-offset-white text-sm sm:text-base"
          >
            <span>Start Mock Interview</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={handleStartAptitude}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(99, 102, 241, 0.15)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-indigo-200 light:text-indigo-700 dark:border-indigo-500/35 light:border-indigo-200/50 dark:bg-indigo-950/10 light:bg-indigo-50 hover:dark:bg-indigo-950/20 hover:light:bg-indigo-100 dark:hover:border-indigo-500/50 light:hover:border-indigo-300 text-sm sm:text-base"
          >
            <Brain className="w-4 h-4 dark:text-indigo-400 light:text-indigo-600" />
            <span>Practice Aptitude</span>
          </motion.button>

          <motion.button 
            onClick={handleViewHistory}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl font-medium border bg-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-200 light:text-gray-700 dark:border-gray-700/80 light:border-gray-300 hover:dark:bg-gray-800/30 hover:light:bg-gray-100 dark:focus:ring-offset-[#0B1120] light:focus:ring-offset-white text-sm sm:text-base"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>View History</span>
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 sm:mt-16 md:mt-20 flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-12 dark:text-gray-400/70 light:text-gray-500"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">Privacy Focused</span>
          </motion.div>
          <div className="h-4 w-px dark:bg-gray-700/50 light:bg-gray-300 hidden md:block"></div>
          <span className="text-xs sm:text-sm font-medium">10,000+ Interviews</span>
          <div className="h-4 w-px dark:bg-gray-700/50 light:bg-gray-300 hidden md:block"></div>
          <span className="text-xs sm:text-sm font-medium">98% Satisfaction</span>
        </motion.div>
      </div>

      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}
    </section>
  )
};

export default Hero;