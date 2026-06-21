import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import AptitudeStart from '../components/Aptitude/AptitudeStart';
import ProgressHeader from '../components/Aptitude/ProgressHeader';
import AptitudeQuestion from '../components/Aptitude/AptitudeQuestion';
import ResultScreen from '../components/Aptitude/ResultScreen';
import { useAptitudeTimer } from '../hooks/useAptitudeTimer';
import { aptitudeApi } from '../api/aptitudeApi';
import {
  setFetching,
  setQuestions,
  setError,
  startTest,
  answerQuestion,
  nextQuestion,
  setSubmitting as setSubmittingAction,
  setResult,
  resetTest,
} from '../redux/slices/aptitudeSlice';
import type { RootState, AppDispatch } from '../redux/store';
import Navbar from '../components/Navbar';

type TestStep = 'loading' | 'start' | 'test' | 'result';

const TOTAL_QUESTIONS = 20;
const TOTAL_MINUTES = 20;

const AptitudeTest = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    answers,
    testStatus,
    result,
    error,
  } = useSelector((state: RootState) => state.aptitude);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState<TestStep>('start');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasSubmittedRef = useRef(false);

  const blocker = useBlocker(
    () => {
      return step === 'test' && !hasSubmittedRef.current;
    }
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step === 'test' && !hasSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step]);

  const handleTimeUp = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const answeredAnswers = answers
      .filter((a) => a.selectedOption !== null)
      .map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption!,
      }));

    try {
      dispatch(setSubmittingAction());
      const elapsedSeconds = timerRef.current?.getElapsedSeconds() || TOTAL_MINUTES * 60;
      const response = await aptitudeApi.submitTest(answeredAnswers, elapsedSeconds);
      dispatch(setResult(response.data));
      setStep('result');
    } catch {
      setSubmitError('Failed to submit test. Please try again.');
      dispatch(resetTest());
    }
  }, [answers, dispatch]);

  const timer = useAptitudeTimer(TOTAL_MINUTES, handleTimeUp);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hasSubmittedRef.current = false;
    };
  }, []);

  const handleStart = useCallback(async () => {
    dispatch(setFetching());
    setStep('loading');

    try {
      const response = await aptitudeApi.getQuestions();
      if (!response.success || !response.data.length) {
        dispatch(setError('No questions available. Please try again later.'));
        setStep('start');
        return;
      }
      dispatch(setQuestions(response.data.slice(0, TOTAL_QUESTIONS)));
      dispatch(startTest());
      setStep('test');
      timer.startTimer();
    } catch {
      dispatch(setError('Failed to load questions. Please check your connection.'));
      setStep('start');
    }
  }, [dispatch, timer]);

  const handleAnswer = useCallback(
    (option: string) => {
      dispatch(answerQuestion({ questionIndex: currentQuestionIndex, selectedOption: option }));
    },
    [dispatch, currentQuestionIndex]
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      dispatch(nextQuestion());
    } else if (currentQuestionIndex === questions.length - 1) {
      handleSubmitTest();
    }
  }, [currentQuestionIndex, questions.length, dispatch]);

  const handleSubmitTest = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    setSubmitting(true);
    setSubmitError(null);
    timer.stopTimer();

    const answeredAnswers = answers
      .filter((a) => a.selectedOption !== null)
      .map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption!,
      }));

    try {
      dispatch(setSubmittingAction());
      const elapsedSeconds = timer.getElapsedSeconds();
      const response = await aptitudeApi.submitTest(answeredAnswers, elapsedSeconds);
      dispatch(setResult(response.data));
      setStep('result');
    } catch {
      setSubmitError('Failed to submit test. Please try again.');
      setSubmitting(false);
      hasSubmittedRef.current = false;
    }
  }, [answers, timer, dispatch]);

  const handleRetry = useCallback(() => {
    hasSubmittedRef.current = false;
    setSubmitting(false);
    setSubmitError(null);
    dispatch(resetTest());
    setStep('start');
  }, [dispatch]);

  const handleHome = useCallback(() => {
    dispatch(resetTest());
    navigate('/');
  }, [dispatch, navigate]);

  if (submitError) {
    return (
      <div className="min-h-screen dark:bg-[#050505] light:bg-gray-50 dark:text-white light:text-gray-900">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32">
          <div className="dark:bg-[#111111]/80 light:bg-white/80 backdrop-blur-xl dark:border-red-500/20 light:border-red-200 rounded-[2rem] p-10 text-center">
            <p className="text-red-400 mb-6">{submitError}</p>
            <button
              onClick={handleRetry}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
      {result && step === 'result' ? (
        <motion.div
          key="result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen dark:bg-gradient-to-b dark:from-[#0B1120] dark:via-[#0A0F1C] dark:to-[#070A14] light:bg-gradient-to-b light:from-gray-50 light:via-white light:to-gray-100 dark:text-white light:text-gray-900 selection:bg-blue-500/30 relative"
        >
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
          <Navbar />
          <main className="relative pt-20">
            <ResultScreen
              result={result}
              onRetry={handleRetry}
              onHome={handleHome}
            />
          </main>
        </motion.div>
      ) : step === 'loading' || step === 'start' ? (
        <motion.div
          key="start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen dark:bg-gradient-to-b dark:from-[#0B1120] dark:via-[#0A0F1C] dark:to-[#070A14] light:bg-gradient-to-b light:from-gray-50 light:via-white light:to-gray-100 dark:text-white light:text-gray-900 selection:bg-blue-500/30 relative"
        >
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
          <Navbar />
          <main className="relative pt-20">
            {error && (
              <div className="max-w-lg mx-auto px-4 pt-8">
                <div className="dark:bg-red-500/10 light:bg-red-50 dark:border-red-500/20 light:border-red-200 rounded-2xl p-6 text-center">
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                  <button
                    onClick={handleStart}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            <AptitudeStart onStart={handleStart} loading={step === 'loading'} />
          </main>
        </motion.div>
      ) : (
        <motion.div
          key="test"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen dark:bg-gradient-to-b dark:from-[#0B1120] dark:via-[#0A0F1C] dark:to-[#070A14] light:bg-gradient-to-b light:from-gray-50 light:via-white light:to-gray-100 dark:text-white light:text-gray-900 selection:bg-blue-500/30 relative"
        >
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />

          <ProgressHeader
            currentQuestion={currentQuestionIndex}
            totalQuestions={questions.length}
            remainingSeconds={timer.remainingSeconds}
            formattedTime={timer.formattedTime}
          />

          <main className="relative pt-8 pb-20">
            {questions.length > 0 && currentQuestionIndex < questions.length && (
              <AptitudeQuestion
                question={questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                answer={answers[currentQuestionIndex] || { questionId: '', selectedOption: null, isCorrect: null }}
                onAnswer={handleAnswer}
                onNext={handleNext}
              />
            )}

            {submitting && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="dark:bg-[#111111]/90 light:bg-white dark:border-white/10 light:border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  <p className="dark:text-gray-300 light:text-gray-700 text-sm font-medium">Submitting your test...</p>
                </div>
              </div>
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
      {blocker.state === 'blocked' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-white">
              <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-b from-[#0F1322] to-[#0a0d18] border border-white/10 p-6 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-6"
              >
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto shadow-lg">
                      <AlertCircle className="w-10 h-10 text-yellow-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Leave Test?</h3>
                      <p className="text-gray-400 text-sm">
                          Are you sure you want to leave? Your active aptitude test session progress will be lost and cannot be recovered.
                      </p>
                  </div>
                  <div className="flex gap-4">
                      <button
                          onClick={() => blocker.reset()}
                          className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 transition-all text-sm"
                      >
                          Keep Testing
                      </button>
                      <button
                          onClick={() => blocker.proceed()}
                          className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-600/20 transition-all text-sm"
                      >
                          Exit Test
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
    </>
  );
};

export default AptitudeTest;
