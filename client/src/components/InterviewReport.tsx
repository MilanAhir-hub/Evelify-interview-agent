import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reportApi } from '../api/reportApi';
import type { InterviewReportData, Evaluation } from '../api/reportApi';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import jsPDF from 'jspdf';

import {
    Brain, MessageSquare,
    ChevronDown, ChevronUp, Sparkles, Activity, AlertTriangle,
    CheckCircle2, XCircle, FileText, BarChart3, Download
} from 'lucide-react';

interface Props {
    sessionId?: string;
    reportId?: string;
    onReset?: () => void;
}

const generatePDF = async (report: InterviewReportData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    let yPos = margin;

    const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
        }
    };

    pdf.setFillColor(15, 19, 34);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(margin, yPos, contentWidth, 45, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Interview Analysis Report', margin + 10, yPos + 15);
    
    pdf.setFontSize(10);
    pdf.setTextColor(156, 163, 175);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Comprehensive evaluation of your performance', margin + 10, yPos + 25);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(`${report.finalCredits}%`, margin + 10, yPos + 38);
    pdf.setFontSize(9);
    pdf.setTextColor(156, 163, 175);
    pdf.text('Final Score', margin + 10, yPos + 43);

    const recText = report.recommendation;
    pdf.setFontSize(11);
    pdf.setTextColor(34, 197, 94);
    if (report.recommendation === 'Needs Improvement') pdf.setTextColor(239, 68, 68);
    else if (report.recommendation === 'Average') pdf.setTextColor(234, 179, 8);
    pdf.text(recText, margin + 70, yPos + 38);
    pdf.setFontSize(9);
    pdf.setTextColor(156, 163, 175);
    pdf.text('Recommendation', margin + 70, yPos + 43);

    yPos += 55;

    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(margin, yPos, contentWidth / 2 - 5, 35, 2, 2, 'F');
    pdf.roundedRect(margin + contentWidth / 2 + 5, yPos, contentWidth / 2 - 5, 35, 2, 2, 'F');

    pdf.setFontSize(11);
    pdf.setTextColor(34, 197, 94);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Strengths', margin + 10, yPos + 10);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(209, 213, 219);
    let strengthText = report.strengths.slice(0, 3).join(', ');
    if (report.strengths.length > 3) strengthText += '...';
    const strengthLines = pdf.splitTextToSize(strengthText, contentWidth / 2 - 20);
    pdf.text(strengthLines, margin + 10, yPos + 18);

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(239, 68, 68);
    pdf.text('Areas to Improve', margin + contentWidth / 2 + 10, yPos + 10);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(209, 213, 219);
    let weaknessText = report.weaknesses.slice(0, 3).join(', ');
    if (report.weaknesses.length > 3) weaknessText += '...';
    const weaknessLines = pdf.splitTextToSize(weaknessText, contentWidth / 2 - 20);
    pdf.text(weaknessLines, margin + contentWidth / 2 + 10, yPos + 18);

    yPos += 45;

    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text('Core Metrics', margin + 10, yPos + 10);

    const metrics = [
        { label: 'Communication', value: report.analytics.communication },
        { label: 'Technical', value: report.analytics.technical },
        { label: 'Problem Solving', value: report.analytics.problemSolving },
        { label: 'Confidence', value: report.analytics.confidence },
    ];

    const barWidth = 50;
    const startX = margin + 10;
    metrics.forEach((metric, i) => {
        const x = startX + i * (barWidth + 15);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(metric.label, x, yPos + 16);
        pdf.setFillColor(55, 65, 81);
        pdf.roundedRect(x, yPos + 18, barWidth, 4, 1, 1, 'F');
        pdf.setFillColor(59, 130, 246);
        pdf.roundedRect(x, yPos + 18, (barWidth * metric.value) / 100, 4, 1, 1, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${metric.value}%`, x + barWidth / 2 - 5, yPos + 26);
    });

    yPos += 35;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Question-by-Question Breakdown', margin, yPos);
    yPos += 10;

    for (let i = 0; i < report.evaluations.length; i++) {
        const evalItem = report.evaluations[i];
        checkPageBreak(80);

        pdf.setFillColor(30, 41, 59);
        pdf.roundedRect(margin, yPos, contentWidth, 75, 2, 2, 'F');

        pdf.setFontSize(10);
        pdf.setTextColor(59, 130, 246);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Question ${i + 1}`, margin + 10, yPos + 8);

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        const questionLines = pdf.splitTextToSize(evalItem.question, contentWidth - 30);
        pdf.text(questionLines, margin + 10, yPos + 16);

        const scoreColor = evalItem.score >= 8 ? [34, 197, 94] : evalItem.score >= 5 ? [234, 179, 8] : [239, 68, 68];
        pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        pdf.circle(margin + contentWidth - 15, yPos + 10, 6, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(evalItem.score), margin + contentWidth - 17, yPos + 11.5, { align: 'center' });

        yPos += 22;

        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Your Answer:', margin + 10, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(209, 213, 219);
        const userAnsLines = pdf.splitTextToSize(evalItem.userAnswer, contentWidth - 30);
        pdf.text(userAnsLines, margin + 10, yPos + 5);

        const userAnsHeight = userAnsLines.length * 4;
        yPos += userAnsHeight + 5;

        pdf.setFontSize(8);
        pdf.setTextColor(96, 165, 250);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Ideal Answer:', margin + 10, yPos);
        pdf.setFont('helvetica', 'normal');
        const aiAnsLines = pdf.splitTextToSize(evalItem.aiIdealAnswer, contentWidth - 30);
        pdf.text(aiAnsLines, margin + 10, yPos + 5);

        const aiAnsHeight = aiAnsLines.length * 4;
        yPos += aiAnsHeight + 10;

        if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = margin;
        }
    }

    pdf.setTextColor(156, 163, 175);
    pdf.setFontSize(8);
    pdf.text('Generated by Evelify', pageWidth / 2, pageHeight - 10, { align: 'center' });

    pdf.save('interview-report.pdf');
};

