import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ReportProblem from "./pages/ReportProblem";
import History from "./pages/History";
import Status from "./components/Status";
import Notification from "./components/Notification";
import Search_page from "./pages/Search_page";
import VotePage from "./components/Vote";
import { StatusProvider } from "./components/StatusContext";
import { ConfirmProvider } from "./components/ConfirmContext";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";



export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  // Helper fungsi untuk navigasi yang bisa dipanggil dari mana saja
  const handleNavigate = (page) => {
    if (page === "profile") navigate("/profile");
    else if (page === "home") navigate("/home");
    else if (page === "settings") navigate("/settings");
    else if (page === "history") navigate("/history");
    else if (page === "report") navigate("/report");
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate("/home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const saved_theme = localStorage.getItem("theme");
    if (saved_theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <StatusProvider>
      <ConfirmProvider>

          <Routes>
            <Route
              path="/login"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/search"
              element={user ? <Search_page user={user} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
            />

            <Route
              path="/home"
              element={user ? <Home user={user} onLogout={handleLogout} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
            />

            <Route
              path="/profile"
              element={user ? <Profile user={user} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
            />

            <Route
              path="/settings"
              element={user ? <Settings user={user} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
            />

            <Route
              path="/SignUp"
              element={<SignUp />}
            />

            <Route
              path="/settings"
              element={user ? <Settings user={user} /> : <Navigate to="/login" />}
            />

            <Route
              path="/vote/:postId"
              element={<VotePage />} />
            <Route
              path="/History"
              element={user ? <History user={user} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
            />

            <Route
              path="/report"
              element={user ? <ReportProblem user={user} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
            />

            <Route
              path="/"
              element={<Navigate to={user ? "/home" : "/login"} />}
            />
          </Routes>
        </ConfirmProvider>

    </StatusProvider>

        );
}