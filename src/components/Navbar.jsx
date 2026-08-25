import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Navbar({ openProfile, user, openNotifications }) {
  const [search_params] = useSearchParams();
  const navigate = useNavigate();

  const quert_tag = search_params.get("tag") || "";
  const [search_term, setSearch_term] = useState(quert_tag);

  useEffect(() => {
    setSearch_term(quert_tag);
  }, [quert_tag]);

  // Real-time Search dengan Debounce (100ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const clean_keyword = search_term.replace("#", "").trim().toLowerCase(); 
      if (clean_keyword !== "") {
        if (clean_keyword !== quert_tag) {
          navigate(`/search?tag=${clean_keyword}`, { replace: true });
        }
      } else {
        if (quert_tag !== "") {
          navigate(`/search`, { replace: true });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [search_term, navigate, quert_tag]);

  // Handler Submit Form
  const handleSearch = (e) => {
    if (e) e.preventDefault();
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-xs">
      <nav className="w-full px-6 md:px-10 py-4 grid grid-cols-12 items-center">
        
        {/* 1. Logo Kiri */}
        <div 
          onClick={() => navigate('/home')}
          className="col-span-3 cursor-pointer transition hover:scale-105 active:scale-95 justify-self-start"
        >
          <h1 className="text-3xl font-black text-[#a50034] tracking-tight select-none">
            KitaKomplain
          </h1>
        </div>
        
        {/* 2. Search Bar Tengah */}
        <div className="col-span-6 flex justify-center w-full">
          <form 
            onSubmit={handleSearch}
            className="flex items-center gap-3 bg-white border-2 border-[#a50034] rounded-full px-5 py-2.5 w-full max-w-lg shadow-xs focus-within:ring-2 focus-within:ring-[#a50034]/50"
          >
            <input 
              type="text" 
              placeholder="Cari topik" 
              value={search_term}
              onChange={(e) => setSearch_term(e.target.value)} 
              className="w-full bg-transparent text-black placeholder-[#a50034]/60 text-center font-semibold focus:outline-none text-base"
            />
            <button 
              type="submit" 
              aria-label="Search" 
              className="focus:outline-none"
            >
              <svg 
                className="w-5 h-5 fill-[#a50034] flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 640 640"
              >
                <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* 3. Profile Akun Kanan */}
        <div className="col-span-3 justify-self-end">
          <div 
            onClick={() => openProfile ? openProfile() : navigate('/profile')}
            className="flex items-center gap-3 bg-[#a50034] text-white px-5 py-2 rounded-full font-bold shadow-md cursor-pointer hover:bg-[#801427] transition active:scale-95 select-none"
          >
            <span className="text-base capitalize">{user?.name || user?.username || "Kenji"}</span>
            <img 
              src={user?.avatar || user?.avatar_url || "/assets/Dummy_photo.png"} 
              alt="avatar" 
              className="w-8 h-8 rounded-full bg-white object-cover border-2 border-white"
            />
          </div>
        </div>

      </nav>
    </div>
  );  
}