import { useEffect, useState } from "react";
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
        // Ambil kolom yang benar-benar ada di tabel users Supabase kamu
        supabase.from("users").select("id, username, email, avatar_url, created_at")
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
                  Moderasi postingan feed terpopuler
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
              <h2 className="text-xl font-bold mb-4">Moderasi Postingan Feed (Terpopuler)</h2>

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
              <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-sm text-gray-400 font-medium">Total Laporan (Posts)</span>
                <span className="text-4xl font-extrabold text-[#f1ece1] mt-2">{stats.posts}</span>
              </div>
              <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
                <span className="text-sm text-gray-400 font-medium">Total Komentar Masuk</span>
                <span className="text-4xl font-extrabold text-[#f1ece1] mt-2">{stats.comments}</span>
              </div>
            </div>

            {/* Tabel Pengguna */}
            <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Daftar Pengguna</h2>

              {loading ? (
                <p className="text-center text-gray-500 py-6">Memuat data pengguna...</p>
              ) : usersList.length === 0 ? (
                <p className="text-center text-gray-500 py-6">Belum ada pengguna terdaftar.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-16">Profile</th>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Tanggal Bergabung</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-gray-800/40 transition-colors">
                          {/* Kolom 1: Profile Picture */}
                          <td className="py-4 px-4 text-center">
                            {usr.avatar_url ? (
                              <img
                                src={usr.avatar_url}
                                alt={usr.username || "User"}
                                className="w-9 h-9 rounded-full object-cover mx-auto border border-gray-700 shadow-sm"
                                onError={(e) => {
                                  // Jika image URL gagal/broken, ganti otomatis ke UI Avatar berwarna emas
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    usr.username || "U"
                                  )}&background=d97706&color=fff&bold=true`;
                                }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold flex items-center justify-center text-xs mx-auto uppercase">
                                {usr.username ? usr.username.charAt(0) : "U"}
                              </div>
                            )}
                          </td>

                          {/* Kolom 2: Username */}
                          <td className="py-4 px-4 font-semibold text-white">
                            {usr.username || "Tanpa Nama"}
                          </td>

                          {/* Kolom 3: Email */}
                          <td className="py-4 px-4 text-gray-300">
                            {usr.email || "-"}
                          </td>

                          {/* Kolom 4: Tanggal Bergabung */}
                          <td className="py-4 px-4 text-xs text-gray-400">
                            {usr.created_at ? new Date(usr.created_at).toLocaleDateString("id-ID") : "-"}
                          </td>

                          {/* Kolom 5: Aksi */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
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

        {/* TAB 3 & 4 (PLACEHOLDER) */}
        {activeTab === "comments" && <div className="text-xl font-bold p-6">Menu Moderasi Komentar (Coming Soon)</div>}
        {activeTab === "settings" && <div className="text-xl font-bold p-6">Menu Pengaturan Admin (Coming Soon)</div>}

      </main>
    </div>
  );
}