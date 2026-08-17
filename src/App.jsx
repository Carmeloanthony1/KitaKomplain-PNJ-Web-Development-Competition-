import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar_Kiri from "./components/Sidebar_Kiri";

export default function App(){
  return (
    <div className="bg-[#f7f7f7] min-h-screen p-4">
      <Navbar/>
      <div className="flex flex-1 px-8 py-4 gap-6 w-full">
        <aside className="w-1/5 flex-shrink-0">
          <Sidebar_Kiri/>
        </aside>
      </div>
    </div>
  );  
}