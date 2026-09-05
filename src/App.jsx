import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import PublicProfile from "./components/public_profile";
import Settings from "./pages/Settings";
import ReportProblem from "./pages/ReportProblem";
import History from "./components/History";
import Status from "./components/Status";
import Notification from "./components/Notification";
import Search_page from "./pages/Search_page";
import VotePage from "./components/Vote";
import AdminDashboard from "./pages/Admin_Dashboard";
import ProtectedRoute from "./components/Protected_Route";
import { StatusProvider } from "./components/StatusContext";
import { ConfirmProvider } from "./components/ConfirmContext";
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";

// Helper Komponen: Auto Reset Scroll & Unlock Body tiap kali pindah halaman/route
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Maksa scroll balik ke paling atas
    window.scrollTo(0, 0);
    
    // MAKSA UNLOCK SCROLLBODY (Pembersih sisa-sisa overflow modal yang nyangkut)
    document.body.style.overflow = "unset";
    document.body.style.position = "static";
    document.documentElement.style.overflow = "unset";
  }, [pathname]);

  return null;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  const handleNavigate = (page) => {
    if (page === "profile") navigate("/profile");
    else if (page === "home") navigate("/home");
    else if (page === "settings") navigate("/settings");
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
    localStorage.removeItem("user_id");
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
        {/* Pasang ScrollToTop di sini biar selalu running tiap navigasi */}
        <ScrollToTop />
        
        <Routes>
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/search"
            element={<Search_page user={user} onNavigate={handleNavigate} />}
          />
          <Route
            path="/home"
            element={<Home user={user} onLogout={handleLogout} onNavigate={handleNavigate} />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
          />
          <Route 
            path="/user/:id"
            element={<PublicProfile />}
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
            path="/vote/:postId"
            element={<VotePage />} 
          />
          <Route
            path="/report"
            element={user ? <ReportProblem user={user} onNavigate={handleNavigate} /> : <Navigate to="/login" />}
          />

          {/* RUTE KHUSUS ADMIN PANEL */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route
            path="/"
            element={<Navigate to="/home" />}
          />
        </Routes>
      </ConfirmProvider>
    </StatusProvider>
  );
}