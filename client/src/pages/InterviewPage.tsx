import { useState } from "react"
import Navbar from "../components/Navbar";
import InterviewSetup from "../components/InterviewSetup";
import Interview from "../components/Interview";
import InterviewReport from "../components/InterviewReport";

const InterviewPage = () =>{
    
    const [step, setStep] = useState(1);
    const [InterviewData, setInterviewData] = useState<any>(null);

    return(
        <div className="min-h-screen bg-gradient-to-b from-[#0B1120] via-[#0A0F1C] to-[#070A14] text-white selection:bg-blue-500/30 relative">
            {/* Professional grid pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            {step !== 2 && <Navbar />}
            <main className={`relative ${step !== 2 ? 'pt-20' : ''}`}>
                {/* Background Glows */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -z-10"></div>
                
                {step === 1 && (
                    <div className="py-12">
                        <InterviewSetup onStart={(data) => {
                            setInterviewData(data);
                            setStep(2)}}
                        />
                    </div>
                )}
                {step === 2 && (
                    <Interview InterviewData={InterviewData} onFinish={(report) => {
                        setInterviewData(report);
                        setStep(3)}}
                    />
                )}
                {step === 3 && (
                    <div className="py-12">
                        <InterviewReport 
                            sessionId={InterviewData?.sessionId} 
                            onReset={() => setStep(1)}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}

export default InterviewPage