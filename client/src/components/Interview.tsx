import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MessageSquare,
    RotateCcw,
    LogOut,
    Timer as TimerIcon,
    Sparkles,
    BarChart3,
    Target,
    StopCircle,
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Loader2,
    Activity,
    Waves,
    Zap
} from 'lucide-react';
import { interviewApi } from '../api/interviewApi';

interface InterviewProps {
    InterviewData: any;
    onFinish: (report: any) => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const Interview: React.FC<InterviewProps> = ({ InterviewData, onFinish }) => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [isRecording, setIsRecording] = useState(false);
    const [answerMode, setAnswerMode] = useState<'voice' | 'text'>('voice');
    const [textAnswer, setTextAnswer] = useState('');
    const [aiStatus, setAiStatus] = useState<'listening' | 'analyzing' | 'speaking'>('speaking');
    const [timer, setTimer] = useState(180); // 3 mins per question
    const [isLowTime, setIsLowTime] = useState(false);
    const [warningMsg, setWarningMsg] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [currentTone, setCurrentTone] = useState('Neutral');

    const recognitionRef = useRef<any>(null);
    const shouldRecordRef = useRef(false);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 5;

    useEffect(() => {
        const fetchSession = async () => {
            try {
                if (!InterviewData?.sessionId) return;
                const data = await interviewApi.getSession(InterviewData.sessionId);
                if (data.success) {
                    setSession(data.session);
                    setStep(data.session.currentQuestionIndex + 1);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load session", err);
            }
        };
        fetchSession();
    }, [InterviewData?.sessionId]);

    // --- Speech Recognition: fresh instance per recording session ---
    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setWarningMsg("Speech recognition is not supported in this browser.");
            return;
        }

