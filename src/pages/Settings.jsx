import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';

export default function Settings({ user, onNavigate }) {
<<<<<<< HEAD
  // State untuk mengontrol Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fungsi untuk scroll halus ke ID section yang dituju
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

=======
  // State untuk melacak tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState("permission");
  const navigate = useNavigate();
>>>>>>> 1b74a39503ab32c695e948ad579c29363d68758e
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-[#292828] text-white" : "bg-[#f7f7f7] text-gray-800"}`}>    
      {/* Header Fixed */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b px-8 py-3 transition-colors duration-300 ${isDarkMode ? "bg-[#1e1e1e] border-gray-800" : "bg-[#f7f7f7] border-gray-200"}`}>
        <Navbar 
          user={user} 
          openProfile={() => onNavigate && onNavigate("profile")} 
          onNavigate={onNavigate} 
        />
      </header>

      <div className="flex flex-row flex-1 pt-24">
        {/* Sidebar Navigation Shortcut (Sticky) */}
        <aside className="sticky top-24 h-[calc(100vh-6rem)] flex flex-col px-8 gap-3 w-fit border-r-4 border-[#a50034]">
          <div 
<<<<<<< HEAD
            onClick={() => onNavigate && onNavigate("home")}
            className="flex flex-row items-center gap-3 cursor-pointer hover:opacity-80 transition w-fit mb-4"
=======
            onClick={() => navigate('/home')}
            className="flex flex-row items-center gap-3 cursor-pointer hover:opacity-80 transition w-fit"
>>>>>>> 1b74a39503ab32c695e948ad579c29363d68758e
          >
            <svg className={`w-10 h-10 transition-colors duration-300 ${isDarkMode ? "fill-[#f1ece1]" : "fill-[#a50034]"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M41.4 342.6C28.9 330.1 28.9 309.8 41.4 297.3L169.4 169.3C178.6 160.1 192.3 157.4 204.3 162.4C216.3 167.4 224 179.1 224 192L224 256L560 256C586.5 256 608 277.5 608 304L608 336C608 362.5 586.5 384 560 384L224 384L224 448C224 460.9 216.2 472.6 204.2 477.6C192.2 482.6 178.5 479.8 169.3 470.7L41.3 342.7z"/>
            </svg>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Back</h2>
          </div>

          {/* Menu Shortcut */}
          <div className="flex flex-col gap-6">
            <span 
              onClick={() => scrollToSection("permission-section")}
              className={`text-2xl font-bold cursor-pointer transition ${isDarkMode ? "text-[#f1ece1] hover:text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"}`}
            >
              Permission
            </span>
            <span 
              onClick={() => scrollToSection("appearance-section")}
              className={`text-2xl font-bold cursor-pointer transition ${isDarkMode ? "text-[#f1ece1] hover:text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"}`}
            >
              Appearance
            </span>
            <span 
              onClick={() => scrollToSection("privacy-section")}
              className={`text-2xl font-bold cursor-pointer transition ${isDarkMode ? "text-[#f1ece1] hover:text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"}`}
            >
              Privacy
            </span>
            <span 
              onClick={() => scrollToSection("notification-section")}
              className={`text-2xl font-bold cursor-pointer transition ${isDarkMode ? "text-[#f1ece1] hover:text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"}`}
            >
              Notification
            </span>
          </div>
        </aside>

        {/* Konten Utama */}
        <main className="flex-1 p-8 flex flex-col gap-16 pb-32">
          
          {/* SECTION 1: PERMISSION */}
          <section id="permission-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Permission Settings</h1>                
                <p className={isDarkMode ? "text-[#f1ece1]" : "text-gray-600"}>Mengelola akses fitur dan perangkat untuk kelancaran pembuatan laporan</p>
            </div>
            <div className={`flex flex-col gap-4 p-6 rounded-2xl shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e] border-2 border-[#f1ece1]" : "bg-white border-2 border-[#a50034]"}`}>
                <div className={`flex flex-row items-center justify-between pb-4 border-b ${isDarkMode ? "border-[#f1ece1]" : "border-gray-100"}`}>
                    <div className="flex flex-col">
                        <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Location</h3>
                        <p className={`text-sm ${isDarkMode ? "text-[#f1ece1]" : "text-gray-500"}`}>Mendeteksi lokasi kejadian komplain secara otomatis.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                    </label>
                </div>
                <div className={`flex flex-row items-center justify-between pb-4 border-b ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
                    <div className="flex flex-col">
                        <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Camera & Gallery</h3>
                        <p className={`text-sm ${isDarkMode ? "text-[#f1ece1]" : "text-gray-500"}`}>Mengambil foto langsung atau mengunggah gambar bukti komplain.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                    </label>
                </div>
            </div>
          </section>

          {/* SECTION 2: APPEARANCE */}
          <section id="appearance-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Appearance Settings</h1>
              <p className={isDarkMode ? "text-[#f1ece1]" : "text-gray-600"}>Ubah tema visual aplikasi.</p>
            </div>
            <div className={`flex flex-col gap-4 p-6 rounded-2xl shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e] border-2 border-[#f1ece1]" : "bg-white border-2 border-[#a50034]"}`}>
                <p className={`text-center text-2xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]" }`}>Pilihan Tema Visual</p>
                <div className="flex flex-row gap-6 items-center justify-center">
                    <span className={`text-xl font-bold transition-colors ${!isDarkMode ? "text-[#a50034]" : "text-[#f1ece1]"}`}>
                      Light Mode
                    </span>
                    
                    {/* Switcher Dark Mode */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={isDarkMode} 
                          onChange={(e) => setIsDarkMode(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                    </label>

                    <span className={`text-xl font-bold transition-colors ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>
                      Dark Mode
                    </span>
                </div>
            </div>
          </section>

          {/* SECTION 3: PRIVACY */}
          <section id="privacy-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Privacy Settings</h1>
              <p className={isDarkMode ? "text-[#f1ece1]" : "text-gray-600"}>Kelola visibilitas profil dan mode anonim.</p>
            </div>
            <div className={`p-6 rounded-2xl border-2 border-[#a50034] shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e]" : "bg-white"}`}>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Pengaturan anonimitas laporan...</p>
            </div>
          </section>

          {/* SECTION 4: NOTIFICATION */}
          <section id="notification-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Notification Settings</h1>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Atur notifikasi push dan email yang ingin kamu terima.</p>
            </div>
            <div className={`p-6 rounded-2xl border-2 border-[#a50034] shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e]" : "bg-white"}`}>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Pengaturan notifikasi email & push...</p>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}   