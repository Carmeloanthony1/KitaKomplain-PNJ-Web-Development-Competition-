import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { useState } from "react";


export default function App() {
  // Biar pas baru pertama masuk langsung nampil Halaman Login:
  const [currentpage, setCurrentpage] = useState(() => {
    return localStorage.getItem("currentpage") || "login"; //localstrage client nyimpen curremtpage biar ga ke refresh
  }); 
  const [user, setUser] = useState(() => {
    const saved_user = localStorage.getItem("user");
    return saved_user ? JSON.parse(saved_user) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentpage('home'); // Pindah ke home setelah login sukses
  };

  const navigateTo = (page) => {
    setCurrentpage(page);
    localStorage.setItem("currentpage", page);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentpage");
    setUser(null);
    setCurrentpage("login");
  };

  //conditional rendering, tergantung nanti sama if nya kemana
  if (currentpage === 'signup') {
    return <Signup switchToLogin={() => navigateTo('login')}/>;
  }

  if (currentpage === 'home') {
    return (
      <Home 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={navigateTo}
      />
    );
  }

  if (currentpage === 'profile'){
    return <Profile user={user} onNavigate={navigateTo}/>;
  }

  return (
    <Login
      switchToSignup={() => navigateTo('signup')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}