import { useState } from "react"
import InterviewSetup from "../components/InterviewSetup";
import Interview from "../components/Interview";
import InterviewReport from "../components/InterviewReport";

const InterviewPage = () =>{
    
    const [step, setStep] = useState(1);
    const [InterviewData, setInterviewData] = useState(null);

    return(
        <div>
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
                <InterviewReport />
            )}
        </div>
    )
}

export default InterviewPage