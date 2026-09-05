import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useStatus } from "../components/StatusContext";

export default function Settings({ user, onNavigate }) {
  const { showStatus } = useStatus();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggle_dark_mode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navigate = useNavigate();
  const current_user_id = localStorage.getItem("user_id");

  const [permission, setPermission] = useState({
    Camera: false
  });

  const [privacy, setPrivacy] = useState({
    anonymousMode: false,
    hideHistory: false,
    hideComment: false,
    hideVote: false
  });

  useEffect(() => {
    const fetch_privacy_settings = async () => {
      if (!current_user_id) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("is_anonim_mode, hide_history, hide_comment, hide_vote")
          .eq("id", current_user_id)
          .maybeSingle();

        if (error) {
          console.warn("Gagal fetch privacy:", error.message);
          return;
        }

        if (data) {
          setPrivacy({
            anonymousMode: data.is_anonim_mode ?? false,
            hideHistory: data.hide_history ?? false,
            hideComment: data.hide_comment ?? false,
            hideVote: data.hide_vote ?? false
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching privacy:", err);
      }
    };

    fetch_privacy_settings();
  }, [current_user_id]);

  const handleTogglePrivacy = async (key, dbColumn) => {
    if (!current_user_id) {
      showStatus("Silakan login terlebih dahulu!", "error");
      return;
    }

    const newStatus = !privacy[key];
    setPrivacy((prev) => ({ ...prev, [key]: newStatus }));

    try {
      const { error } = await supabase
        .from("users")
        .update({ [dbColumn]: newStatus })
        .eq("id", current_user_id);

      if (error) {
        console.error(`Gagal update ${dbColumn}:`, error.message);
        showStatus(`Gagal memperbarui pengaturan!`, "error");
        setPrivacy((prev) => ({ ...prev, [key]: !newStatus }));
      }
    } catch (err) {
      console.error("Error updating privacy:", err);
      setPrivacy((prev) => ({ ...prev, [key]: !newStatus }));
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCamera = async (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setPermission((prev) => ({ ...prev, Camera: false }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermission((prev) => ({ ...prev, Camera: true }));
    } catch (error) {
      setPermission((prev) => ({ ...prev, Camera: false }));
      showStatus("Akses kamera ditolak! Izinkan kamera pada pengaturan browser.", "error");
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-[#1e1e1e] text-white" : "bg-[#f7f7f7] text-gray-800"}`}>
      
      {/* Top Header Khusus HP */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md border-b border-gray-200 dark:border-neutral-800">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sm font-bold text-[#a50034] dark:text-[#f1ece1] cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 640 640">
            <path d="M41.4 342.6C28.9 330.1 28.9 309.8 41.4 297.3L169.4 169.3C178.6 160.1 192.3 157.4 204.3 162.4C216.3 167.4 224 179.1 224 192L224 256L560 256C586.5 256 608 277.5 608 304L608 336C608 362.5 586.5 384 560 384L224 384L224 448C224 460.9 216.2 472.6 204.2 477.6C192.2 482.6 178.5 479.8 169.3 470.7L41.3 342.7z" />
          </svg>
          Kembali
        </button>
        <span className="text-base font-bold text-[#a50034] dark:text-[#f1ece1]">Settings</span>
        <div className="w-6"></div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 pt-4 md:pt-6">
        
        {/* Sidebar Navigation Shortcut (Desktop) */}
        <aside className="hidden md:flex sticky top-6 h-[calc(100vh-1.5rem)] flex-col px-6 lg:px-8 gap-3 w-fit border-r-2 lg:border-r-4 border-[#a50034] flex-shrink-0">
          <div
            onClick={() => navigate('/home')}
            className="flex flex-row items-center gap-3 cursor-pointer hover:opacity-80 transition w-fit mb-4"
          >
            <svg className={`w-8 h-8 lg:w-10 lg:h-10 transition-colors duration-300 ${isDarkMode ? "fill-[#f1ece1]" : "fill-[#a50034]"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M41.4 342.6C28.9 330.1 28.9 309.8 41.4 297.3L169.4 169.3C178.6 160.1 192.3 157.4 204.3 162.4C216.3 167.4 224 179.1 224 192L224 256L560 256C586.5 256 608 277.5 608 304L608 336C608 362.5 586.5 384 560 384L224 384L224 448C224 460.9 216.2 472.6 204.2 477.6C192.2 482.6 178.5 479.8 169.3 470.7L41.3 342.7z" />
            </svg>
            <h2 className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Back</h2>
          </div>

          <div className="flex flex-col gap-5">
            {["permission", "appearance", "privacy"].map((item) => (
              <span
                key={item}
                onClick={() => scrollToSection(`${item}-section`)}
                className={`text-xl lg:text-2xl font-bold capitalize cursor-pointer transition ${isDarkMode ? "text-[#f1ece1] hover:text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"}`}
              >
                {item}
              </span>
            ))}
          </div>
        </aside>

        {/* Shortcut Bar Mini Horizontal di Layar HP */}
        <div className="md:hidden flex items-center justify-around px-4 py-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#1a1a1a]">
          {["permission", "appearance", "privacy"].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(`${item}-section`)}
              className="text-xs font-bold capitalize text-gray-500 dark:text-gray-400 hover:text-[#a50034] dark:hover:text-[#f1ece1] py-1 px-2"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Konten Utama */}
        <main className="flex-1 px-4 sm:px-6 md:pl-8 md:pr-10 flex flex-col gap-8 md:gap-12 pb-20 pt-2 md:pt-0 max-w-4xl">

          {/* SECTION 1: PERMISSION */}
          <section id="permission-section" className="scroll-mt-24 md:scroll-mt-28 flex flex-col gap-3 md:gap-5 text-center md:text-left">
            <div>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Permission Settings</h1>
              <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-600"}`}>Mengelola akses fitur dan perangkat untuk kelancaran pembuatan laporan</p>
            </div>
            <div className={`flex flex-col gap-4 p-4 sm:p-6 rounded-2xl shadow-xs transition-colors ${isDarkMode ? "bg-[#252525] border border-neutral-800" : "bg-white border border-[#a50034]/30"}`}>
              <div className="flex flex-row items-center justify-between gap-3 text-left">
                <div className="flex flex-col pr-2">
                  <h3 className={`text-sm sm:text-base md:text-lg font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Camera & Gallery</h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-500"}`}>Mengambil foto langsung atau mengunggah gambar bukti komplain.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" onChange={handleCamera} checked={permission.Camera} className="sr-only peer" />
                  <div className="w-[46px] h-[24px] sm:w-[52px] sm:h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] sm:after:h-[24px] sm:after:w-[24px] after:transition-all peer-checked:after:translate-x-[22px] sm:peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>
            </div>
          </section>

          {/* SECTION 2: APPEARANCE */}
          <section id="appearance-section" className="scroll-mt-24 md:scroll-mt-28 flex flex-col gap-3 md:gap-5 text-center md:text-left">
            <div>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Appearance Settings</h1>
              <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-600"}`}>Ubah tema visual aplikasi.</p>
            </div>
            <div className={`flex flex-col gap-3 p-4 sm:p-6 rounded-2xl shadow-xs transition-colors ${isDarkMode ? "bg-[#252525] border border-neutral-800" : "bg-white border border-[#a50034]/30"}`}>
              <p className={`text-center text-sm sm:text-base md:text-lg font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Pilihan Tema Visual</p>
              <div className="flex flex-row gap-4 sm:gap-6 items-center justify-center">
                <span className={`text-xs sm:text-sm md:text-base font-bold transition-colors ${!isDarkMode ? "text-[#a50034]" : "text-[#f1ece1]"}`}>
                  Light Mode
                </span>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggle_dark_mode}
                    className="sr-only peer"
                  />
                  <div className="w-[46px] h-[24px] sm:w-[52px] sm:h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] sm:after:h-[24px] sm:after:w-[24px] after:transition-all peer-checked:after:translate-x-[22px] sm:peer-checked:after:translate-x-[24px]"></div>
                </label>

                <span className={`text-xs sm:text-sm md:text-base font-bold transition-colors ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>
                  Dark Mode
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 3: PRIVACY */}
          <section id="privacy-section" className="scroll-mt-24 md:scroll-mt-28 flex flex-col gap-3 md:gap-5 text-center md:text-left">
            <div>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Privacy Settings</h1>
              <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-600"}`}>Kelola kerahasiaan identitas dan visibilitas aktivitas laporan kamu.</p>
            </div>
            <div className={`flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl shadow-xs transition-colors ${isDarkMode ? "bg-[#252525] border border-neutral-800" : "bg-white border border-[#a50034]/30"}`}>

              {/* Mode Anonim */}
              <div className={`flex flex-row items-center justify-between gap-3 pb-3 sm:pb-4 border-b ${isDarkMode ? "border-neutral-800" : "border-gray-100"} text-left`}>
                <div className="flex flex-col pr-2">
                  <h3 className={`text-sm sm:text-base md:text-lg font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Mode Anonim (Default)</h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-500"}`}>Sembunyikan nama dan foto profil secara otomatis saat membuat laporan baru.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={privacy.anonymousMode}
                    onChange={() => handleTogglePrivacy("anonymousMode", "is_anonim_mode")}
                    className="sr-only peer"
                  />
                  <div className="w-[46px] h-[24px] sm:w-[52px] sm:h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] sm:after:h-[24px] sm:after:w-[24px] after:transition-all peer-checked:after:translate-x-[22px] sm:peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

              {/* Hide History Post */}
              <div className={`flex flex-row items-center justify-between gap-3 pb-3 sm:pb-4 border-b ${isDarkMode ? "border-neutral-800" : "border-gray-100"} text-left`}>
                <div className="flex flex-col pr-2">
                  <h3 className={`text-sm sm:text-base md:text-lg font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Sembunyikan Riwayat Laporan</h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-500"}`}>Jangan tampilkan laporan yang pernah kamu buat di profil publik.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={privacy.hideHistory}
                    onChange={() => handleTogglePrivacy("hideHistory", "hide_history")}
                    className="sr-only peer"
                  />
                  <div className="w-[46px] h-[24px] sm:w-[52px] sm:h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] sm:after:h-[24px] sm:after:w-[24px] after:transition-all peer-checked:after:translate-x-[22px] sm:peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

              {/* Hide History Comment */}
              <div className={`flex flex-row items-center justify-between gap-3 pb-3 sm:pb-4 border-b ${isDarkMode ? "border-neutral-800" : "border-gray-100"} text-left`}>
                <div className="flex flex-col pr-2">
                  <h3 className={`text-sm sm:text-base md:text-lg font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Sembunyikan Riwayat Comment</h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-500"}`}>Jangan tampilkan komentar yang pernah dibuat di profil publik.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={privacy.hideComment}
                    onChange={() => handleTogglePrivacy("hideComment", "hide_comment")}
                    className="sr-only peer"
                  />
                  <div className="w-[46px] h-[24px] sm:w-[52px] sm:h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] sm:after:h-[24px] sm:after:w-[24px] after:transition-all peer-checked:after:translate-x-[22px] sm:peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

              {/* Hide History Vote */}
              <div className="flex flex-row items-center justify-between gap-3 text-left">
                <div className="flex flex-col pr-2">
                  <h3 className={`text-sm sm:text-base md:text-lg font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Sembunyikan Riwayat Vote</h3>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? "text-neutral-400" : "text-gray-500"}`}>Jangan tampilkan jejak voting polling pada profil publik.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={privacy.hideVote}
                    onChange={() => handleTogglePrivacy("hideVote", "hide_vote")}
                    className="sr-only peer"
                  />
                  <div className="w-[46px] h-[24px] sm:w-[52px] sm:h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] sm:after:h-[24px] sm:after:w-[24px] after:transition-all peer-checked:after:translate-x-[22px] sm:peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>
            </div>
          </section>

          {/* SECTION 4: HELP & SUPPORT */}
          <section className="pt-2 border-t border-gray-200 dark:border-neutral-800 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gray-100/70 dark:bg-[#252525] border border-gray-200 dark:border-neutral-800">
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-[#f1ece1]">
                  Menemukan kendala teknis atau masalah akun?
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-neutral-400">
                  Kirim laporan kepada tim pengembang untuk bantuan lebih lanjut.
                </p>
              </div>
              <button
                onClick={() => navigate("/report")}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#a50034] hover:bg-[#85002a] dark:bg-[#f1ece1] dark:text-neutral-900 dark:hover:bg-[#e2dacd] rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                Report a problem
              </button>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}