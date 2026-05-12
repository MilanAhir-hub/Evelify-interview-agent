import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type{ reportApi, InterviewReportData, Evaluation } from '../api/reportApi';
import { 
    Award, Brain, Target, MessageSquare, ShieldCheck, 
    ChevronDown, ChevronUp, Sparkles, Activity, AlertTriangle, 
    CheckCircle2, XCircle, FileText, BarChart3
} from 'lucide-react';

interface Props {
    sessionId?: string;
    reportId?: string;
}

const InterviewReport: React.FC<Props> = ({ sessionId, reportId }) => {
    const [report, setReport] = useState<InterviewReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                let res;
                if (reportId) {
                    res = await reportApi.getReport(reportId);
                } else if (sessionId) {
                    res = await reportApi.generateReport(sessionId);
                }

                if (res?.success && res.report) {
                    setReport(res.report);
                } else {
                    setError(res?.message || 'Failed to load report.');
                }
            } catch (err) {
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId || reportId) {
            fetchReport();
        }
    }, [sessionId, reportId]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (!report) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/[0.02] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                {/* Header Section */}
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Interview Analysis
                            </h1>
                        </div>
                        <p className="text-gray-400 font-medium">Comprehensive evaluation of your performance</p>
                    </div>

                    <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="text-center px-4 border-r border-white/10">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Final Score</p>
                            <p className="text-3xl font-black text-white">{report.finalCredits}%</p>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Recommendation</p>
                            <RecommendationBadge recommendation={report.recommendation} />
                        </div>
                    </div>
                </motion.header>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Strengths */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="p-6 rounded-[2rem] bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20 shadow-lg"
                    >
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-green-400">
                            <CheckCircle2 className="w-5 h-5" /> Key Strengths
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {report.strengths.map((s, i) => (
                                <span key={i} className="px-3 py-1.5 bg-green-500/10 text-green-300 text-xs font-semibold rounded-lg border border-green-500/20">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Weaknesses */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="p-6 rounded-[2rem] bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20 shadow-lg"
                    >
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-red-400">
                            <AlertTriangle className="w-5 h-5" /> Areas to Improve
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {report.weaknesses.map((w, i) => (
                                <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-300 text-xs font-semibold rounded-lg border border-red-500/20">
                                    {w}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Core Metrics */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="p-6 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg"
                    >
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-blue-400">
                            <Activity className="w-5 h-5" /> Core Metrics
                        </h3>
                        <div className="space-y-3">
                            <MetricBar label="Communication" score={report.analytics.communication} color="bg-blue-500" />
                            <MetricBar label="Technical" score={report.analytics.technical} color="bg-purple-500" />
                            <MetricBar label="Problem Solving" score={report.analytics.problemSolving} color="bg-indigo-500" />
                            <MetricBar label="Confidence" score={report.analytics.confidence} color="bg-teal-500" />
                        </div>
                    </motion.div>
                </div>

                {/* Question Breakdown */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <FileText className="w-6 h-6 text-blue-400" />
                        Question-by-Question Breakdown
                    </h2>

                    {report.evaluations.map((evalItem, index) => (
                        <QuestionCard 
                            key={index} 
                            evaluation={evalItem} 
                            index={index}
                            isExpanded={expandedQuestion === index}
                            onToggle={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

// Sub-components

const MetricBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>{label}</span>
            <span>{score}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.initial animate={{ width: `${score}%` }} className={`h-full ${color}`} />
            <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
        </div>
    </div>
);

const RecommendationBadge = ({ recommendation }: { recommendation: string }) => {
    let colors = '';
    switch (recommendation) {
        case 'Strong Hire': colors = 'bg-green-500/20 text-green-400 border-green-500/30'; break;
        case 'Hire': colors = 'bg-blue-500/20 text-blue-400 border-blue-500/30'; break;
        case 'Average': colors = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; break;
        case 'Needs Improvement': colors = 'bg-red-500/20 text-red-400 border-red-500/30'; break;
        default: colors = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }

    return (
        <div className={`px-4 py-1.5 rounded-full border text-sm font-black uppercase tracking-wider ${colors}`}>
            {recommendation}
        </div>
    );
};

const QuestionCard = ({ evaluation, index, isExpanded, onToggle }: { evaluation: Evaluation, index: number, isExpanded: boolean, onToggle: () => void }) => {
    const scoreColor = evaluation.score >= 8 ? 'text-green-400' : evaluation.score >= 5 ? 'text-yellow-400' : 'text-red-400';

    return (
        <motion.div 
            layout
            className={`rounded-[2rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-white/10 border-white/20 shadow-2xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
        >
            <div 
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0 relative">
                        <svg className="w-full h-full absolute inset-0 -rotate-90">
                            <circle cx="24" cy="24" r="22" className="stroke-white/10" strokeWidth="2" fill="none" />
                            <circle 
                                cx="24" cy="24" r="22" 
                                className={`stroke-current ${scoreColor}`} 
                                strokeWidth="2" 
                                fill="none" 
                                strokeDasharray={138} 
                                strokeDashoffset={138 - (138 * evaluation.score) / 10} 
                            />
                        </svg>
                        <span className="text-sm font-bold">{evaluation.score}</span>
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1 block">Question {index + 1}</span>
                        <h4 className="font-semibold text-lg leading-tight line-clamp-2">{evaluation.question}</h4>
                    </div>
                </div>
                <div className="shrink-0 ml-4 p-2 bg-white/5 rounded-full">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 bg-black/20"
                    >
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* User Answer */}
                                <div className="space-y-3">
                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-400" /> Your Answer
                                    </h5>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 text-sm leading-relaxed">
                                        {evaluation.userAnswer}
                                    </div>
                                </div>
                                {/* AI Ideal Answer */}
                                <div className="space-y-3">
                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                        <Brain className="w-4 h-4" /> Ideal Answer
                                    </h5>
                                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-100 text-sm leading-relaxed shadow-inner">
                                        {evaluation.aiIdealAnswer}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div>
                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Feedback</h5>
                                    <p className="text-sm text-gray-300 leading-relaxed">{evaluation.feedback}</p>
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-yellow-500 mb-2">How to Improve</h5>
                                    <p className="text-sm text-gray-300 leading-relaxed">{evaluation.improvement}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const LoadingState = () => (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white relative overflow-hidden p-6 text-center">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border border-blue-500/30 flex items-center justify-center relative mb-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]"
        >
            <Brain className="w-12 h-12 text-blue-400 absolute" />
            <motion.div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
            <motion.div className="absolute inset-0 border-r-2 border-blue-500 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Analyzing Your Performance</h2>
        <p className="text-gray-400 max-w-md mx-auto text-sm">
            Our AI is evaluating your responses, generating professional feedback, and structuring your premium interview report. This may take a few moments.
        </p>
    </div>
);

const ErrorState = ({ message }: { message: string }) => (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Report Generation Failed</h2>
        <p className="text-gray-400">{message}</p>
    </div>
);

export default InterviewReport;