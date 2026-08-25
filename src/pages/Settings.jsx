import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';

export default function Settings({ user, onNavigate }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if(isDarkMode){
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

  // State Permission
  const [permission, setPermission] = useState({
    Camera: false,
    Notification: false
  });

  // State UI Mockup Privacy
  const [privacy, setPrivacy] = useState({
    anonymousMode: false,
    hideContactInfo: false,
    hideHistory: false
  });

  // State UI Mockup Notification
  const [notifSettings, setNotifSettings] = useState({
    emailNotif: true,
    activityAlerts: true
  });

  // Fetch & Sinkronisasi Permission dengan Browser & Backend
  useEffect(() => {
    const syncPermissions = async () => {
      let initialPerms = { Camera: false, Notification: false };

      try {
        if ("Notification" in window) {
          initialPerms.Notification = Notification.permission === "granted";
        }
      } catch (err) {
        console.warn("Permissions API check failed:", err);
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/permissions");
        if (res.ok) {
          const data = await res.json();
          setPermission({
            Camera: data.Camera ?? initialPerms.Camera,
            Notification: data.Notification ?? initialPerms.Notification
          });
          return;
        }
      } catch (error) {
        console.error("Gagal mengambil permission dari server", error);
      }

      setPermission(initialPerms);
    };

    syncPermissions();
  }, []);

  const updatebackend_permission = async (type, status) => {
    try {
      await fetch("http://localhost:5000/api/users/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionType: type, isAllowed: status })
      });
    } catch (error) {
      console.error("Gagal update ke backend", error);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  
  /* Handler Kamera */
  const handleCamera = async (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setPermission((prev) => ({ ...prev, Camera: false }));
      await updatebackend_permission("Camera", false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermission((prev) => ({ ...prev, Camera: true }));
      await updatebackend_permission("Camera", true);
    } catch (error) {
      setPermission((prev) => ({ ...prev, Camera: false }));
      await updatebackend_permission("Camera", false);
      alert("Akses kamera ditolak! Izinkan kamera pada pengaturan browser.");
    }
  };

  /* Handler Notifikasi */
  const handleNotification = async (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setPermission((prev) => ({ ...prev, Notification: false }));
      await updatebackend_permission("Notification", false);
      return;
    }

    if (!("Notification" in window)) {
      alert("Browser ini tidak mendukung notifikasi desktop.");
      return;
    }

    try {
      if (Notification.permission === "denied") {
        alert("Akses notifikasi telah diblokir. Buka ikon setelan situs di Address Bar lalu ubah Notifikasi menjadi 'Allow'.");
        setPermission((prev) => ({ ...prev, Notification: false }));
        await updatebackend_permission("Notification", false);
        return;
      }

      const resPermission = await Notification.requestPermission();
      if (resPermission === "granted") {
        setPermission((prev) => ({ ...prev, Notification: true }));
        await updatebackend_permission("Notification", true);
      } else {
        setPermission((prev) => ({ ...prev, Notification: false }));
        await updatebackend_permission("Notification", false);
        alert("Akses notifikasi ditolak!");
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      setPermission((prev) => ({ ...prev, Notification: false }));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-[#292828] text-white" : "bg-[#f7f7f7] text-gray-800"}`}>    
      <div className="flex flex-row flex-1 pt-6">
        {/* Sidebar Navigation Shortcut (Sticky) */}
        <aside className="sticky top-6 h-[calc(100vh-1.5rem)] flex flex-col px-8 gap-3 w-fit border-r-4 border-[#a50034]">
          <div 
            onClick={() => navigate('/home')}
            className="flex flex-row items-center gap-3 cursor-pointer hover:opacity-80 transition w-fit mb-4"
          >
            <svg className={`w-10 h-10 transition-colors duration-300 ${isDarkMode ? "fill-[#f1ece1]" : "fill-[#a50034]"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M41.4 342.6C28.9 330.1 28.9 309.8 41.4 297.3L169.4 169.3C178.6 160.1 192.3 157.4 204.3 162.4C216.3 167.4 224 179.1 224 192L224 256L560 256C586.5 256 608 277.5 608 304L608 336C608 362.5 586.5 384 560 384L224 384L224 448C224 460.9 216.2 472.6 204.2 477.6C192.2 482.6 178.5 479.8 169.3 470.7L41.3 342.7z"/>
            </svg>
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Back</h2>
          </div>

          {/* Menu Shortcut */}
          <div className="flex flex-col gap-6">
            {["permission", "appearance", "privacy", "notification"].map((item) => (
              <span 
                key={item}
                onClick={() => scrollToSection(`${item}-section`)}
                className={`text-2xl font-bold capitalize cursor-pointer transition ${isDarkMode ? "text-[#f1ece1] hover:text-[#a50034]" : "text-gray-500 hover:text-[#a50034]"}`}
              >
                {item}
              </span>
            ))}
          </div>
        </aside>

        {/* Konten Utama */}
        <main className="flex-1 pl-8 flex flex-col gap-16 pb-28">
          
          {/* SECTION 1: PERMISSION */}
          <section id="permission-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Permission Settings</h1>                
              <p className={isDarkMode ? "text-[#f1ece1]" : "text-gray-600"}>Mengelola akses fitur dan perangkat untuk kelancaran pembuatan laporan</p>
            </div>
            <div className={`flex flex-col gap-4 p-6 rounded-2xl shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e] border-2 border-[#f1ece1]" : "bg-white border-2 border-[#a50034]"}`}>
              <div className={`flex flex-row items-center justify-between pb-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                <div className="flex flex-col pr-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Camera & Gallery</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Mengambil foto langsung atau mengunggah gambar bukti komplain.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" onChange={handleCamera} checked={permission.Camera} className="sr-only peer" />
                  <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

              <div className="flex flex-row items-center justify-between pb-4">
                <div className="flex flex-col pr-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Notification</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Menerima notifikasi saat ada kegiatan pada website</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" onChange={handleNotification} checked={permission.Notification} className="sr-only peer" />
                  <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>
            </div>
          </section>

          {/* SECTION 2: APPEARANCE */}
          <section id="appearance-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Appearance Settings</h1>
              <p className={isDarkMode ? "text-[#f1ece1]" : "text-gray-600"}>Ubah tema visual aplikasi.</p>
            </div>
            <div className={`flex flex-col gap-4 p-6 rounded-2xl shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e] border-2 border-[#f1ece1]" : "bg-white border-2 border-[#a50034]"}`}>
              <p className={`text-center text-2xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Pilihan Tema Visual</p>
              <div className="flex flex-row gap-6 items-center justify-center">
                <span className={`text-xl font-bold transition-colors ${!isDarkMode ? "text-[#a50034]" : "text-[#f1ece1]"}`}>
                  Light Mode
                </span>
                
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={isDarkMode} 
                    onChange={toggle_dark_mode} 
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

          {/* SECTION 3: PRIVACY (UI MOCKUP) */}
          <section id="privacy-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Privacy Settings</h1>
              <p className={isDarkMode ? "text-[#f1ece1]" : "text-gray-600"}>Kelola kerahasiaan identitas, visibilitas riwayat, dan data kontak kamu.</p>
            </div>
            <div className={`flex flex-col gap-4 p-6 rounded-2xl shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e] border-2 border-[#f1ece1]" : "bg-white border-2 border-[#a50034]"}`}>
              
              <div className={`flex flex-row items-center justify-between pb-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                <div className="flex flex-col pr-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Mode Anonim (Default)</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Sembunyikan nama dan foto profil kamu secara otomatis saat membuat laporan baru.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={privacy.anonymousMode} 
                    onChange={() => setPrivacy(prev => ({ ...prev, anonymousMode: !prev.anonymousMode }))} 
                    className="sr-only peer" 
                  />
                  <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

              <div className={`flex flex-row items-center justify-between pb-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                <div className="flex flex-col pr-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Privasi Kontak</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Sembunyikan nomor HP dan email pribadi dari petugas penangan komplain.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={privacy.hideContactInfo} 
                    onChange={() => setPrivacy(prev => ({ ...prev, hideContactInfo: !prev.hideContactInfo }))} 
                    className="sr-only peer" 
                  />
                  <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

              <div className="flex flex-row items-center justify-between pb-4">
                <div className="flex flex-col pr-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Sembunyikan Riwayat Laporan</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Jangan tampilkan laporan yang pernah kamu buat di feed publik atau profil kamu.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={privacy.hideHistory} 
                    onChange={() => setPrivacy(prev => ({ ...prev, hideHistory: !prev.hideHistory }))} 
                    className="sr-only peer" 
                  />
                  <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

            </div>
          </section>

          {/* SECTION 4: NOTIFICATION (UI MOCKUP) */}
          <section id="notification-section" className="scroll-mt-28 max-w-3xl flex flex-col gap-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Notification Settings</h1>
              <p className={isDarkMode ? "text-[#f1ece1]" : "text-gray-600"}>Atur notifikasi push dan email yang ingin kamu terima.</p>
            </div>
            <div className={`flex flex-col gap-4 p-6 rounded-2xl shadow-sm transition-colors ${isDarkMode ? "bg-[#1e1e1e] border-2 border-[#f1ece1]" : "bg-white border-2 border-[#a50034]"}`}>
              
              <div className={`flex flex-row items-center justify-between pb-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                <div className="flex flex-col pr-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Notifikasi Email</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Kirim pembaruan status laporan langsung ke email akun kamu.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={notifSettings.emailNotif} 
                    onChange={() => setNotifSettings(prev => ({ ...prev, emailNotif: !prev.emailNotif }))} 
                    className="sr-only peer" 
                  />
                  <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

              <div className="flex flex-row items-center justify-between pb-4">
                <div className="flex flex-col pr-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-[#f1ece1]" : "text-[#a50034]"}`}>Notifikasi Aktivitas Laporan</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Dapatkan pemberitahuan saat ada komentar atau tanggapan baru dari petugas.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={notifSettings.activityAlerts} 
                    onChange={() => setNotifSettings(prev => ({ ...prev, activityAlerts: !prev.activityAlerts }))} 
                    className="sr-only peer" 
                  />
                  <div className="w-[52px] h-[28px] bg-gray-300 rounded-full peer peer-checked:bg-[#a50034] transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:after:translate-x-[24px]"></div>
                </label>
              </div>

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}