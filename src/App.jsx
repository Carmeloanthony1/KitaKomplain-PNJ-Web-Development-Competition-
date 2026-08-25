import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ReportProblem from "./pages/ReportProblem";
import History from "./pages/History";
import Notification from "./components/Notification";
import Search_page from "./pages/Search_page";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

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
    if(saved_theme === "dark"){
      document.documentElement.classList.add("add");
    } else {
      document.documentElement.classList.remove("remove");
    }
  }, []);
  
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />
      
      <Route 
        path="/search"
        element={<Search_page/>}
      />
      
      <Route
        path="/home"
        element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={user ? <Profile user={user} /> : <Navigate to="/login" />}
      />
      
      <Route
        path="/settings"
        element={user ? <Settings user={user} /> : <Navigate to="/login" />}
      />

      <Route
        path="/SignUp"
        element={<SignUp />}
      /> 

      <Route
        path="/History"
         element={user ? <History user={user} /> : <Navigate to="/login" />}
      />

      {/*
      <Route
        path="/Notification"
         element={user ? <Notification user={user} /> : <Navigate to="/login" />}
      />
      */}

      <Route
        path="/report"
         element={user ? <ReportProblem user={user} /> : <Navigate to="/login" />}
      />

      <Route
        path="/"
        element={<Navigate to={user ? "/home" : "/login"} />}
      />
    </Routes>
  );
}