const InterviewReport: React.FC<Props> = ({ sessionId, reportId, onReset }) => {
    const dispatch = useDispatch();
    const [report, setReport] = useState<InterviewReportData | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const hasFetched = useRef(false);

    const handleDownloadPDF = async () => {
        if (!report) return;
        setDownloadingPdf(true);
        try {
            await generatePDF(report);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setDownloadingPdf(false);
        }
    };

    useEffect(() => {
        // Guard: prevent React StrictMode double-mount from firing two concurrent API calls
        if (hasFetched.current) return;

        const fetchReport = async () => {
            hasFetched.current = true;
            setLoading(true);
            try {
                let res: any;
                if (reportId) {
                    res = await reportApi.getReport(reportId);
                } else if (sessionId) {
                    res = await reportApi.generateReport(sessionId);
                }

                if (res?.success && res.report) {
                    setReport(res.report);
                    // Update credits in Redux if updated user is returned
                    if (res.user) {
                        dispatch(setUser(res.user));
                    }
                } else {

                    setError(res?.message || 'Failed to load report.');
                }
            } catch (err: any) {
                console.error("REPORT GENERATION ERROR:", err);
                setError(`An unexpected error occurred: ${err?.message || 'Unknown error'}`);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
            {/* Header Section */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 p-10 rounded-[2.5rem] bg-[#0F1322]/80 border border-white/10 backdrop-blur-xl shadow-2xl"
            >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Interview Analysis
                            </h1>
                        </div>
                        <p className="text-gray-400 font-medium">Comprehensive evaluation of your performance</p>
                        
                        {onReset && (
                            <button 
                                onClick={onReset}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
                            >
                                <BarChart3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Apply for Another Interview
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-black/40 p-5 rounded-[2rem] border border-white/5">
                        <div className="text-center px-6 sm:border-r border-white/10">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Final Score</p>
                            <p className="text-3xl font-black text-white">{report.finalCredits}%</p>
                        </div>
                        <div className="text-center px-6">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Recommendation</p>
                            <RecommendationBadge recommendation={report.recommendation} />
                        </div>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloadingPdf}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {downloadingPdf ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {downloadingPdf ? 'Generating...' : 'Download PDF'}
                        </button>
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

                {/* Personalized Study Roadmap */}
                {report.improvementPlan && report.improvementPlan.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="p-8 rounded-[2rem] bg-[#0F1322]/80 border border-white/10 shadow-lg space-y-6"
                    >
                        <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
                            <Brain className="w-6 h-6" /> Personalized Study Plan & Roadmap
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {report.improvementPlan.map((plan, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                        {plan.topic}
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-light">{plan.description}</p>
                                    {plan.resources && plan.resources.length > 0 && (
                                        <div className="pt-2">
                                            <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Recommended Resources:</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {plan.resources.map((resItem, resIdx) => (
                                                    <span key={resIdx} className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                                                        {resItem}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

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
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${score}%` }} 
                transition={{ duration: 1, ease: "easeOut" }} 
                className={`h-full ${color} rounded-full`} 
            />
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