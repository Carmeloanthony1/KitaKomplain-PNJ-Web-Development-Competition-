import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ posts: 0, users: 0, comments: 0 });
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);

    try {
      console.log("--- START FETCH ADMIN DATA ---");

      // 1. Fetch Stats
      const { count: postCount } = await supabase.from("posts").select("*", { count: "exact", head: true });
      const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
      const { count: commentCount } = await supabase.from("comments").select("*", { count: "exact", head: true });

      setStats({
        posts: postCount || 0,
        users: userCount || 0,
        comments: commentCount || 0,
      });

      // 2. Fetch Posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, description, tag, is_anonim_mode, created_at, user_id, users(username)");

      if (postsError) console.error("Error Fetch Posts:", postsError);

      // 3. Fetch Votes secara terpisah biar gak kena RLS/Join Error
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select("*");

      if (votesError) console.error("Error Fetch Votes:", votesError);

      // 4. Olah Data & Calculate Total Upvote
      if (postsData) {
        const allVotes = votesData || [];

        const processedPosts = postsData.map((post) => {
          // Cari vote yang sesuai dengan post_id dan bertipe 'up'
          const upvotesCount = allVotes.filter((v) => {
            const matchPost = (v.post_id || v.postId) === post.id;
            const isUp = v.vote_type ? v.vote_type === "up" : true;
            return matchPost && isUp;
          }).length;

          return {
            ...post,
            upvotes: upvotesCount,
          };
        });

        // Urutkan dari vote terbanyak ke yang paling sedikit
        processedPosts.sort((a, b) => b.upvotes - a.upvotes);

        setPostsList(processedPosts);
      }
    } catch (err) {
      console.error("Catch Error Admin Fetch:", err);
    } finally {
      setLoading(false);
      console.log("--- END FETCH ADMIN DATA ---");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("Apakah anda yakin ingin hapus postingan ini?");
    if (!confirmDelete) return;

    // Optimistic UI update
    setPostsList((prev) => prev.filter((post) => post.id !== postId));

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert("Gagal menghapus post: " + error.message);
      fetchAdminData(); // Rollback kalau error
    } else {
      alert("Postingan berhasil dihapus!");
      setStats((prev) => ({ ...prev, posts: prev.posts - 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#292828] text-gray-900 dark:text-[#f1ece1] p-6 sm:p-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Top Header Admin */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-[#a50034] dark:text-[#f1ece1]"> Admin Control Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola konten, laporan, dan statistik platform KitaKomplain</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-[#f1ece1] flex items-center gap-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z"/>
            </svg> Kembali ke Home
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Laporan (Posts)</span>
            <span className="text-4xl font-extrabold text-[#a50034] dark:text-[#f1ece1] mt-2">{stats.posts}</span>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Pengguna Terdaftar</span>
            <span className="text-4xl font-extrabold text-[#a50034] dark:text-[#f1ece1] mt-2">{stats.users}</span>
          </div>
          <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Komentar Masuk</span>
            <span className="text-4xl font-extrabold text-[#a50034] dark:text-[#f1ece1] mt-2">{stats.comments}</span>
          </div>
        </div>

        {/* Moderasi Posts Table */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-[#f1ece1]">Moderasi Postingan Feed (Terpopuler)</h2>

          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">Memuat data posts...</p>
          ) : postsList.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">Belum ada postingan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Penulis</th>
                    <th className="py-3 px-4">Tag</th>
                    <th className="py-3 px-4">Deskripsi</th>
                    <th className="py-3 px-4 text-center">Total Vote</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {postsList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-[#f1ece1]">
                        {item.is_anonim_mode ? (
                          <span className="text-amber-500">🔒 Anonim</span>
                        ) : (
                          item.users?.username || "Unknown"
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#a50034] dark:text-[#f1ece1]">#{item.tag}</td>
                      <td className="py-4 px-4 max-w-xs truncate text-gray-600 dark:text-gray-300">
                        {item.description || "-"}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-amber-600 dark:text-amber-400">
                        {item.upvotes}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400 dark:text-gray-500">
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
    </div>
  );
}