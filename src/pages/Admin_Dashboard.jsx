import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavbarAdmin from "../components/Navbar_Admin"; // <-- Import Navbar di sini

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard"); // State penentu menu aktif
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0 });
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [postRes, userRes, commentRes, postsRes, votesRes] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("id, description, tag, is_anonim_mode, created_at, user_id, users(username)"),
        supabase.from("votes").select("post_id, vote_type")
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

  return (
    <div className="flex min-h-screen bg-[#292828] text-[#f1ece1]">
      {/* 1. KIRI: NAVBAR ADMIN SIDEBAR */}
      <NavbarAdmin activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. KANAN: KONTEN SESUAI TAB BERJALAN */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        
        {/* TAMPILAN JIKA MENU "Dashboard" ATAU "Moderation" AKTIFF */}
        {(activeTab === "dashboard" || activeTab === "moderation") && (
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex justify-between items-center border-b border-gray-700 pb-5">
              <div>
                <h1 className="text-3xl font-extrabold text-[#f1ece1]">Admin Control Panel</h1>
                <p className="text-sm text-gray-400 mt-1">
                  {activeTab === "dashboard" ? "Overview statistik & laporan terkini" : "Moderasi postingan feed terpopuler"}
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
                              <span className="text-amber-500">Anonim</span>
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

        {/* PLACEHOLDER UNTUK MENU LAIN */}
        {activeTab === "users" && <div className="text-xl font-bold">Menu Users Management (Coming Soon)</div>}
        {activeTab === "comments" && <div className="text-xl font-bold">Menu Moderasi Komentar (Coming Soon)</div>}
        {activeTab === "settings" && <div className="text-xl font-bold">Menu Pengaturan Admin (Coming Soon)</div>}

      </main>
    </div>
  );
}