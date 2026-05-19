import React, { useState, useRef } from 'react';
import {
    Briefcase,
    User,
    Mic,
    BarChart3,
    Upload,
    FileText,
    ChevronRight,
    Target,
    Sparkles,
    Loader2
} from 'lucide-react';
import { interviewApi } from '../api/interviewApi';
import PricingModal from './ui/PricingModal';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';

interface InterviewSetupProps {
    onStart: (data: {
        role: string;
        experience: string;
        type: string;
        resume: File | null;
        sessionId?: string;
    }) => void;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart }) => {
    const dispatch = useDispatch();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [isPricingOpen, setIsPricingOpen] = useState(false);
    const [analyzedData, setAnalyzedData] = useState<{
        projects: string[];
        skills: string[];
    } | null>(null);

    const [formData, setFormData] = useState({
        role: '',
        experience: '',
        type: 'Technical Interview',
        resume: null as File | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const analyzeFile = async (file: File) => {
        try {
            setIsAnalyzing(true);
            const data = await interviewApi.analyzeResume(file);

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    role: data.role || prev.role,
                    experience: data.experience || prev.experience
                }));
                setAnalyzedData({
                    projects: data.projects || [],
                    skills: data.skills || []
                });
            }
        } catch (error) {
            console.error("Failed to analyze resume:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, resume: file }));
            analyzeFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsAnalyzing(true);
            const generateData = await interviewApi.generateQuestions({
                role: formData.role,
                experience: formData.experience,
                projects: analyzedData?.projects || [],
                skills: analyzedData?.skills || []
            });

            if (generateData.success) {
                // Update credits in Redux
                if (generateData.user) {
                    dispatch(setUser(generateData.user));
                }
                onStart({ ...formData, sessionId: generateData.sessionId });
            }

        } catch (error: any) {
            console.error("Failed to generate questions:", error);
            if (error.response?.status === 402) {
                setIsPricingOpen(true);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetResume = () => {
        setFormData(prev => ({ ...prev, resume: null }));
        setAnalyzedData(null);
    };

    return (
        <div className="flex items-center justify-center p-4 md:p-8 relative">
            <div className="w-full max-w-6xl flex flex-col md:flex-row bg-[#0F1322]/80 backdrop-blur-sm border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-700 relative z-10">
                {/* Left Side: Information */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 flex flex-col justify-center relative border-r border-white/5">
                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-black uppercase tracking-[0.2em]">
                            <Sparkles className="w-3.5 h-3.5 mr-2" />
                            Premium AI Agent
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                                Start Your <br />
                                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Mock Interview</span>
                            </h1>
                            <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                        </div>

                        <div className="space-y-5 text-gray-400 text-base leading-relaxed">
                            <p>Master your interviewing skills with our state-of-the-art AI agent tailored for your specific career path.</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            {[
                                { icon: <Target className="w-4 h-4" />, text: "Choose Role and Experience", desc: "Tailored questions for your target position" },
                                { icon: <Mic className="w-4 h-4" />, text: "Smart Voice Interview", desc: "Natural conversation with AI voice synthesis" },
                                { icon: <BarChart3 className="w-4 h-4" />, text: "Performance Analytics", desc: "Detailed breakdown of your strengths and gaps" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
                                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 mr-4 group-hover:bg-blue-500/20 transition-all">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm md:text-base tracking-tight">{item.text}</h3>
                                        <p className="text-gray-500 text-xs md:text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Setup Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 bg-[#0F1322]/40 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full space-y-8">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <span>Setup Details</span>
                            </h2>
                            <p className="text-gray-500 text-xs font-mono ml-14 uppercase tracking-widest font-semibold">Configure Session</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Step 1: Resume Upload (Primary) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">
                                    {analyzedData ? "AI Analysis Completed" : "Step 1: Upload Resume (Recommended)"}
                                </label>

                                {analyzedData ? (
                                    <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center text-blue-400 text-xs font-mono">
                                                <FileText className="w-5 h-5 mr-3" />
                                                <span className="truncate max-w-[200px] font-bold">{formData.resume?.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={resetResume}
                                                className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest border border-white/5 hover:border-white/20"
                                            >
                                                Change
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Detected Role</p>
                                                <p className="text-sm font-bold text-white truncate">{formData.role}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Experience</p>
                                                <p className="text-sm font-bold text-white truncate">{formData.experience}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2 border-t border-white/5">
                                            <div>
                                                <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Key Skills Identified</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {analyzedData.skills.slice(0, 8).map((skill, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/20 text-blue-300 text-[10px] font-mono">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center w-full h-40 bg-white/5 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${isAnalyzing ? 'border-blue-500/40 bg-blue-500/5 cursor-wait' : 'border-white/10 hover:bg-white/10 hover:border-blue-500/40'}`}>
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <div className={`p-4 rounded-2xl mb-3 transition-all duration-300 ${isAnalyzing ? 'bg-blue-500/20 text-blue-400 animate-spin' : 'bg-blue-500/10 text-blue-400 group-hover:scale-110'}`}>
                                                {isAnalyzing ? <Loader2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                                            </div>
                                            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors text-center px-4 font-bold uppercase tracking-widest">
                                                {isAnalyzing ? "AI is decoding your profile..." : "Drop Resume or Click to Upload"}
                                            </p>
                                            <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-tighter">PDF Format Only • Max 5MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            disabled={isAnalyzing}
                                        />
                                    </label>
                                )}
                            </div>

                            {!analyzedData && !isAnalyzing && (
                                <div className="relative py-4 flex items-center">
                                    <div className="flex-grow border-t border-white/5"></div>
                                    <span className="flex-shrink mx-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">OR ENTER MANUALLY</span>
                                    <div className="flex-grow border-t border-white/5"></div>
                                </div>
                            )}

                            {/* Manual Inputs - Only visible if no resume or as fallback */}
                            {(!analyzedData || isAnalyzing) ? (
                                !isAnalyzing && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Target Job Role</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="role"
                                                    required={!formData.resume}
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Senior Frontend Developer"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Experience Level</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="experience"
                                                    required={!formData.resume}
                                                    value={formData.experience}
                                                    onChange={handleChange}
                                                    placeholder="e.g. 5+ Years"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : null}


                            {/* Step 2: Interview Format */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">Step 2: Interview Format</label>
                                <div className="relative group">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all shadow-inner"
                                    >
                                        <option value="Technical Interview" className="bg-[#0F1322] text-white">Technical Interview</option>
                                        <option value="HR Interview" className="bg-[#0F1322] text-white">HR Interview</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-blue-400 transition-colors">
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                            </div>


                            {/* Submit Button */}

                            <button
                                type="submit"
                                disabled={isAnalyzing || (!analyzedData && !formData.resume && !formData.role)}
                                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all duration-300 flex items-center justify-center text-base tracking-tight ${
                                    isAnalyzing || (!analyzedData && !formData.resume && !formData.role) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-blue-600/40 active:scale-[0.98]'
                                }`}
                            >
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{formData.resume && !analyzedData ? "Analyzing Resume..." : "Synthesizing Session..."}</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Initiate Interview Session</span>
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
        </div>
    );
};

export default InterviewSetup;