import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { useState } from "react";


export default function App() {
  // Biar pas baru pertama masuk langsung nampil Halaman Login:
  const [currentpage, setCurrentpage] = useState('login'); 
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentpage('home'); // Pindah ke home setelah login sukses
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentpage('login'); // Kembali ke login pas logout
  };

  if (currentpage === 'signup') {
    return <Signup switchToLogin={() => setCurrentpage('login')}/>;
  }

  if (currentpage === 'home') {
    return (
      <Home 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={(page) => setCurrentpage(page)} 
      />
    );
  }

  return (
    <Login
      switchToSignup={() => setCurrentpage('signup')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}