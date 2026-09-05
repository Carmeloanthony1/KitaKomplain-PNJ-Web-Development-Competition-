import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavbarAdmin from "../components/Navbar_Admin";
import User_profile from "../temp_files/Other_profile";
import ReportPanel from "../components/Report_Panel";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("moderation");
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0 });
  const [postsList, setPostsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnonim, setFilterAnonim] = useState("all");

  const [activeMenuUserId, setActiveMenuUserId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuUserId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [postRes, userRes, commentRes, postsRes, votesRes, usersDataRes] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("id, description, tag, is_anonim_mode, created_at, user_id, users(username)"),
        supabase.from("votes").select("post_id, vote_type"),
        supabase.from("users").select("id, username, email, avatar_url, is_anonim_mode, created_at, role, posts(count)")
      ]);

      setStats({
        posts: postRes.count || 0,
        users: userRes.count || 0,
        comments: commentRes.count || 0,
      });

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

  const handleDeleteUser = async (userId) => {
    setActiveMenuUserId(null);
    const confirmDelete = window.confirm("Apakah anda yakin ingin menghapus pengguna ini?");
    if (!confirmDelete) return;

    try {
      const { error: deletePostsErr } = await supabase
        .from("posts")
        .delete()
        .eq("user_id", userId);

      if (deletePostsErr) throw deletePostsErr;

      const { error: deleteUserErr } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (deleteUserErr) throw deleteUserErr;

      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => ({ ...prev, users: prev.users - 1 }));
      alert("Pengguna berhasil dihapus!");
      fetchAdminData();
    } catch (err) {
      alert("Gagal menghapus user: " + err.message);
      fetchAdminData();
    }
  };

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

  const filteredUsers = usersList.filter((usr) => {
    const matchesSearch =
      (usr.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usr.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usr.id || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (filterAnonim === "anonim") {
      return matchesSearch && usr.is_anonim_mode === true;
    }
    if (filterAnonim === "public") {
      return matchesSearch && !usr.is_anonim_mode;
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#292828] text-[#f1ece1] overflow-hidden">
      <NavbarAdmin activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
        
        {/* TAB 1: MODERATION */}
        {activeTab === "moderation" && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 pb-16">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#f1ece1]">Admin Control Panel</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Moderasi postingan feed
                </p>
              </div>
            </div>

            {/* Statistik Ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-xs sm:text-sm text-gray-400 font-medium">Total Laporan (Posts)</span>
                <span className="text-2xl sm:text-4xl font-extrabold text-[#f1ece1] mt-1 sm:mt-2">{stats.posts}</span>
              </div>
              <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-xs sm:text-sm text-gray-400 font-medium">Total Pengguna Terdaftar</span>
                <span className="text-2xl sm:text-4xl font-extrabold text-[#f1ece1] mt-1 sm:mt-2">{stats.users}</span>
              </div>
              <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-xs sm:text-sm text-gray-400 font-medium">Total Komentar Masuk</span>
                <span className="text-2xl sm:text-4xl font-extrabold text-[#f1ece1] mt-1 sm:mt-2">{stats.comments}</span>
              </div>
            </div>

            {/* Daftar Postingan */}
            <div className="bg-[#1e1e1e] rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Moderasi Postingan Feed</h2>

              {loading ? (
                <p className="text-center text-gray-500 py-6 text-sm">Memuat data posts...</p>
              ) : postsList.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">Belum ada postingan.</p>
              ) : (
                <>
                  {/* Tampilan Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
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
                                <span className="text-amber-500 text-xs sm:text-sm">🔒 Anonim</span>
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

                  {/* Tampilan Mobile Card List */}
                  <div className="md:hidden flex flex-col gap-3">
                    {postsList.map((item) => (
                      <div key={item.id} className="p-3.5 bg-[#121212] border border-gray-800 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">
                            {item.is_anonim_mode ? "🔒 Anonim" : `@${item.users?.username || "Unknown"}`}
                          </span>
                          <span className="text-xs font-bold text-[#f1ece1] bg-gray-800 px-2 py-0.5 rounded">
                            #{item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 line-clamp-2">
                          {item.description || "Tanpa deskripsi"}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-[11px]">
                          <span className="text-amber-400 font-semibold">{item.upvotes} Vote</span>
                          <span className="text-gray-400">{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                          <button
                            onClick={() => handleDeletePost(item.id)}
                            className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-bold cursor-pointer active:scale-95"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === "users" && (
          <div className="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 pb-16">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#f1ece1]">User Management</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Kelola pengguna terdaftar dan rincian hak akses
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-xs sm:text-sm text-gray-400 font-medium">Total Pengguna Terdaftar</span>
                <span className="text-2xl sm:text-4xl font-extrabold text-[#f1ece1] mt-1 sm:mt-2">{stats.users}</span>
              </div>
            </div>

            <div className="bg-[#1e1e1e] rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
                <h2 className="text-lg sm:text-xl font-bold">Daftar Pengguna</h2>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex items-center flex-1">
                    <input
                      type="text"
                      placeholder="Cari ID / username / email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 px-3 py-1.5 bg-[#121212] border border-gray-700 rounded-xl text-xs text-[#f1ece1] focus:outline-none transition-colors placeholder-gray-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 text-xs text-gray-400 hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="relative flex items-center">
                    <select
                      value={filterAnonim}
                      onChange={(e) => setFilterAnonim(e.target.value)}
                      className="w-full sm:w-auto appearance-none pr-8 pl-3 py-1.5 bg-[#121212] border border-gray-700 rounded-xl text-xs text-[#f1ece1] focus:outline-none cursor-pointer"
                    >
                      <option value="all">Semua Mode</option>
                      <option value="anonim">Mode Anonim</option>
                      <option value="public">Mode Publik</option>
                    </select>
                    <div className="absolute right-2.5 pointer-events-none text-gray-400">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-6 text-sm">Memuat data pengguna...</p>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">
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
                <>
                  {/* Tampilan Desktop Table */}
                  <div className="hidden md:block overflow-x-visible">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="py-3 px-3 text-center w-12">Profile</th>
                          <th className="py-3 px-3">Username</th>
                          <th className="py-3 px-3">Email</th>
                          <th className="py-3 px-3 text-center">Mode Akun</th>
                          <th className="py-3 px-3 text-center">Bergabung</th>
                          <th className="py-3 px-3 text-center w-14">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 text-sm">
                        {filteredUsers.map((usr) => (
                          <tr key={usr.id} className="hover:bg-gray-800/40 transition-colors">
                            <td className="py-4 px-3 text-center">
                              <div className="relative w-9 h-9 mx-auto">
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
                                  <div className="w-full h-full rounded-full bg-[#a50034] text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                                    {usr.username ? usr.username.charAt(0) : "U"}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-3 font-semibold text-white">
                              {usr.username || "Tanpa Nama"}
                            </td>

                            <td className="py-4 px-3 text-gray-300 text-xs">
                              {usr.email || "-"}
                            </td>

                            <td className="py-4 px-3 text-center">
                              {usr.is_anonim_mode ? (
                                <span className="px-2.5 py-1 bg-[#1b305b] text-blue-300 border border-blue-400/30 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                                  Anonim
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-[#1b2f11] text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                                  Publik
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-3 text-xs text-gray-400 text-center">
                              {usr.created_at ? new Date(usr.created_at).toLocaleDateString("id-ID") : "-"}
                            </td>

                            <td className="py-4 px-3 text-center relative">
                              <button
                                onClick={() => setActiveMenuUserId(activeMenuUserId === usr.id ? null : usr.id)}
                                className="w-8 h-8 rounded-lg hover:bg-gray-700/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer mx-auto font-bold text-base"
                              >
                                •••
                              </button>

                              {activeMenuUserId === usr.id && (
                                <div
                                  ref={dropdownRef}
                                  className="absolute right-4 top-11 w-44 bg-[#121212] border border-gray-700 rounded-xl shadow-2xl z-50 py-1 text-left text-xs"
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedUserId(usr.id);
                                      setActiveMenuUserId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors cursor-pointer text-left"
                                  >
                                    Lihat Detail
                                  </button>

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

                  {/* Tampilan Mobile User Card */}
                  <div className="md:hidden flex flex-col gap-3">
                    {filteredUsers.map((usr) => (
                      <div key={usr.id} className="p-3.5 bg-[#121212] border border-gray-800 rounded-xl flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#a50034] text-white flex items-center justify-center font-bold text-xs">
                              {usr.avatar_url ? (
                                <img src={usr.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                usr.username ? usr.username.charAt(0).toUpperCase() : "U"
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-white leading-tight">
                                {usr.username || "Tanpa Nama"}
                              </span>
                              <span className="text-[10px] text-gray-400">{usr.email || "-"}</span>
                            </div>
                          </div>

                          {usr.is_anonim_mode ? (
                            <span className="px-2 py-0.5 bg-[#1b305b] text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-bold">
                              Anonim
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#1b2f11] text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                              Publik
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[11px] gap-2">
                          <span className="text-gray-400 text-[10px]">
                            Join: {usr.created_at ? new Date(usr.created_at).toLocaleDateString("id-ID") : "-"}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedUserId(usr.id)}
                              className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => handleToggleAnonim(usr)}
                              className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700"
                            >
                              {usr.is_anonim_mode ? "Public Mode" : "Anonim Mode"}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="px-2.5 py-1 bg-rose-500/20 text-rose-400 rounded text-xs hover:bg-rose-500 hover:text-white"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REPORTS */}
        {activeTab === "reports" && <ReportPanel />}

      </main>

      <User_profile
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}