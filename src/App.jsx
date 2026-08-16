import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar_Kiri from "./components/Sidebar_Kiri";

export default function App(){
  return (
    <div className="bg-[#f7f7f7] min-h-screen p-4">
      <Navbar/>
    </div>
  );  
}