import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import InterviewPage from "./pages/InterviewPage";

export const server_url = "http://localhost:5000";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/interview" element={<InterviewPage />} />
        </Routes>
    )
}


export default AppRoutes;