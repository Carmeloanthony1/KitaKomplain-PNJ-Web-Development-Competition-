import { useState } from "react";
export default function Navbar(){
  const [search, setSearch] = useState("");
  
  return (
    <div className="flex justify-between items-center py-6 px-10 w-full">
      <h1 className="text-4xl font-extrabold text-[#a50034] tracking-tight cursor-pointer">KitaKomplain</h1>
      <div className="flex items-center gap-2 bg-white border-2 border[#a50034] rounded-full px-4 py-1.5 w-full max-w-md shadow-sm mx-6">
        <input 
          type="text" placeholder="search" value={search}
          onChange={(e) => setSearch(e.taget.value)} 
          className="w-full bg-transparent text-black placeholder-[#9E1B32]/60 text-center ml-8 font-medium focus:outline-none px-2"
        />
        <svg className = "w-5 h-5 fill-[#951B32] flex-shrink-0 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
        </svg>
      </div>
      <div className="flex items-center gap-2 bg-[#9E1B32] text-white px-5 py-2 rounded-full font-bold shadow-md cursor-poitner hover:bg-[#801427] transition">
        <span className="text-xl p-1">Dummyprofile</span>
        <img src = "/assets/Dummy_photo.jpeg" alt="avatar" className="w-7 h-7 rounded-full bg-white"/>
      </div>
    </div>
  );  
}