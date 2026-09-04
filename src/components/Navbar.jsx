import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Navbar({ user, openNotifications }) {
  const [search_params] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const quert_tag = search_params.get("tag") || "";
  const [search_term, setSearch_term] = useState(quert_tag);

  const [isDark, setIsDark] = useState(false);

  const toggle_darkmode = () => {
    const isdark = document.documentElement.classList.toggle('dark');
    if(isdark){
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    if(localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.toggle('dark');
      setIsDark(true);
    };
  }, []);

  useEffect(() => {
    setSearch_term(quert_tag);
  }, [quert_tag]);

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

  useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(length, length);
    }
  }, [search_term, quert_tag]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
  };

  return (
    <div className="w-full bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-slate-800 shadow-xs transition-colors">
      <nav className="relative w-full px-3 sm:px-6 md:px-10 py-2.5 sm:py-3 flex items-center justify-between">
        
        {/* Logo Kiri */}
        <div 
          onClick={() => navigate('/home')}
          className="cursor-pointer transition hover:scale-105 active:scale-95 flex-shrink-0 z-10"
        >
          <h1 className="flex flex-col sm:flex-row text-[11px] sm:text-xl md:text-2xl lg:text-3xl font-black text-[#a50034] dark:text-[#f1ece1] tracking-tight leading-none sm:leading-normal select-none">
            <span>Kita</span>
            <span>Komplain</span>
          </h1>
        </div>
        
        {/* Search Bar Tengah - pointer-events-none di container luar biar gak nge-block scroll */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[170px] sm:w-xs md:w-md lg:w-lg z-0 pointer-events-none">
          <form 
            onSubmit={handleSearch}
            className="relative flex items-center bg-white border border-[#a50034] sm:border-2 dark:border-[#f1ece1] dark:bg-black rounded-full px-3 sm:px-5 py-1 sm:py-2 w-full shadow-xs pointer-events-auto"
          >
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Cari topik" 
              value={search_term}
              onChange={(e) => setSearch_term(e.target.value)} 
              className="w-full bg-transparent text-black placeholder-[#a50034]/60 dark:placeholder-[#f1ece1] dark:text-[#f1ece1] text-center font-semibold focus:outline-none text-[11px] sm:text-base pr-4 sm:pr-6"
            />
            <button 
              type="submit" 
              aria-label="Search" 
              className="absolute right-2.5 sm:right-4 focus:outline-none flex-shrink-0"
            >
              <svg 
                className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-[#a50034] dark:fill-[#f1ece1] cursor-pointer hover:scale-110 transition-transform" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 640 640"
              >
                <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Profile Akun Kanan */}
        <div className="flex-shrink-0 z-10">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 sm:gap-3 bg-[#a50034] dark:bg-black dark:border-2 dark:border-[#f1ece1] text-white px-2 sm:px-5 py-1 sm:py-2 rounded-full font-bold shadow-md cursor-pointer hover:bg-[#801427] dark:hover:bg-[#f1ece1] dark:hover:text-black transition active:scale-95 select-none"
          >
            <span className="hidden sm:inline text-xs sm:text-base capitalize">
              {user?.name || user?.username || "Kenji"}
            </span>
            <img 
              src={user?.avatar || user?.avatar_url || "/assets/Dummy_photo.png"} 
              alt="avatar" 
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white object-cover border sm:border-2 border-white dark:border-black flex-shrink-0"
            />
          </div>
        </div>

      </nav>
    </div>
  );  
}