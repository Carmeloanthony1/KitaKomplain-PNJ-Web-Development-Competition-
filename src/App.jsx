import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { useState } from "react";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Jika user sudah login -> default selalu ke 'home' saat refresh
  // Jika belum login -> default ke 'login'
  const [currentpage, setCurrentpage] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? "home" : "login";
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentpage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentpage("login");
  };

  // Conditional Rendering
  if (currentpage === "signup") {
    return <Signup switchToLogin={() => setCurrentpage("login")} />;
  }

  if (currentpage === "home") {
    return (
      <Home 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={(page) => setCurrentpage(page)} 
      />
    );
  }

  if (currentpage === "profile") {
    return (
      <Profile 
        user={user} 
        onNavigate={(page) => setCurrentpage(page)} 
      />
    );
  }

  return (
    <Login
      switchToSignup={() => setCurrentpage("signup")}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}