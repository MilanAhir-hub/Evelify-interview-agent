import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Award, ChevronLeft, ChevronRight, FileText, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { interviewApi } from '../api/interviewApi';
import type { InterviewHistoryItem } from '../api/interviewApi';
import type { RootState } from '../redux/store';
import Navbar from '../components/Navbar';
import AuthPopup from '../components/AuthPopup';

const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case 'Strong Hire': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Hire': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'Average': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Needs Improvement': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const History = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }
    fetchHistory(1);
  }, [isAuthenticated]);

  const fetchHistory = async (page: number) => {
    try {
      setLoading(true);
      const response = await interviewApi.fetchInterviewHistory(page, 10);
      if (response.success) {
        setHistory(response.data);
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalCount: response.pagination.totalCount
        });
      } else {
        setError('Failed to fetch history');
      }
    } catch (err) {
      setError('Error loading interview history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        {showAuthPopup && <AuthPopup onClose={() => {
          setShowAuthPopup(false);
          navigate('/');
        }} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-blue-400" />
            </motion.div>
            <h1 className="text-3xl font-bold">Interview History</h1>
          </div>
          <p className="text-gray-400">Review your past mock interviews and track your progress</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="relative w-16 h-16"
              >
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500"></div>
              </motion.div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-400">{error}</p>
            </motion.div>
          ) : history.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-block"
              >
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2">No Interviews Yet</h2>
              <p className="text-gray-400 mb-6">Start your first mock interview to see your history here</p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/interview')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
              >
                Start Interview
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6"
            >
              {history.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -3, borderColor: "rgba(75, 85, 99, 0.5)" }}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.h3 
                          whileHover={{ x: 5 }}
                          className="text-xl font-semibold"
                        >
                          {item.role}
                        </motion.h3>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(item.report?.recommendation || '')}`}
                        >
                          {item.report?.recommendation || 'Pending'}
                        </motion.span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.createdAt)}</span>
                        </motion.div>
                        <span>•</span>
                        <span>{item.experience}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.skills.slice(0, 4).map((skill, idx) => (
                          <motion.span
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1 bg-gray-800/80 text-gray-300 text-sm rounded-full cursor-default"
                          >
                            {skill}
                          </motion.span>
                        ))}
                        {item.skills.length > 4 && (
                          <span className="px-3 py-1 bg-gray-800/80 text-gray-400 text-sm rounded-full">
                            +{item.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {item.report && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Top Strengths</div>
                            {item.report.strengths.slice(0, 2).map((strength, idx) => (
                              <motion.div 
                                key={idx}
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-2 text-sm text-green-400"
                              >
                                <TrendingUp className="w-3 h-3" />
                                <span className="truncate">{strength}</span>
                              </motion.div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Areas to Improve</div>
                            {item.report.weaknesses.slice(0, 2).map((weakness, idx) => (
                              <motion.div 
                                key={idx}
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-2 text-sm text-orange-400"
                              >
                                <AlertCircle className="w-3 h-3" />
                                <span className="truncate">{weakness}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {item.report && (
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="lg:w-64 flex-shrink-0"
                      >
                        <div className="bg-gray-800/50 rounded-xl p-4">
                          <div className="text-center mb-4">
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                              className="text-4xl font-bold mb-1"
                            >
                              <span className={getScoreColor(item.report.finalCredits)}>
                                {item.report.finalCredits}%
                              </span>
                            </motion.div>
                            <div className="text-xs text-gray-500 uppercase">Final Score</div>
                          </div>

                          <div className="space-y-2">
                            {[
                              { label: 'Technical', value: item.report.analytics.technical, color: 'bg-blue-500' },
                              { label: 'Communication', value: item.report.analytics.communication, color: 'bg-purple-500' },
                              { label: 'Confidence', value: item.report.analytics.confidence, color: 'bg-yellow-500' },
                              { label: 'Problem Solving', value: item.report.analytics.problemSolving, color: 'bg-green-500' },
                              { label: 'Behavioral', value: item.report.analytics.behavioral, color: 'bg-pink-500' },
                            ].map((metric, idx) => (
                              <div key={idx}>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">{metric.label}</span>
                                  <span>{metric.value}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(metric.value / 100) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                                    className={`${metric.color} h-1.5 rounded-full`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {pagination.totalPages > 1 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === pagination.currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-700 hover:bg-gray-800'
                }`}
              >
                {page}
              </motion.button>
            ))}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default History;