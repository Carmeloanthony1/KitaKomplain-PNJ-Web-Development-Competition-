import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar_Kiri from "./components/Sidebar_Kiri";

export default function App(){
  return (
    <div className="bg-[#f7f7f7] min-h-screen p-2 flex flex-col">
      <div className="flex flex-1 px-8 py-4 gap-6 w-full">
        <aside className="w-64 flex-shrink-0">
          <Sidebar_Kiri/>
        </aside>
        <main className="flex-1 flex flex-col gap-4">
          <Navbar/>
        </main>
      </div>
    </div>
  );  
}