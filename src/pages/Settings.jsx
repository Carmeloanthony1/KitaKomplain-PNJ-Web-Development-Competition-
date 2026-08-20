import { useState } from "react";
import Navbar from '../components/Navbar';

export default function Settings({ user, onNavigate }) {
  // State untuk melacak tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState("permission");

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">    
      {/* Header Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f7f7] border-b border-gray-200 px-8 py-3">
        <Navbar 
          user={user} 
          openProfile={() => onNavigate && onNavigate("profile")} 
          onNavigate={onNavigate} 
        />
      </header>

      {/* Wrapper Utama: Dikasih 'flex flex-row' biar Sidebar & Konten berdampingan */}
      <div className="flex flex-row flex-1 pt-24">
        {/* Sidebar Kiri */}
        <aside className="flex flex-col px-8 gap-3 w-fit border-r-4 border-[#a50034] min-h-[calc(100vh-6rem)]">
          <div 
            onClick={() => onNavigate && onNavigate("home")}
            className="flex flex-row items-center gap-3 cursor-pointer hover:opacity-80 transition w-fit"
          >
            <svg className="w-10 h-10 fill-[#a50034]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M41.4 342.6C28.9 330.1 28.9 309.8 41.4 297.3L169.4 169.3C178.6 160.1 192.3 157.4 204.3 162.4C216.3 167.4 224 179.1 224 192L224 256L560 256C586.5 256 608 277.5 608 304L608 336C608 362.5 586.5 384 560 384L224 384L224 448C224 460.9 216.2 472.6 204.2 477.6C192.2 482.6 178.5 479.8 169.3 470.7L41.3 342.7z"/>
            </svg>
            <h2 className="text-2xl text-[#a50034] font-bold">Back</h2>
          </div>

          {/* Menu Tab Navigasi */}
          <div className="flex flex-col gap-8 mt-6">
            <span 
              onClick={() => setActiveTab("permission")}
              className={`text-2xl font-bold cursor-pointer transition ${
                activeTab === "permission" ? "text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"
              }`}
            >
              Permission
            </span>
            <span 
              onClick={() => setActiveTab("appearance")}
              className={`text-2xl font-bold cursor-pointer transition ${
                activeTab === "appearance" ? "text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"
              }`}
            >
              Appearance
            </span>
            <span 
              onClick={() => setActiveTab("privacy")}
              className={`text-2xl font-bold cursor-pointer transition ${
                activeTab === "privacy" ? "text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"
              }`}
            >
              Privacy
            </span>
            <span 
              onClick={() => setActiveTab("notification")}
              className={`text-2xl font-bold cursor-pointer transition ${
                activeTab === "notification" ? "text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"
              }`}
            >
              Notification
            </span>
          </div>
        </aside>

        {/* Konten Kanan (Samping Sidebar) */}
        <main className="flex-1 p-8">
          {activeTab === "permission" && (
            <div>
              <h1 className="text-3xl font-black text-gray-800 mb-4">Permission Settings</h1>
              <p className="text-gray-600">Atur izin akses akun dan aplikasi kamu di sini.</p>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <h1 className="text-3xl font-black text-gray-800 mb-4">Appearance Settings</h1>
              <p className="text-gray-600">Ubah tema visual dan gaya tampilan aplikasi.</p>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h1 className="text-3xl font-black text-gray-800 mb-4">Privacy Settings</h1>
              <p className="text-gray-600">Kelola visibilitas profil dan mode anonim.</p>
            </div>
          )}

          {activeTab === "notification" && (
            <div>
              <h1 className="text-3xl font-black text-gray-800 mb-4">Notification Settings</h1>
              <p className="text-gray-600">Atur notifikasi push dan email yang ingin kamu terima.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}