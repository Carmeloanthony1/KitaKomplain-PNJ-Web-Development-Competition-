import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
import Post from "../components/Post";
import Most_Polling from "../components/Most_Polling";

export default function Home({ user, onLogout, onNavigate}){
    const [post, setPost] = useState('');

    return (
        <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f7f7] border-b border-gray-200 px-8 py-3">
            <Navbar user = {user} openProfile={() => onNavigate && onNavigate('profile')}
            />
            </header>

            <div className="flex flex-1 pt-20 px-8 gap-8 w-full justify-between items-start">
            <aside className="min-w-xs flex-shrink-0 sticky top-24">
                <Sidebar_Kiri onNavigate={onNavigate} />
            </aside>

            <main className="flex-1 max-w-3xl mx-auto">
                <Post />
            </main>

            <aside className="w-[360px] flex-shrink-0 sticky top-24">
                <Most_Polling />
            </aside>
            </div>
        </div>
    )
}