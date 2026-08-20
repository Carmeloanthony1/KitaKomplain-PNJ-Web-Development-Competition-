import { useState } from "react";
import Navbar from '../components/Navbar';

export default function Settings({ user, onNavigate }) {
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

      <div className="flex flex-row flex-1 pt-24">
        {/* Sidebar Navigation */}
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "permission" && (
            <div className="max-w-3xl flex flex-col gap-6">  
              <div>
                <h1 className="text-3xl font-black text-[#a50034] mb-2">Permission Settings</h1>
                <p className="text-gray-600 font-medium">Mengelola akses fitur dan perangkat untuk kelancaran pembuatan laporan.</p>
              </div>

              {/* Container Kartu Permission */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border-2 border-[#a50034] shadow-sm">
                
                {/* 1. Location */}
                <div className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-[#a50034]">Location</h3>
                    <p className="text-sm text-gray-500">Mendeteksi lokasi kejadian komplain secara otomatis.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a50034]"></div>
                  </label>
                </div>

                {/* 2. Camera & Media */}
                <div className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-[#a50034]">Camera & Gallery</h3>
                    <p className="text-sm text-gray-500">Mengambil foto langsung atau mengunggah gambar bukti komplain.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a50034]"></div>
                  </label>
                </div>

                {/* 3. Notifications */}
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-[#a50034]">Browser Notifications</h3>
                    <p className="text-sm text-gray-500">Menerima peringatan langsung saat ada pembaruan status laporan.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a50034]"></div>
                  </label>
                </div>

              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <h1 className="text-3xl font-black text-[#a50034] mb-4">Appearance Settings</h1>
              <p className="text-gray-600 font-medium">Ubah tema visual dan gaya tampilan aplikasi.</p>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h1 className="text-3xl font-black text-[#a50034] mb-4">Privacy Settings</h1>
              <p className="text-gray-600 font-medium">Kelola visibilitas profil dan mode anonim.</p>
            </div>
          )}

          {activeTab === "notification" && (
            <div>
              <h1 className="text-3xl font-black text-[#a50034] mb-4">Notification Settings</h1>
              <p className="text-gray-600 font-medium">Atur notifikasi push dan email yang ingin kamu terima.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}