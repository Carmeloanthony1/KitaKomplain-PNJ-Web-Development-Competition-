import { useState, useEffect } from "react";

export default function ReportPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch data laporan dari backend
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setReports(data);
      } else {
        console.error("Gagal mengambil data reports:", data.message);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Hitung jumlah laporan berdasarkan status
  const waitingCount = reports.filter(
    (r) => r.status === "Waiting" || r.status === "Pending"
  ).length;

  const clearCount = reports.filter(
    (r) => r.status === "Clear" || r.status === "Resolved"
  ).length;

  // Filter daftar laporan berdasarkan dropdown
  const filteredReports = reports.filter((report) => {
    if (statusFilter === "ALL") return true;
    return report.status === statusFilter;
  });

  return (
    <div className="p-6 text-[#f1ece1]">
      <h1 className="text-2xl font-bold mb-1">Reports Panel</h1>
      <p className="text-xs text-gray-400 mb-6">
        Pantau laporan dan kelola dari user
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1e1e1e] border border-gray-800 p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-semibold mb-1">
            Problem Waiting
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#a50034]">
              {waitingCount}
            </span>
            <span className="text-sm font-medium text-gray-300">
              Laporan Menunggu
            </span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-gray-800 p-5 rounded-2xl">
          <p className="text-xs text-gray-400 font-semibold mb-1">
            Problem Clear
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-500">
              {clearCount}
            </span>
            <span className="text-sm font-medium text-gray-300">
              Selesai Ditangani
            </span>
          </div>
        </div>
      </div>

      {/* Main List Box */}
      <div className="bg-[#1e1e1e] border border-gray-800 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Daftar Laporan Masuk</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121212] border border-gray-800 text-xs text-[#f1ece1] rounded-lg px-3 py-1.5 outline-none focus:border-[#a50034]"
          >
            <option value="ALL">SELECT (STATUS): ALL</option>
            <option value="Waiting">Waiting</option>
            <option value="Clear">Clear / Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs text-gray-500">
            Memuat data laporan...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 border border-dashed border-gray-800 rounded-xl text-center text-xs text-gray-500">
            Tidak ada data laporan.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredReports.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#121212] border border-gray-800 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#a50034]">
                      #{item.ticket}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold">
                      {item.problem_type}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      by: {item.users?.username || "Unknown"}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#f1ece1]">
                    {item.category}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {item.details}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                      item.status === "Waiting" || item.status === "Pending"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}