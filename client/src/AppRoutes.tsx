import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import InterviewPage from "./pages/InterviewPage";
import History from "./pages/History";

// server_url has been moved to src/config.ts to avoid circular dependencies

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/history" element={<History />} />
        </Routes>
    )
}


export default AppRoutes;