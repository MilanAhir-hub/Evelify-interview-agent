import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lightbulb, AlertTriangle } from 'lucide-react';
import OptionCard from './OptionCard';
import type { QuestionData, AnswerRecord } from '../../types/aptitude';

interface AptitudeQuestionProps {
  question: QuestionData;
  questionIndex: number;
  totalQuestions: number;
  answer: AnswerRecord;
  onAnswer: (option: string) => void;
  onNext: () => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'text-green-400 bg-green-500/10 border-green-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  hard: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function AptitudeQuestion({
  question,
  questionIndex,
  totalQuestions,
  answer,
  onAnswer,
  onNext,
}: AptitudeQuestionProps) {
  const isAnswered = answer.selectedOption !== null;
  const isLastQuestion = questionIndex === totalQuestions - 1;

  const handleSelect = useCallback(
    (option: string) => {
      if (!isAnswered) {
        onAnswer(option);
      }
    },
    [isAnswered, onAnswer]
  );

  return (
    <div className="max-w-3xl mx-auto px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Category & Difficulty Badges */}
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full dark:bg-white/5 light:bg-gray-100 dark:border-white/10 light:border-gray-200 text-xs font-medium dark:text-gray-300 light:text-gray-700">
              {question.category}
            </span>
            <span className={`px-3 py-1 rounded-full border text-xs font-medium ${difficultyColors[question.difficulty] || 'dark:text-gray-400 light:text-gray-600 dark:bg-white/5 light:bg-gray-100 dark:border-white/10 light:border-gray-200'}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-semibold dark:text-white light:text-gray-900 leading-relaxed mb-8">
            {question.questionText}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <OptionCard
                key={`${questionIndex}-${index}`}
                text={option}
                index={index}
                isSelected={answer.selectedOption === option}
                isCorrect={answer.isCorrect}
                isRevealed={isAnswered}
                disabled={isAnswered}
                onSelect={() => handleSelect(option)}
              />
            ))}
          </div>

          {/* Hint Section (shown when wrong) */}
          <AnimatePresence>
            {isAnswered && answer.isCorrect === false && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-orange-200 font-medium text-sm mb-1">Hint</p>
                    <p className="text-orange-300/80 text-sm leading-relaxed">{question.hint}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Correct / Wrong Feedback */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className={`mt-4 p-4 rounded-2xl flex items-center gap-3 ${
                  answer.isCorrect
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {answer.isCorrect ? (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-green-300 font-medium text-sm">Correct Answer!</span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-red-300 font-medium text-sm">
                      Incorrect. The correct answer is: <span className="text-green-400">{question.correctAnswer}</span>
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-8 flex justify-end"
              >
                <button
                  onClick={onNext}
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-[#050505] light:focus:ring-offset-white"
                >
                  <span>{isLastQuestion ? 'Submit Test' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
