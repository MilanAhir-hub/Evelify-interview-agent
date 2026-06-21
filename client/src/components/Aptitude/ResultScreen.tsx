import { motion } from 'framer-motion';
import { Home, RotateCcw, CheckCircle2, XCircle, Target } from 'lucide-react';
import type { ResultData } from '../../types/aptitude';

interface ResultScreenProps {
  result: ResultData;
  onRetry: () => void;
  onHome: () => void;
}

const getPerformanceColor = (level: string) => {
  switch (level) {
    case 'Exceptional': return 'text-green-400 border-green-500/30 bg-green-500/10';
    case 'Excellent': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case 'Good': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    case 'Average': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    default: return 'text-red-400 border-red-500/30 bg-red-500/10';
  }
};

const ResultScreen = ({ result, onRetry, onHome }: ResultScreenProps) => {
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (result.percentage / 100) * circumference;
  const performanceColor = getPerformanceColor(result.performanceLevel);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl"
        >
          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="relative w-36 h-36"
            >
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-4xl font-bold text-white"
                >
                  {result.percentage}%
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-xs text-gray-500 font-medium mt-1"
                >
                  Score
                </motion.span>
              </div>
            </motion.div>
          </div>

          {/* Performance Level Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <span className={`px-4 py-2 rounded-full border text-sm font-semibold ${performanceColor}`}>
              {result.performanceLevel}
            </span>
          </motion.div>

          {/* Motivational Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-gray-400 text-center text-sm mb-8 leading-relaxed"
          >
            {result.message}
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
              <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{result.correct}</p>
              <p className="text-xs text-gray-500 mt-1">Correct</p>
            </div>

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
              <XCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{result.wrong}</p>
              <p className="text-xs text-gray-500 mt-1">Wrong</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
              <Target className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{result.score}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="space-y-3"
          >
            <motion.button
              onClick={onRetry}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Test</span>
            </motion.button>

            <motion.button
              onClick={onHome}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-8 rounded-xl text-gray-300 font-medium border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultScreen;
