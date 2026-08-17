import { useState } from "react";
import Sidebar_Kiri from "./components/Sidebar_Kiri";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="bg-[#f7f7f7] min-h-screen px-8 py-4">
      <div className="flex gap-8 justify-between items-start">
        <Sidebar_Kiri />
        <div className="flex-1 flex flex-col gap-6">
          <Navbar />
          <div className="flex gap-8 justify-between items-start pt-4">
          </div>
        </div>
      </div>
    </div>
  );
}