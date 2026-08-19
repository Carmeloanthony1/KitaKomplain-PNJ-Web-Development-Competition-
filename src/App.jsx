import Sidebar_Kiri from "./components/Sidebar_Kiri";
import Navbar from "./components/Navbar";
import Most_Polling from "./components/Most_Polling";
import Post from "./components/Post";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import { useState } from "react";

export default function App() {
  const [currentpage, setCurrentpage] = useState('home');

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f7f7] border-b border-gray-200 px-8 py-3">
        {/* Pass props openSignup ke Navbar */}
        <Navbar openSignup={() => setCurrentpage('signup')} />
      </header>

      <div className="flex flex-1 pt-14 px-8 gap-8 w-full justify-between items-start">
        <aside className="w-64 flex-shrink-0 sticky top-24">
          <Sidebar_Kiri />
        </aside>

        <main className="flex-1 max-w-2xl mx-auto">
          {/*Conditional rendering*/}
          {currentpage === 'signup' && (
            <Signup switchToLogin={() => setCurrentpage('login')} />
          )}
          {currentpage === 'login' && (
            <Login switchToSignup={() => setCurrentpage('signup')} />
          )}
          {currentpage === 'home' && (
            <Post />
          )}
        </main>

        <aside className="w-[400px] flex-shrink-0 sticky top-24">
          <Most_Polling />
        </aside>
      </div>
    </div>
  );
}