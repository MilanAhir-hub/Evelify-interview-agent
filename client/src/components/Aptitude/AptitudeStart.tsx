import { motion } from 'framer-motion';
import { Brain, Clock, ListChecks, Lightbulb } from 'lucide-react';

interface AptitudeStartProps {
  onStart: () => void;
  loading: boolean;
}

const AptitudeStart = ({ onStart, loading }: AptitudeStartProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-lg w-full"
      >
        <div className="dark:bg-[#111111]/80 light:bg-white/80 backdrop-blur-xl dark:border-white/10 light:border-gray-200 rounded-[2rem] p-10 shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-600/20"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold dark:text-white light:text-gray-900 text-center mb-3">
            Aptitude Assessment
          </h1>
          <p className="dark:text-gray-400 light:text-gray-600 text-center text-sm mb-8 leading-relaxed">
            Test your quantitative, logical, and verbal reasoning skills
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 rounded-xl dark:bg-white/5 light:bg-gray-100 dark:border-white/5 light:border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <ListChecks className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="dark:text-white light:text-gray-900 font-medium text-sm">20 Questions</p>
                <p className="dark:text-gray-500 light:text-gray-500 text-xs mt-0.5">Covering all major aptitude topics</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl dark:bg-white/5 light:bg-gray-100 dark:border-white/5 light:border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="dark:text-white light:text-gray-900 font-medium text-sm">20 Minutes</p>
                <p className="dark:text-gray-500 light:text-gray-500 text-xs mt-0.5">Complete the test within the time limit</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl dark:bg-white/5 light:bg-gray-100 dark:border-white/5 light:border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="dark:text-white light:text-gray-900 font-medium text-sm">Instant Feedback</p>
                <p className="dark:text-gray-500 light:text-gray-500 text-xs mt-0.5">Know if you're correct after each question</p>
              </div>
            </div>
          </div>

          <motion.button
            onClick={onStart}
            disabled={loading}
            whileHover={loading ? {} : { scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            whileTap={loading ? {} : { scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Loading Questions...</span>
              </>
            ) : (
              <span>Start Test</span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AptitudeStart;
