import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState } from "react";

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

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />
      <Route path="/signup" element={<Signup />} />
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
        path="/"
        element={<Navigate to={user ? "/home" : "/login"} />}
      />
    </Routes>
  );
}