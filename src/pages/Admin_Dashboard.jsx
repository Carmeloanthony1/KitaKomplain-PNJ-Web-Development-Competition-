import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavbarAdmin from "../components/Navbar_Admin";

export default function AdminDashboard() {
  const navigate = useNavigate();
  // Set default active tab ke "moderation"
  const [activeTab, setActiveTab] = useState("moderation"); 
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0 });
  const [postsList, setPostsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Search & Filter untuk Tab Users
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnonim, setFilterAnonim] = useState("all"); // 'all', 'anonim', 'public'

  // State untuk Dropdown Action Menu Titik Tiga
  const [activeMenuUserId, setActiveMenuUserId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown saat klik di luar menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuUserId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch semua data sekaligus (Posts, Stats, Users)
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [postRes, userRes, commentRes, postsRes, votesRes, usersDataRes] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("id, description, tag, is_anonim_mode, created_at, user_id, users(username)"),
        supabase.from("votes").select("post_id, vote_type"),
        // Ambil kolom users
        supabase.from("users").select("id, username, email, avatar_url, is_anonim_mode, created_at")
      ]);

      setStats({
        posts: postRes.count || 0,
        users: userRes.count || 0,
        comments: commentRes.count || 0,
      });

      // Olah Data Posts & Upvotes
      if (postsRes.data) {
        const votesData = votesRes.data || [];
        const processedPosts = postsRes.data.map((post) => {
          const upvotesCount = votesData.filter(
            (v) => v.post_id === post.id && v.vote_type === "up"
          ).length;

          return { ...post, upvotes: upvotesCount };
        });

        processedPosts.sort((a, b) => b.upvotes - a.upvotes);
        setPostsList(processedPosts);
      }

      // Olah Data Users
      if (usersDataRes.data) {
        setUsersList(usersDataRes.data);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handler Hapus Postingan
  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("Apakah anda yakin ingin hapus postingan ini?");
    if (!confirmDelete) return;

    setPostsList((prev) => prev.filter((post) => post.id !== postId));
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert("Gagal menghapus post: " + error.message);
      fetchAdminData();
    } else {
      alert("Postingan berhasil dihapus!");
      setStats((prev) => ({ ...prev, posts: prev.posts - 1 }));
    }
  };

  // Handler Hapus Pengguna
  const handleDeleteUser = async (userId) => {
    setActiveMenuUserId(null);
    const confirmDelete = window.confirm("Apakah anda yakin ingin menghapus pengguna ini?");
    if (!confirmDelete) return;

    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      alert("Gagal menghapus user: " + error.message);
      fetchAdminData();
    } else {
      alert("Pengguna berhasil dihapus!");
      setStats((prev) => ({ ...prev, users: prev.users - 1 }));
    }
  };

  // Handler Toggle Mode Anonim
  const handleToggleAnonim = async (usr) => {
    setActiveMenuUserId(null);
    const newStatus = !usr.is_anonim_mode;
    
    setUsersList((prev) =>
      prev.map((u) => (u.id === usr.id ? { ...u, is_anonim_mode: newStatus } : u))
    );

    const { error } = await supabase
      .from("users")
      .update({ is_anonim_mode: newStatus })
      .eq("id", usr.id);

    if (error) {
      alert("Gagal memperbarui mode pengguna: " + error.message);
      fetchAdminData();
    }
  };

  // Logic Filtering Data Users
  const filteredUsers = usersList.filter((usr) => {
    const matchesSearch =
      (usr.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usr.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (filterAnonim === "anonim") {
      return matchesSearch && usr.is_anonim_mode === true;
    }
    if (filterAnonim === "public") {
      return matchesSearch && !usr.is_anonim_mode;
    }
    return matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#292828] text-[#f1ece1] overflow-hidden">
      {/* 1. KIRI: NAVBAR ADMIN SIDEBAR */}
      <NavbarAdmin activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. KANAN: KONTEN SESUAI TAB BERJALAN */}
      <main className="flex-1 h-screen overflow-y-auto p-6 sm:p-10">
        
        {/* TAB 1: MODERATION */}
        {activeTab === "moderation" && (
          <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
            <div className="flex justify-between items-center border-b border-gray-700 pb-5">
              <div>
                <h1 className="text-3xl font-extrabold text-[#f1ece1]">Admin Control Panel</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Moderasi postingan feed
                </p>
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-sm text-gray-400 font-medium">Total Laporan (Posts)</span>
                <span className="text-4xl font-extrabold text-[#f1ece1] mt-2">{stats.posts}</span>
              </div>
              <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-sm text-gray-400 font-medium">Total Pengguna Terdaftar</span>
                <span className="text-4xl font-extrabold text-[#f1ece1] mt-2">{stats.users}</span>
              </div>
              <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-sm text-gray-400 font-medium">Total Komentar Masuk</span>
                <span className="text-4xl font-extrabold text-[#f1ece1] mt-2">{stats.comments}</span>
              </div>
            </div>

            {/* Moderasi Table */}
            <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Moderasi Postingan Feed</h2>

              {loading ? (
                <p className="text-center text-gray-500 py-6">Memuat data posts...</p>
              ) : postsList.length === 0 ? (
                <p className="text-center text-gray-500 py-6">Belum ada postingan.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Penulis</th>
                        <th className="py-3 px-4">Tag</th>
                        <th className="py-3 px-4">Deskripsi</th>
                        <th className="py-3 px-4 text-center">Total Vote</th>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {postsList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="py-4 px-4 font-semibold">
                            {item.is_anonim_mode ? (
                              <span className="text-amber-500">🔒 Anonim</span>
                            ) : (
                              item.users?.username || "Unknown"
                            )}
                          </td>
                          <td className="py-4 px-4 font-bold text-[#f1ece1]">#{item.tag}</td>
                          <td className="py-4 px-4 max-w-xs truncate text-gray-300">
                            {item.description || "-"}
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-amber-400">
                            {item.upvotes}
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-400">
                            {new Date(item.created_at).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleDeletePost(item.id)}
                              className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
            <div className="flex justify-between items-center border-b border-gray-700 pb-5">
              <div>
                <h1 className="text-3xl font-extrabold text-[#f1ece1]">User Management</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Kelola pengguna terdaftar dan hak akses platform
                </p>
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-sm text-gray-400 font-medium">Total Pengguna Terdaftar</span>
                <span className="text-4xl font-extrabold text-[#f1ece1] mt-2">{stats.users}</span>
              </div>
            </div>

            {/* Tabel Pengguna */}
            <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800 shadow-sm overflow-visible">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">Daftar Pengguna</h2>

                {/* SEARCH BAR & FILTER DROPDOWN */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari username / email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 px-4 py-2 bg-[#121212] border border-gray-700 rounded-xl text-xs text-[#f1ece1] focus:outline-none ftransition-colors placeholder-gray-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Mode Dropdown */}
                  <select
                    value={filterAnonim}
                    onChange={(e) => setFilterAnonim(e.target.value)}
                    className="px-3 py-2 bg-[#121212] border border-gray-700 rounded-xl text-xs text-[#f1ece1] focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Mode</option>
                    <option value="anonim">Mode Anonim</option>
                    <option value="public">Mode Publik</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-6">Memuat data pengguna...</p>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Pengguna tidak ditemukan.</p>
                  {(searchTerm || filterAnonim !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterAnonim("all");
                      }}
                      className="mt-2 text-xs text-amber-500 underline cursor-pointer"
                    >
                      Reset pencarian & filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-visible">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-20">Profile</th>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4 text-center">Mode Akun</th>
                        <th className="py-3 px-4">Tanggal Bergabung</th>
                        <th className="py-3 px-4 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-gray-800/40 transition-colors">
                          {/* Kolom 1: Profile Picture */}
                          <td className="py-4 px-4 text-center">
                            <div className="relative w-10 h-10 mx-auto">
                              {usr.avatar_url ? (
                                <img
                                  src={usr.avatar_url}
                                  alt="Foto profil"
                                  className="w-full h-full rounded-full object-cover border border-gray-700 shadow-sm"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-[#a50034] text-white font-bold text-sm flex items-center justify-center uppercase shadow-sm">
                                  {usr.username ? usr.username.charAt(0) : "U"}
                                </div>
                              )}

                              {/* BADGE MODE ANONIM AKUN */}
                              {usr.is_anonim_mode && (
                                <span 
                                  className="absolute -bottom-1 -right-1 bg-gray-900 text-amber-400 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-gray-700 shadow flex items-center gap-0.5" 
                                  title="Mode Anonim Aktif"
                                >
                                  <svg className = "w-4 h-4 fill-blue-200/90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                    <path d="M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z"/>
                                  </svg>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Kolom 2: Username */}
                          <td className="py-4 px-4 font-semibold text-white">
                            {usr.username || "Tanpa Nama"}
                          </td>

                          {/* Kolom 3: Email */}
                          <td className="py-4 px-4 text-gray-300">
                            {usr.email || "-"}
                          </td>

                          {/* Kolom 4: Status Mode Akun */}
                          <td className="py-4 px-4 text-center">
                            {usr.is_anonim_mode ? (
                              <span className="px-2.5 py-1 bg-[#1b305b] text-blue-300 border border-white/90 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                                Anonim
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-[#1b2f11] text-emerald-400 border border-emerald-500/90 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                                Publik
                              </span>
                            )}
                          </td>

                          {/* Kolom 5: Tanggal Bergabung */}
                          <td className="py-4 px-4 text-xs text-gray-400">
                            {usr.created_at ? new Date(usr.created_at).toLocaleDateString("id-ID") : "-"}
                          </td>

                          {/* Kolom 6: Aksi dengan Dropdown (...) */}
                          <td className="py-4 px-4 text-center relative">
                            <button
                              onClick={() => setActiveMenuUserId(activeMenuUserId === usr.id ? null : usr.id)}
                              className="w-8 h-8 rounded-lg hover:bg-gray-700/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer mx-auto font-bold text-base"
                            >
                              •••
                            </button>

                            {/* DROPDOWN MENU */}
                            {activeMenuUserId === usr.id && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-6 top-12 w-44 bg-[#121212] border border-gray-700 rounded-xl shadow-2xl z-50 py-1 text-left text-xs"
                              >
                                <button
                                  onClick={() => handleToggleAnonim(usr)}
                                  className="w-full px-4 py-2 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors cursor-pointer text-left"
                                >
                                  {usr.is_anonim_mode ? "Set ke Publik" : "Set ke Anonim"}
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteUser(usr.id)}
                                  className="w-full px-4 py-2 hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 transition-colors cursor-pointer text-left font-bold border-t border-gray-800/80"
                                >
                                  Hapus
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 & 4 (PLACEHOLDER) */}
        {activeTab === "comments" && <div className="text-xl font-bold p-6">Menu Moderasi Komentar (Coming Soon)</div>}
        {activeTab === "settings" && <div className="text-xl font-bold p-6">Menu Pengaturan Admin (Coming Soon)</div>}

      </main>
    </div>
  );
}