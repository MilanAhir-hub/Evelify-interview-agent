import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MessageSquare,
    SkipForward,
    RotateCcw,
    LogOut,
    Timer as TimerIcon,
    Sparkles,
    BarChart3,
    ShieldCheck,
    Target,
    StopCircle,
    CheckCircle2,
    ChevronRight,
    AlertCircle
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

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTextAnswer(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
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
            readQuestion(session.questions[step - 1].text);
            setTimer(180);
            setIsLowTime(false);
            setTextAnswer('');
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
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setAnswerMode('voice');
            recognitionRef.current?.start();
            setIsRecording(true);
            window.speechSynthesis.cancel();
            setAiStatus('listening');
            setWarningMsg('');
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
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <Loader className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }

    const currentQuestion = session.questions[step - 1];
    const progress = (step / session.questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <header className="sticky top-0 z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <span className="font-bold italic text-white">E</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Evelify</span>
                        </div>
                        <div className="h-6 w-px bg-white/10 hidden sm:block" />
                        <div className="hidden sm:flex flex-col">
                            <h2 className="text-sm font-semibold text-white truncate max-w-[200px]">Technical Mock Interview</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{session.role}</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Target className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-tight">AI Generated Session</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden xs:flex items-center gap-2 mr-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-red-400">Live Recording</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-xs font-semibold transition-all group">
                            <LogOut className="w-3.5 h-3.5 group-hover:text-red-400" />
                            <span className="hidden sm:inline">Exit Interview</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50" />
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center p-2">
                                    <div className={`w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden transition-transform duration-500 shadow-inner ${aiStatus === 'speaking' ? 'scale-105 ring-4 ring-blue-500/20' : 'scale-100'}`}>
                                        <Sparkles className={`w-12 h-12 text-blue-400 transition-all duration-700 ${aiStatus === 'speaking' ? 'opacity-100 scale-110 rotate-12' : 'opacity-40'}`} />

                                        {aiStatus === 'speaking' && (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1.5, opacity: 0 }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
                                                />
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 2, opacity: 0 }}
                                                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                                    className="absolute inset-0 border-2 border-purple-500/20 rounded-full"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {aiStatus === 'speaking' && (
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-end h-6">
                                        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [8, 24, 12, 20, 8] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-1 bg-blue-400/60 rounded-full"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white tracking-tight">AI Interviewer</h3>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status:</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${aiStatus === 'speaking' ? 'text-blue-400' : 'text-purple-400'}`}>
                                        {aiStatus === 'speaking' ? (
                                            <>Speaking <span className="flex gap-0.5"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></span></>
                                        ) : aiStatus === 'analyzing' ? (
                                            <>Evaluating Response <Loader className="w-3 h-3 animate-spin" /></>
                                        ) : (
                                            <>Listening for Answer</>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {warningMsg && (
                                <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 px-4 py-2 rounded-xl text-xs font-semibold">
                                    <AlertCircle className="w-4 h-4" />
                                    {warningMsg}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-400" />
                                Resume Summary
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold uppercase tracking-widest">Extracted</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Top Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {session.skills.slice(0, 5).map((skill: string, i: number) => (
                                        <motion.span
                                            key={i}
                                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-gray-300 transition-colors"
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Experience Level</p>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '65%' }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium tracking-tight">{session.experience}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 shadow-xl">
                        <div className="flex justify-between items-end mb-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Live Progress</p>
                                <h4 className="text-lg font-bold">Question {step} of {session.questions.length}</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-blue-400 tracking-tighter">{Math.round(progress)}% Complete</span>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full"
                            />
                        </div>

                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {session.questions.map((_: any, i: number) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i < step ? 'bg-blue-500/60' : i === step - 1 ? 'bg-white/20 animate-pulse' : 'bg-white/5'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">

                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 md:p-12 rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                            <MessageSquare className="w-32 h-32" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    Question {step}
                                </span>
                                <span className="px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-400 uppercase tracking-widest">
                                    {currentQuestion.type}
                                </span>
                                <div className="ml-auto flex items-center gap-2 text-gray-500">
                                    <TimerIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">Est. Duration: 3 Min</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl md:text-4xl font-bold leading-[1.2] text-white/95">
                                    <TypingEffect text={currentQuestion.text} />
                                </h3>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <div className="flex flex-col xs:flex-row items-center justify-between gap-4 px-2">
                            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-full xs:w-auto">
                                <button
                                    onClick={() => setAnswerMode('voice')}
                                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex-1 xs:flex-none ${answerMode === 'voice' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Mic className="w-4 h-4" />
                                    Voice Answer
                                </button>
                                <button
                                    onClick={() => { setAnswerMode('text'); setIsRecording(false); recognitionRef.current?.stop(); }}
                                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex-1 xs:flex-none ${answerMode === 'text' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Text Mode
                                </button>
                            </div>

                            <div className={`flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-white/5 border transition-all duration-500 w-full xs:w-auto justify-center ${isLowTime ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse' : 'border-white/10'}`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${isLowTime ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                                <span className={`text-2xl font-black tracking-widest tabular-nums ${isLowTime ? 'text-red-400' : 'text-white'}`}>
                                    {formatTime(timer)}
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Remaining</span>
                            </div>
                        </div>

                        <div className="relative min-h-[380px]">
                            <AnimatePresence mode="wait">
                                {answerMode === 'voice' ? (
                                    <motion.div
                                        key="voice"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-[3.5rem] bg-white/5 border border-white/10 shadow-inner"
                                    >
                                        <div className="relative mb-8">
                                            <AnimatePresence>
                                                {isRecording && (
                                                    <>
                                                        <motion.div
                                                            initial={{ scale: 1, opacity: 0.5 }}
                                                            animate={{ scale: 2.2, opacity: 0 }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="absolute inset-0 bg-blue-500/20 rounded-full"
                                                        />
                                                        <motion.div
                                                            initial={{ scale: 1, opacity: 0.5 }}
                                                            animate={{ scale: 2.8, opacity: 0 }}
                                                            transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                                                            className="absolute inset-0 bg-blue-400/10 rounded-full"
                                                        />
                                                    </>
                                                )}
                                            </AnimatePresence>
                                            <button
                                                onClick={toggleRecording}
                                                className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-700 relative z-10 border-[6px] ${isRecording ? 'bg-red-500 border-red-400/30 shadow-[0_0_60px_rgba(239,68,68,0.5)] scale-105' : 'bg-gradient-to-tr from-blue-600 via-blue-500 to-purple-600 border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:scale-105'}`}
                                            >
                                                {isRecording ? <StopCircle className="w-14 h-14" /> : <Mic className="w-14 h-14" />}
                                            </button>
                                        </div>

                                        <div className="text-center space-y-4 mb-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
                                                {isRecording ? "Input Detected" : "Microphone Ready"}
                                            </div>
                                            <h4 className="text-xl font-bold tracking-tight text-white">
                                                {isRecording ? "Listening to response..." : "Click to start recording"}
                                            </h4>
                                        </div>

                                        <textarea
                                            value={textAnswer}
                                            onChange={(e) => setTextAnswer(e.target.value)}
                                            placeholder="Your voice transcription will appear here. You can also type directly..."
                                            className="w-full flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 resize-none focus:outline-none text-white text-sm placeholder:text-gray-600 leading-[1.6] custom-scrollbar"
                                        />

                                        {isRecording && (
                                            <div className="absolute bottom-8 flex items-end gap-1.5 h-10">
                                                {[...Array(32)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: [4, Math.random() * 30 + 10, 4] }}
                                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.04 }}
                                                        className="w-1.5 bg-blue-500/40 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="absolute inset-0 flex flex-col p-8 rounded-[3.5rem] bg-white/5 border border-white/10 shadow-inner"
                                    >
                                        <textarea
                                            value={textAnswer}
                                            onChange={(e) => setTextAnswer(e.target.value)}
                                            placeholder="Synthesize your technical response here. Focus on clarity, accuracy, and providing real-world context..."
                                            className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-white text-xl placeholder:text-gray-800 leading-[1.6] font-light custom-scrollbar"
                                        />
                                        <div className="pt-6 mt-6 flex items-center justify-between border-t border-white/5">
                                            <div className="flex gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Metrics</span>
                                                    <span className="text-sm font-bold tracking-tight">{textAnswer.split(/\s+/).filter(w => w).length} Words</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-green-500/10 border border-green-500/20 shadow-lg shadow-green-500/5">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                <span className="text-[10px] font-black text-green-100 uppercase tracking-[0.2em]">Grammar Quality: Prime</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => readQuestion(currentQuestion.text)}
                                className="flex-1 sm:flex-none p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all group shadow-xl"
                            >
                                <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
                            </button>
                        </div>

                        <button
                            onClick={handleSubmitAnswer}
                            className="w-full sm:flex-1 px-10 py-5 rounded-[1.5rem] bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] text-white font-black text-xl tracking-tight transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span>Submit Answer</span>
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
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

const Loader = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default Interview;
