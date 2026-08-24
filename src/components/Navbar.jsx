import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ openProfile, user}) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handle_Search = (e) => {
    e.preventDefault();
    if(search.trim()){
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
  <header className="w-full">
      <nav className="flex items-center justify-between w-full">
        {/* 1. Logo Brand */}
        <div 
          onClick={() => navigate('/home')}
          className="cursor-pointer transition hover:scale-105 active:scale-95"
        >
          <h1 className="ml-3 text-3xl font-black text-[#a50034] tracking-tight select-none">
            KitaKomplain
          </h1>
        </div>
        
        {/* 2. Search Bar Tengah */}
        <form 
          onSubmit={handle_Search}
          className="flex items-center gap-2 bg-white border-2 border-[#a50034] rounded-full px-4 py-1.5 w-full max-w-md shadow-sm focus-within:ring-2 focus-within:ring-[#a50034]/50"
        >
          <input 
            type="text" 
            placeholder="Cari komplain..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-transparent text-black placeholder-[#a50034]/60 text-center font-medium focus:outline-none px-2"
          />
          <button type="submit" aria-label="Search" className="focus:outline-none">
            <svg 
              className="w-5 h-5 fill-[#a50034] flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 640 640"
            >
              <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
            </svg>
          </button>
        </form>

        {/* 3. Profile Akun Kanan */}
        <div 
          onClick={openProfile ? openProfile : () => navigate('/profile')}
          className="flex items-center gap-3 bg-[#a50034] text-white px-5 py-2 rounded-full font-bold shadow-md cursor-pointer hover:bg-[#801427] transition active:scale-95 select-none"
        >
          {/* Menggunakan data dari props user kalau ada */}
          <span className="text-lg capitalize">{user?.name || "kenji"}</span>
          <img 
            src={user?.avatar || "/assets/Dummy_photo.png"} 
            alt="avatar" 
            className="w-8 h-8 rounded-full bg-white object-cover border border-white"
          />
        </div>
      </nav>
    </header>
  );  
}