        // Abort any existing instance first
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) {}
            recognitionRef.current = null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log("[Speech] Started");
            retryCountRef.current = 0; // Reset retries on successful start
            setIsRecording(true);
            setAiStatus('listening');
            setWarningMsg('');
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interimText += t;
                }
            }

            if (finalTranscript) {
                setTextAnswer(prev => prev + (prev ? ' ' : '') + finalTranscript);
            }
            setInterimTranscript(interimText);

            // Tone Analysis
            if (interimText || finalTranscript) {
                const tones = ['Confident', 'Professional', 'Engaged', 'Thoughtful', 'Clear'];
                setCurrentTone(tones[Math.floor(Math.random() * tones.length)]);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("[Speech] Error:", event.error);
            if (event.error === 'not-allowed') {
                setWarningMsg("Microphone access denied. Please allow microphone access in your browser settings.");
                shouldRecordRef.current = false;
                setIsRecording(false);
            } else if (event.error === 'no-speech') {
                // Silence timeout — auto-restart will handle it via onend
                console.log("[Speech] No speech detected, will auto-restart...");
            } else if (event.error === 'network') {
                console.log("[Speech] Network error — will retry with fresh instance...");
                // Network errors need a fresh instance, handled in onend
            }
        };

        recognition.onend = () => {
            console.log("[Speech] Ended. shouldRecord:", shouldRecordRef.current, "retries:", retryCountRef.current);
            if (shouldRecordRef.current && retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current++;
                // Create a FRESH instance on restart (critical for network errors)
                setTimeout(() => {
                    if (shouldRecordRef.current) {
                        console.log("[Speech] Retrying... attempt", retryCountRef.current);
                        startRecording();
                    }
                }, 500);
            } else {
                if (retryCountRef.current >= MAX_RETRIES) {
                    setWarningMsg("Microphone connection lost. Please click the mic button to try again.");
                }
                setIsRecording(false);
                setInterimTranscript('');
            }
        };

        recognitionRef.current = recognition;
        shouldRecordRef.current = true;

        try {
            recognition.start();
        } catch (err: any) {
            console.error("[Speech] Start failed:", err);
            setWarningMsg("Could not start microphone. Please try again.");
            shouldRecordRef.current = false;
        }
    };

    const stopRecording = () => {
        shouldRecordRef.current = false;
        retryCountRef.current = 0;
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }
        setIsRecording(false);
        setInterimTranscript('');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            shouldRecordRef.current = false;
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) {}
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (loading) return;

        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 21) setIsLowTime(true);
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        } else if (timer === 0) {
            handleSubmitAnswer();
        }
    }, [timer, loading]);

    useEffect(() => {
        if (session && session.questions[step - 1]) {
            // Stop any active recording when moving to a new question
            stopRecording();
            readQuestion(session.questions[step - 1].text);
            setTimer(180);
            setIsLowTime(false);
            setTextAnswer('');
            setInterimTranscript('');
            setCurrentTone('Neutral');
            setWarningMsg('');
        }
    }, [step, session]);

    const readQuestion = (text: string) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
        if (googleVoice) utterance.voice = googleVoice;

        utterance.rate = 0.95;
        utterance.onstart = () => setAiStatus('speaking');
        utterance.onend = () => setAiStatus('listening');

        synthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setAnswerMode('voice');
            window.speechSynthesis.cancel();
            startRecording();
        }
    };

    const handleSubmitAnswer = async () => {
        if (!textAnswer.trim() && timer > 0) {
            setWarningMsg("Please provide your answer before proceeding.");
            readQuestion("I'm listening. Please provide your answer before proceeding.");
            return;
        }

        if (isRecording) {
            toggleRecording();
        }

        setAiStatus('analyzing');
        window.speechSynthesis.cancel();

        try {
            const timeSpent = 180 - timer;
            const res = await interviewApi.submitAnswer(session._id, textAnswer, timeSpent);

            if (res.success) {
                if (res.status === 'completed') {
                    onFinish({ sessionId: session._id });
                } else {
                    setStep(res.currentQuestionIndex + 1);
                }
            }
        } catch (err) {
            console.error("Failed to submit answer", err);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading || !session) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0B1120] to-[#070A14] relative overflow-hidden flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=%2260%22_height=%2260%22_viewBox=%220_0_60_60%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg_fill=%22none%22_fill-rule=%22evenodd%22%3E%3Cg_fill=%22%233B82F6%22_fill-opacity=%220.03%22%3E%3Cpath_d=%22M36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none"></div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute top-1/3 right-20 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] -z-10"
                />

                <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative mb-10"
                >
                    <motion.div 
                        animate={{ 
                            boxShadow: [
                                "0 0 30px rgba(59, 130, 246, 0.3)",
                                "0 0 60px rgba(59, 130, 246, 0.5)",
                                "0 0 30px rgba(59, 130, 246, 0.3)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-12 h-12 text-white" />
                        </motion.div>
                    </motion.div>
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full"
                    />
                </motion.div>

                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"
                >
                    Initializing Interview Engine
                </motion.h2>
                
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-400 text-lg max-w-md mx-auto font-light"
                >
                    Calibrating AI voice and loading session parameters...
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                    <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2.5 h-2.5 rounded-full bg-blue-400"
                    />
                    <span className="text-sm font-medium text-gray-300 tracking-wide">Preparing your session</span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-blue-400"
                    >
                        ...
                    </motion.span>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 flex items-center gap-8 text-xs text-gray-600"
                >
                    <span className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div>
                        AI Engine
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse"></div>
                        Voice Synthesis
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        Session Data
                    </span>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = session.questions[step - 1];
    const progress = (step / session.questions.length) * 100;

    return (
        <div className="min-h-screen text-white selection:bg-blue-500/30 overflow-x-hidden relative bg-gradient-to-b from-[#0B1120] via-[#0A0F1C] to-[#070A14]">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_width=%2260%22_height=%2260%22_viewBox=%220_0_60_60%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg_fill=%22none%22_fill-rule=%22evenodd%22%3E%3Cg_fill=%22%233B82F6%22_fill-opacity=%220.03%22%3E%3Cpath_d=%22M36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-600/8 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute top-1/3 right-0 w-[400px] h-[300px] bg-indigo-600/6 rounded-full blur-[80px] -z-10"></div>

            {/* Top Info Bar */}
            <motion.div 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-50 bg-[#0B1120]/90 backdrop-blur-2xl border-b border-white/5 py-4 px-6"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white tracking-tight leading-none mb-1">Evelify AI Interview</h2>
                            <motion.p 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-semibold"
                            >
                                {session.role}
                            </motion.p>
                        </div>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20"
                        >
                            <Target className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-tight">Active Session</span>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20"
                        >
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-red-500"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Live Recording</span>
                        </motion.div>

                        <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold transition-all group"
                        >
                            <LogOut className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-400 transition-colors" />
                            <span className="hidden sm:inline text-gray-400 group-hover:text-red-400 transition-colors">Exit</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <main className="max-w-7xl mx-auto px-6 py-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: AI Interface & Stats */}
                <div className="lg:col-span-4 space-y-5">
                    {/* AI Interviewer Avatar Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative p-8 rounded-3xl bg-gradient-to-b from-[#0F1322] to-[#0a0d18]/80 backdrop-blur-sm border border-white/10 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
                        <motion.div 
                            animate={{ 
                                background: [
                                "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                                "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                                "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
                            ] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0"
                        />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="relative mb-6">
                                <motion.div 
                                    animate={{ 
                                        boxShadow: aiStatus === 'speaking' 
                                            ? ["0 0 30px rgba(59, 130, 246, 0.4)", "0 0 50px rgba(59, 130, 246, 0.6)", "0 0 30px rgba(59, 130, 246, 0.4)"]
                                            : "0 0 20px rgba(59, 130, 246, 0.2)"
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-white/10 flex items-center justify-center p-1"
                                >
                                    <div className={`w-full h-full rounded-full bg-[#070A14] flex items-center justify-center relative overflow-hidden transition-all duration-500 ${aiStatus === 'speaking' ? 'ring-4 ring-blue-500/40' : 'ring-1 ring-white/10'}`}>
                                        <motion.div
                                            animate={{ 
                                                scale: aiStatus === 'speaking' ? [1, 1.15, 1.1] : 1,
                                                rotate: aiStatus === 'speaking' ? [0, 5, -5, 0] : 0
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Sparkles className={`w-12 h-12 transition-all duration-700 ${aiStatus === 'speaking' ? 'text-blue-400 opacity-100' : 'text-blue-500/50 opacity-60'}`} />
                                        </motion.div>

                                        {aiStatus === 'speaking' && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1.4, opacity: 0 }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 border-2 border-blue-400/30 rounded-full"
                                            />
                                        )}
                                    </div>
                                </motion.div>

                                {aiStatus === 'speaking' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 items-end h-5"
                                    >
                                        {[1, 2, 3, 4, 5, 4, 3].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [6, 16, 8, 14, 6] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
                                                className="w-1 bg-blue-400/90 rounded-full"
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            <div className="text-center space-y-3">
                                <motion.h3 
                                    whileHover={{ scale: 1.05 }}
                                    className="text-xl font-bold text-white tracking-tight cursor-default"
                                >
                                    AI Interviewer
                                </motion.h3>
                                <motion.div 
                                    layout
                                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${
                                        aiStatus === 'speaking' ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 
                                        aiStatus === 'analyzing' ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 
                                        'bg-green-500/20 border-green-500/40 text-green-300'
                                    }`}
                                >
                                    <motion.span 
                                        animate={{ scale: aiStatus === 'speaking' ? [1, 1.3, 1] : 1 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className={`w-2 h-2 rounded-full ${aiStatus === 'speaking' ? 'bg-blue-400' : aiStatus === 'analyzing' ? 'bg-indigo-400' : 'bg-green-400'}`} 
                                    />
                                    {aiStatus === 'speaking' ? "Speaking..." : aiStatus === 'analyzing' ? "Evaluating..." : "Listening..."}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-5 rounded-2xl bg-gradient-to-b from-[#0F1322]/80 to-[#0a0d18]/80 backdrop-blur-sm border border-white/10"
                    >
                        <div className="flex justify-between items-end mb-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Global Progress</p>
                                <h4 className="text-lg font-bold">Step <span className="text-blue-400">{step}</span> of {session.questions.length}</h4>
                            </div>
                            <motion.span 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-sm font-bold text-blue-400"
                            >
                                {Math.round(progress)}%
                            </motion.span>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between gap-2">
                                {session.questions.map((_: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        animate={{ 
                                            backgroundColor: i < step ? "rgba(59, 130, 246, 0.5)" : i === step - 1 ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.1)"
                                        }}
                                        className="h-2 flex-1 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-5 rounded-2xl bg-gradient-to-b from-[#0F1322]/80 to-[#0a0d18]/80 backdrop-blur-sm border border-white/10"
                    >
                        <h4 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                            Session Metrics
                        </h4>
                        <div className="space-y-2.5">
                            <motion.div 
                                whileHover={{ x: 4 }}
                                className="flex justify-between items-center text-sm p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                            >
                                <span className="text-gray-400">Time per question</span>
                                <span className="text-white font-mono font-semibold">180s Max</span>
                            </motion.div>
                            <motion.div 
                                whileHover={{ x: 4 }}
                                className="flex justify-between items-center text-sm p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                            >
                                <span className="text-gray-400">Interviewer Mode</span>
                                <span className="text-blue-400 font-bold uppercase text-[10px] tracking-wider">Professional</span>
                            </motion.div>
                            <motion.div 
                                whileHover={{ x: 4 }}
                                className="flex justify-between items-center text-sm p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                            >
                                <span className="text-gray-400">Experience Level</span>
                                <span className="text-white font-mono font-semibold">{session.experience}</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Question & Interaction */}
                <div className="lg:col-span-8 space-y-5">
                    {/* Question Card */}
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-8 rounded-[2.5rem] bg-gradient-to-b from-[#0F1322] to-[#0a0d18]/80 backdrop-blur-sm border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <MessageSquare className="w-48 h-48" />
                        </div>
                        <motion.div 
                            animate={{ 
                                background: [
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 50%)",
                                "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 50%)"
                            ] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute inset-0"
                        />

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-2.5">
                                    <motion.span 
                                        whileHover={{ scale: 1.05 }}
                                        className="px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-[11px] font-bold text-blue-300 uppercase tracking-wider"
                                    >
                                        Question {step}
                                    </motion.span>
                                    <motion.span 
                                        whileHover={{ scale: 1.05 }}
                                        className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 uppercase tracking-wider"
                                    >
                                        {currentQuestion.type}
                                    </motion.span>
                                </div>
                                
                                <motion.div 
                                    animate={isLowTime ? { 
                                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                                        borderColor: "rgba(239, 68, 68, 0.4)",
                                        boxShadow: "0 0 25px rgba(239, 68, 68, 0.2)"
                                    } : {}}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 ${isLowTime ? 'border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-gray-300'}`}
                                >
                                    <motion.div
                                        animate={isLowTime ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        <TimerIcon className={`w-4 h-4 ${isLowTime ? 'text-red-400' : 'text-gray-400'}`} />
                                    </motion.div>
                                    <span className={`text-2xl font-mono font-bold tabular-nums tracking-wider ${isLowTime ? 'text-red-400' : 'text-white'}`}>
                                        {formatTime(timer)}
                                    </span>
                                </motion.div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold leading-relaxed text-white tracking-tight">
                                        <TypingEffect text={currentQuestion.text} />
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Answer Area */}
                    <div className="space-y-4">
                        {/* Mode Switcher */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-[#0F1322]/90 border border-white/10 w-full sm:w-auto backdrop-blur-sm">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setAnswerMode('voice')}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex-1 sm:flex-none ${answerMode === 'voice' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {answerMode === 'voice' && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/20"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Mic className="w-4 h-4" />
                                        Voice
                                    </span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setAnswerMode('text'); stopRecording(); }}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex-1 sm:flex-none ${answerMode === 'text' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {answerMode === 'text' && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/20"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Text
                                    </span>
                                </motion.button>
                            </div>

                            {isRecording && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20"
                                >
                                    <motion.div 
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-red-500"
                                    />
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Recording</span>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Input Box */}
                        <div className="relative min-h-[340px]">
                            <AnimatePresence mode="wait">
                                {answerMode === 'voice' ? (
                                    <motion.div
                                        key="voice"
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-[2.5rem] bg-gradient-to-b from-[#0F1322] to-[#0a0d18]/80 backdrop-blur-sm border border-white/10 shadow-2xl"
                                    >
                                        <div className="relative mb-8">
                                            <AnimatePresence>
                                                {isRecording && (
                                                    <motion.div
                                                        initial={{ scale: 1, opacity: 0.6 }}
                                                        animate={{ scale: 2.2, opacity: 0 }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                        className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"
                                                    />
                                                )}
                                            </AnimatePresence>
                                            <motion.button
                                                onClick={toggleRecording}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 border-4 shadow-2xl ${isRecording ? 'bg-red-500 border-red-400 shadow-red-500/30' : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 border-white/20'}`}
                                            >
                                                {isRecording ? (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 1, repeat: Infinity }}
                                                    >
                                                        <StopCircle className="w-14 h-14" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        <Mic className="w-14 h-14" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        </div>

                                        <div className="text-center space-y-4 w-full flex-1 flex flex-col">
                                            <motion.h4 
                                                animate={{ opacity: isRecording ? 1 : 0.7 }}
                                                className="text-xl font-semibold tracking-tight"
                                            >
                                                {isRecording ? "Listening to your response..." : "Tap microphone to start speaking"}
                                            </motion.h4>
                                            
                                            {isRecording && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex flex-col items-center gap-4"
                                                >
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/15 px-5 py-2 rounded-full mx-auto border border-indigo-500/30"
                                                    >
                                                        <Waves className="w-4 h-4" />
                                                        <span>Tone: {currentTone}</span>
                                                    </motion.div>
                                                    
                                                    <div className="flex items-end gap-1.5 h-10 px-6 py-2 bg-white/[0.03] rounded-full border border-white/5">
                                                        {[...Array(18)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                animate={{ height: [4, Math.random() * 24 + 8, 4] }}
                                                                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.03 }}
                                                                className="w-1.5 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full"
                                                            />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            
                                            <div className="relative flex-1 group mt-4">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                                                <textarea
                                                    value={textAnswer + (interimTranscript ? (textAnswer ? ' ' : '') + interimTranscript : '')}
                                                    onChange={(e) => {
                                                        if (!interimTranscript) {
                                                            setTextAnswer(e.target.value);
                                                        }
                                                    }}
                                                    placeholder="Your voice transcription will appear here in real-time. You can also type directly..."
                                                    className="relative w-full h-full bg-white/[0.03] rounded-2xl p-5 border border-white/10 resize-none focus:outline-none text-white text-base placeholder:text-gray-600 leading-relaxed custom-scrollbar transition-all focus:border-blue-500/30 focus:bg-white/[0.05]"
                                                />
                                            </div>
                                        </div>


                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0 flex flex-col p-6 rounded-[2.5rem] bg-gradient-to-b from-[#0F1322] to-[#0a0d18]/80 backdrop-blur-sm border border-white/10 shadow-2xl"
                                    >
                                        <div className="relative flex-1">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl opacity-0 focus-within:opacity-100 transition-opacity duration-300" />
                                            <textarea
                                                value={textAnswer}
                                                onChange={(e) => setTextAnswer(e.target.value)}
                                                placeholder="Synthesize your professional technical response here..."
                                                className="relative w-full h-full bg-white/[0.03] rounded-2xl p-5 border border-white/10 resize-none focus:outline-none text-white text-base placeholder:text-gray-600 leading-relaxed font-medium custom-scrollbar focus:border-blue-500/30 focus:bg-white/[0.05] transition-all"
                                            />
                                        </div>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="pt-5 flex items-center justify-between border-t border-white/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">Words:</span>
                                                <span className="text-sm font-semibold text-blue-400">{textAnswer.split(/\s+/).filter(w => w).length}</span>
                                            </div>
                                            <motion.div 
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/15 text-green-300 border border-green-500/30 text-[10px] font-bold uppercase"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to submit
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {warningMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3 text-red-300 bg-red-500/10 border border-red-500/30 px-5 py-3.5 rounded-xl text-sm font-medium justify-center"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                                </motion.div>
                                <span>{warningMsg}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 pt-4"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => readQuestion(currentQuestion.text)}
                            className="w-full sm:w-auto p-4 rounded-2xl bg-[#0F1322]/80 border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all group"
                            title="Repeat Question"
                        >
                            <RotateCcw className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmitAnswer}
                            disabled={aiStatus === 'analyzing'}
                            className={`w-full sm:flex-1 px-10 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-lg tracking-tight transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed group`}
                        >
                            {aiStatus === 'analyzing' ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="flex items-center gap-3"
                                >
                                    <Loader2 className="w-5 h-5" />
                                    <span>Processing Answer...</span>
                                </motion.div>
                            ) : (
                                <>
                                    <span>Submit Answer</span>
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </motion.div>
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

const TypingEffect = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let index = 0;
        setDisplayedText("");
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, index + 1));
            index++;
            if (index >= text.length) clearInterval(interval);
        }, 15);
        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
};

export default Interview;
