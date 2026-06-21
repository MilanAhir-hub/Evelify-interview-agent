import { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface ProgressHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  remainingSeconds: number;
  formattedTime: string;
}

const ProgressHeader = memo(function ProgressHeader({
  currentQuestion,
  totalQuestions,
  remainingSeconds,
  formattedTime,
}: ProgressHeaderProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const isLowTime = remainingSeconds <= 60;
  const isWarningTime = remainingSeconds <= 300 && remainingSeconds > 60;

  return (
    <div className="sticky top-0 z-50 dark:bg-[#050505]/80 light:bg-white/80 backdrop-blur-xl dark:border-white/5 light:border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          {/* Question Counter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium dark:text-gray-400 light:text-gray-600">
              Question
            </span>
            <motion.span
              key={currentQuestion}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold dark:text-white light:text-gray-900"
            >
              {currentQuestion + 1}
            </motion.span>
            <span className="text-sm dark:text-gray-500 light:text-gray-400">
              / {totalQuestions}
            </span>
          </div>

          {/* Timer */}
          <motion.div
            animate={
              isLowTime
                ? { scale: [1, 1.05, 1] }
                : {}
            }
            transition={
              isLowTime
                ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                : {}
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isLowTime
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : isWarningTime
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                : 'dark:bg-white/5 dark:border-white/10 light:bg-gray-100 light:border-gray-200 dark:text-gray-300 light:text-gray-700'
            }`}
          >
            {isLowTime ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="font-mono font-semibold text-sm tabular-nums">
              {formattedTime}
            </span>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 dark:bg-white/5 light:bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            layout
            className={`h-full rounded-full transition-colors duration-500 ${
              isLowTime
                ? 'bg-red-500'
                : isWarningTime
                ? 'bg-yellow-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>
    </div>
  );
});

export default ProgressHeader;
