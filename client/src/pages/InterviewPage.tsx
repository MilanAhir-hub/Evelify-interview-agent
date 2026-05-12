import { useState } from "react"
import Navbar from "../components/Navbar";
import InterviewSetup from "../components/InterviewSetup";
import Interview from "../components/Interview";
import InterviewReport from "../components/InterviewReport";

const InterviewPage = () =>{
    
    const [step, setStep] = useState(1);
    const [InterviewData, setInterviewData] = useState(null);

    return(
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
            <Navbar />
            <main className="relative">
                {/* Background Glows */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -z-10"></div>
                
                {step === 1 && (
                    <InterviewSetup onStart={(data) => {
                        setInterviewData(data);
                        setStep(2)}}
                    />
                )}
                {step === 2 && (
                    <Interview InterviewData={InterviewData} onFinish={(report) => {
                        setInterviewData(report);
                        setStep(3)}}
                    />
                )}
                {step === 3 && (
                    <InterviewReport sessionId={InterviewData?.sessionId} />
                )}
            </main>
        </div>
    )
}

export default InterviewPage