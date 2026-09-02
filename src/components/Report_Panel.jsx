import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ReportPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((rep) => {
    if (filterStatus === "waiting") return rep.status === "waiting" || rep.status === "pending";
    if (filterStatus === "clear") return rep.status === "clear" || rep.status === "resolved";
    return true;
  });

  const waitingCount = reports.filter(
    (r) => r.status === "waiting" || r.status === "pending"
  ).length;
  
  const clearCount = reports.filter(
    (r) => r.status === "clear" || r.status === "resolved"
  ).length;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-[#f1ece1]">Reports Panel</h1>
          <p className="text-sm text-gray-400 mt-1">
            Pantau laporan dan kelola dari user
          </p>
        </div>
      </div>

      {/* Top Cards Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col justify-between">
          <span className="text-sm text-gray-400 font-medium">Problem Waiting</span>
          <div className="flex items-baseline gap-2 mt-2 items-center">
            <span className="text-4xl font-extrabold text-[#a50034]">{waitingCount}</span>
            <span className="text-2xl text-gray-400">Laporan Menunggu</span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col justify-between">
          <span className="text-sm text-gray-400 font-medium">Problem Clear</span>
          <div className="flex items-baseline gap-2 mt-2 items-center">
            <span className="text-4xl font-extrabold text-emerald-400">{clearCount}</span>
            <span className="text-2xl text-gray-400">Selesai Ditangani</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-[#f1ece1]">Daftar Laporan Masuk</h2>

          {/* Filter Dropdown */}
          <div className="relative flex items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pr-8 pl-4 py-2 bg-[#121212] border border-gray-700 rounded-xl text-xs text-[#f1ece1] font-bold focus:outline-none focus:border-[#a50034] cursor-pointer transition-colors"
            >
              <option value="all">SELECT (STATUS):</option>
              <option value="waiting">STATUS: WAITING</option>
              <option value="clear">STATUS: CLEAR</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-gray-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Memuat data laporan...</p>
        ) : filteredReports.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-[#121212]/50 rounded-xl border border-dashed border-gray-800">
            <p className="text-sm">Tidak ada data laporan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#a50034] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl">
                  <th className="py-3 px-4 rounded-l-xl w-32">Ticket</th>
                  <th className="py-3 px-4 w-44">Problem Type</th>
                  <th className="py-3 px-4">Desc</th>
                  <th className="py-3 px-4 text-center rounded-r-xl w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-sm">
                {filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-gray-300">
                      #{item.ticket_id || item.id.substring(0, 8)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#f1ece1]">
                      {item.problem_type || item.type || "Umum"}
                    </td>
                    <td className="py-4 px-4 text-gray-300 max-w-md truncate">
                      {item.description || item.desc || "-"}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {item.status === "clear" || item.status === "resolved" ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold inline-block">
                          Clear
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[#a50034]/20 text-rose-300 border border-[#a50034]/50 rounded-full text-xs font-bold inline-block">
                          Waiting
                        </span>
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
  );
}