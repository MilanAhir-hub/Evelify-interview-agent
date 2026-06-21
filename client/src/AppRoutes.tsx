import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import InterviewPage from "./pages/InterviewPage";
import History from "./pages/History";
import AptitudeTest from "./pages/AptitudeTest";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "auth", element: <Auth /> },
      { path: "interview", element: <InterviewPage /> },
      { path: "history", element: <History /> },
      { path: "aptitude", element: <AptitudeTest /> },
    ]
  }
]);