import React, { useState } from 'react';
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

interface InterviewSetupProps {
    onStart: (data: {
        role: string;
        experience: string;
        type: string;
        resume: File | null;
    }) => void;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, resume: file }));
            // No automatic analysis here anymore
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Stage 1: Analyze Resume if not already analyzed and resume exists
        if (!analyzedData && formData.resume) {
            try {
                setIsAnalyzing(true);
                const data = await interviewApi.analyzeResume(formData.resume);

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
            return;
        }

        // Stage 2: Start Interview
        try {
            setIsAnalyzing(true);
            const generateData = await interviewApi.generateQuestions({
                role: formData.role,
                experience: formData.experience,
                projects: analyzedData?.projects || [],
                skills: analyzedData?.skills || []
            });

            if (generateData.success) {
                onStart({ ...formData, sessionId: generateData.sessionId });
            }
        } catch (error: any) {
            console.error("Failed to generate questions:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetResume = () => {
        setFormData(prev => ({ ...prev, resume: null }));
        setAnalyzedData(null);
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-700">

                {/* Left Side: Information */}
                <div className="w-full md:w-1/2 p-8 md:p-16 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent flex flex-col justify-center relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold tracking-wide uppercase">
                            <Sparkles className="w-4 h-4 mr-2" />
                            AI-Powered Preparation
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1]">
                                Start Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-gradient">Interview</span>
                            </h1>
                            <div className="h-1.5 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                        </div>

                        <div className="space-y-6 text-gray-400 text-lg md:text-xl font-light leading-relaxed">
                            <p>Master your interviewing skills with our state-of-the-art AI agent tailored for your specific career path.</p>
                            <p>Experience real-time feedback, behavioral analysis, and industry-standard technical evaluation.</p>
                        </div>

                        <div className="space-y-4 pt-10">
                            {[
                                { icon: <Target className="w-5 h-5" />, text: "Choose Role and Experience", desc: "Tailored questions for your target position" },
                                { icon: <Mic className="w-5 h-5" />, text: "Smart Voice Interview", desc: "Natural conversation with AI voice synthesis" },
                                { icon: <BarChart3 className="w-5 h-5" />, text: "Performance Analytics", desc: "Detailed breakdown of your strengths and gaps" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 transition-all duration-300 cursor-default group">
                                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mr-5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{item.text}</h3>
                                        <p className="text-gray-500 text-sm md:text-base leading-snug">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Setup Form */}
                <div className="w-full md:w-1/2 p-8 md:p-16 bg-white/5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10">
                    <div className="max-w-md mx-auto w-full space-y-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/20">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                Setup Details
                            </h2>
                            <p className="text-gray-500 ml-14">Configure your interview parameters below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">Job Role</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        placeholder="e.g. Full Stack Developer"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Experience Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">Years of Experience</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        placeholder="e.g. 3 years"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Interview Format Dropdown */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">Interview Format</label>
                                <div className="relative group">
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4.5 px-5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-300 appearance-none cursor-pointer"
                                    >
                                        <option value="Technical Interview" className="bg-gray-900 text-white">Technical Interview</option>
                                        <option value="HR Interview" className="bg-gray-900 text-white">HR Interview</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-indigo-400 transition-colors">
                                        <ChevronRight className="w-5 h-5 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* File Upload OR Analysis Results */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-wider">
                                    {analyzedData ? "Analysis Results" : "Resume (PDF Only)"}
                                </label>

                                {analyzedData ? (
                                    <div className="w-full bg-white/5 border border-indigo-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center text-indigo-400">
                                                <FileText className="w-4 h-4 mr-2" />
                                                <span className="text-sm font-medium truncate max-w-[200px]">{formData.resume?.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={resetResume}
                                                className="text-xs text-gray-500 hover:text-white transition-colors underline underline-offset-4"
                                            >
                                                Change Resume
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1.5">Top Projects</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analyzedData.projects.map((project, i) => (
                                                        <span key={i} className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                                                            {project}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1.5">Key Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analyzedData.skills.map((skill, i) => (
                                                        <span key={i} className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center w-full h-36 bg-white/5 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${isAnalyzing ? 'border-indigo-500/50 bg-indigo-500/5 cursor-wait' : 'border-white/10 hover:bg-white/10 hover:border-indigo-500/40'}`}>
                                        <div className="flex flex-col items-center justify-center py-6">
                                            <div className={`p-3 rounded-full mb-3 transition-all duration-300 ${isAnalyzing ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20'}`}>
                                                {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                                            </div>
                                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors text-center px-4 font-medium">
                                                {isAnalyzing ? "AI is analyzing your resume..." : formData.resume ? (
                                                    <span className="text-indigo-400 flex items-center">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        {formData.resume.name}
                                                    </span>
                                                ) : "Drop your resume here or click to browse"}
                                            </p>
                                            {!isAnalyzing && <p className="text-xs text-gray-600 mt-1 uppercase tracking-tighter">PDF up to 10MB</p>}
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isAnalyzing || (!analyzedData && !formData.resume)}
                                className={`w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[100%_0] text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-500 transform flex items-center justify-center text-xl mt-8 ${isAnalyzing || (!analyzedData && !formData.resume) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-[0.98]'}`}
                            >
                                {isAnalyzing ? "Processing..." : analyzedData ? "Start Interview" : "Submit Resume"}
                                {!isAnalyzing && <ChevronRight className="w-6 h-6 ml-2" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewSetup;