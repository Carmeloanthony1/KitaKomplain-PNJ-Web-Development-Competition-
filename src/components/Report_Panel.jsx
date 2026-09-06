import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ReportPanel() {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [reportsRes, usersRes] = await Promise.all([
        supabase
          .from("reportpost")
          .select(
            `id, post_id, reporter_id, reason, description, status, created_at,
             posts ( id, description, tag, image_url, user_id, is_anonim_mode, users (username, avatar_url) )`
          )
          .order("created_at", { ascending: false }),
        supabase.from("users").select("id, username, avatar_url"),
      ]);

      if (reportsRes.error) throw reportsRes.error;

      const userMap = {};
      (usersRes.data || []).forEach((u) => {
        userMap[u.id] = u;
      });

      const merged = (reportsRes.data || []).map((r) => ({
        ...r,
        reporter: userMap[r.reporter_id] || null,
      }));

      setReportsList(merged);
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setProcessingId(reportId);
    setReportsList((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );

    const { error } = await supabase
      .from("reportpost")
      .update({ status: newStatus })
      .eq("id", reportId);

    setProcessingId(null);

    if (error) {
      alert("Gagal memperbarui status laporan: " + error.message);
      fetchReports();
    }
  };

  const handleDeletePost = async (postId, reportId) => {
    const confirmDelete = window.confirm(
      "Hapus postingan yang dilaporkan ini? Laporan terkait juga akan ikut terhapus."
    );
    if (!confirmDelete) return;

    setProcessingId(reportId);

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    setProcessingId(null);

    if (error) {
      alert("Gagal menghapus postingan: " + error.message);
      return;
    }

    setReportsList((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleDismiss = async (reportId) => {
    const confirmDismiss = window.confirm("Abaikan laporan ini?");
    if (!confirmDismiss) return;
    await handleUpdateStatus(reportId, "dismissed");
  };

  const filteredReports = reportsList.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (r.reason || "").toLowerCase().includes(term) ||
      (r.description || "").toLowerCase().includes(term) ||
      (r.posts?.description || "").toLowerCase().includes(term) ||
      (r.reporter?.username || "").toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const statusBadge = (status) => {
    if (status === "reviewed") {
      return "bg-[#1b2f11] text-emerald-400 border-emerald-500/30";
    }
    if (status === "dismissed") {
      return "bg-gray-800 text-gray-400 border-gray-600/40";
    }
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  };

  const statusLabel = (status) => {
    if (status === "reviewed") return "Ditindak";
    if (status === "dismissed") return "Diabaikan";
    return "Menunggu";
  };

  const pendingCount = reportsList.filter((r) => r.status === "pending").length;
  const reviewedCount = reportsList.filter((r) => r.status === "reviewed").length;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 pb-16">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#f1ece1]">
            Laporan Postingan
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Tinjau dan tindak lanjuti laporan dari pengguna
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
          <span className="text-xs sm:text-sm text-gray-400 font-medium">Total Laporan</span>
          <span className="text-2xl sm:text-4xl font-extrabold text-[#f1ece1] mt-1 sm:mt-2">
            {reportsList.length}
          </span>
        </div>
        <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
          <span className="text-xs sm:text-sm text-gray-400 font-medium">Menunggu Tindakan</span>
          <span className="text-2xl sm:text-4xl font-extrabold text-amber-400 mt-1 sm:mt-2">
            {pendingCount}
          </span>
        </div>
        <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
          <span className="text-xs sm:text-sm text-gray-400 font-medium">Sudah Ditindak</span>
          <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400 mt-1 sm:mt-2">
            {reviewedCount}
          </span>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
          <h2 className="text-lg sm:text-xl font-bold">Daftar Laporan</h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex items-center flex-1">
              <input
                type="text"
                placeholder="Cari alasan / deskripsi / pelapor..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto appearance-none pr-8 pl-3 py-1.5 bg-[#121212] border border-gray-700 rounded-xl text-xs text-[#f1ece1] focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="reviewed">Ditindak</option>
                <option value="dismissed">Diabaikan</option>
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
          <p className="text-center text-gray-500 py-6 text-sm">Memuat data laporan...</p>
        ) : filteredReports.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">Tidak ada laporan ditemukan.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Postingan</th>
                    <th className="py-3 px-4">Alasan</th>
                    <th className="py-3 px-4">Pelapor</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-800/40 transition-colors align-top">
                      <td className="py-4 px-4 max-w-[220px]">
                        {r.posts ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-xs text-[#f1ece1]">
                              {r.posts.is_anonim_mode
                                ? "🔒 Anonim"
                                : `@${r.posts.users?.username || "Unknown"}`}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              {r.posts.description || "-"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Post sudah dihapus</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-xs text-[#f1ece1] block">
                          {r.reason}
                        </span>
                        {r.description && (
                          <span className="text-xs text-gray-400 block mt-0.5 max-w-[200px] truncate">
                            {r.description}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-300">
                        {r.reporter?.username || "Tidak diketahui"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${statusBadge(
                            r.status
                          )}`}
                        >
                          {statusLabel(r.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {r.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, "reviewed")}
                              disabled={processingId === r.id}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Tandai Selesai
                            </button>
                          )}
                          {r.status === "pending" && (
                            <button
                              onClick={() => handleDismiss(r.id)}
                              disabled={processingId === r.id}
                              className="px-2.5 py-1 bg-gray-700/40 hover:bg-gray-700 text-gray-300 border border-gray-600/40 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Abaikan
                            </button>
                          )}
                          {r.posts && (
                            <button
                              onClick={() => handleDeletePost(r.post_id, r.id)}
                              disabled={processingId === r.id}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                            >
                              Hapus Post
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredReports.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-[#121212] border border-gray-800 rounded-xl flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">
                      {r.posts
                        ? r.posts.is_anonim_mode
                          ? "🔒 Anonim"
                          : `@${r.posts.users?.username || "Unknown"}`
                        : "Post dihapus"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(
                        r.status
                      )}`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2">
                    {r.posts?.description || "Postingan sudah tidak tersedia"}
                  </p>

                  <div className="text-[11px] text-gray-400">
                    Alasan: <span className="text-[#f1ece1] font-semibold">{r.reason}</span>
                  </div>
                  {r.description && (
                    <p className="text-[11px] text-gray-400 line-clamp-2">{r.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-[11px]">
                    <span className="text-gray-400">
                      Pelapor: {r.reporter?.username || "Tidak diketahui"}
                    </span>
                    <span className="text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {r.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, "reviewed")}
                        disabled={processingId === r.id}
                        className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        Selesai
                      </button>
                    )}
                    {r.status === "pending" && (
                      <button
                        onClick={() => handleDismiss(r.id)}
                        disabled={processingId === r.id}
                        className="px-2.5 py-1 bg-gray-700/50 text-gray-300 border border-gray-600/40 rounded text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        Abaikan
                      </button>
                    )}
                    {r.posts && (
                      <button
                        onClick={() => handleDeletePost(r.post_id, r.id)}
                        disabled={processingId === r.id}
                        className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-bold cursor-pointer disabled:opacity-50"
                      >
                        Hapus Post
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
