import { useState, useEffect } from "react";

export default function ReportPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedReport, setSelectedReport] = useState(null);

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

  const handleStatusChange = async (reportId, newStatus) => {
    setUpdatingId(reportId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setUpdatingId(null);
    }
  };

  const waitingCount = reports.filter(
    (r) => r.status === "Waiting" || r.status === "Pending"
  ).length;

  const clearCount = reports.filter(
    (r) => r.status === "Clear" || r.status === "Resolved"
  ).length;

  const filteredReports = reports.filter((report) => {
    if (statusFilter === "ALL") return true;
    return report.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 pb-16 text-[#f1ece1]">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#f1ece1]">
            Reports Panel
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Pantau dan kelola laporan kendala dari pengguna
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
          <span className="text-xs sm:text-sm text-gray-400 font-medium">Problem Waiting</span>
          <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
            <span className="text-2xl sm:text-4xl font-extrabold text-[#a50034]">{waitingCount}</span>
            <span className="text-xs sm:text-sm text-gray-400">Laporan Menunggu</span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
          <span className="text-xs sm:text-sm text-gray-400 font-medium">Problem Clear</span>
          <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
            <span className="text-2xl sm:text-4xl font-extrabold text-emerald-400">{clearCount}</span>
            <span className="text-xs sm:text-sm text-gray-400">Selesai Ditangani</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 sm:p-6 border border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
          <h2 className="text-lg sm:text-xl font-bold">Daftar Laporan Masuk</h2>

          <div className="relative flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none pr-8 pl-3 py-1.5 bg-[#121212] border border-gray-700 rounded-xl text-xs text-[#f1ece1] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Waiting">Waiting</option>
              <option value="Clear">Clear / Resolved</option>
            </select>
            <div className="absolute right-2.5 pointer-events-none text-gray-400">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-6 text-sm">Memuat data laporan...</p>
        ) : filteredReports.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm border border-dashed border-gray-800 rounded-xl">
            Tidak ada data laporan.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Tiket</th>
                    <th className="py-3 px-3">Pelapor</th>
                    <th className="py-3 px-3">Tipe</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Detail</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Tanggal</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {filteredReports.map((item) => {
                    const isWaiting = item.status === "Waiting" || item.status === "Pending";
                    return (
                      <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-4 px-3 font-mono font-bold text-[#a50034] text-xs">
                          #{item.ticket}
                        </td>
                        <td className="py-4 px-3 font-semibold text-white text-xs">
                          {item.users?.username || "Unknown"}
                        </td>
                        <td className="py-4 px-3 text-xs text-gray-300">
                          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[11px] font-medium">
                            {item.problem_type}
                          </span>
                        </td>
                        <td className="py-4 px-3 font-bold text-xs text-gray-200">
                          {item.category}
                        </td>
                        <td className="py-4 px-3 text-xs text-gray-400 max-w-xs truncate">
                          {item.details}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <select
                            value={item.status}
                            disabled={updatingId === item.id}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`text-[11px] px-2.5 py-1 rounded-full font-bold outline-none cursor-pointer border ${
                              isWaiting
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            <option value="Waiting" className="bg-[#1e1e1e] text-amber-400">Waiting</option>
                            <option value="Clear" className="bg-[#1e1e1e] text-emerald-400">Clear</option>
                          </select>
                        </td>
                        <td className="py-4 px-3 text-xs text-gray-400 text-center">
                          {new Date(item.created_at).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => setSelectedReport(item)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-semibold cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredReports.map((item) => {
                const isWaiting = item.status === "Waiting" || item.status === "Pending";
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#121212] border border-gray-800 rounded-xl flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#a50034]">
                          #{item.ticket}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold">
                          {item.problem_type}
                        </span>
                      </div>

                      {isWaiting ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold">
                          Waiting
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                          Clear
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs text-white">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        by: {item.users?.username || "Unknown"}
                      </span>
                      <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                        {item.details}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[11px] gap-2">
                      <span className="text-gray-400 text-[10px]">
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(item)}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs cursor-pointer"
                        >
                          Detail
                        </button>
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleStatusChange(item.id, isWaiting ? "Clear" : "Waiting")}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                            isWaiting
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                              : "bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white"
                          }`}
                        >
                          {isWaiting ? "Set Clear" : "Set Waiting"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Focus Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-800 w-full max-w-lg rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between border-b border-gray-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#a50034]">
                    #{selectedReport.ticket}
                  </span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold">
                    {selectedReport.problem_type}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#f1ece1]">
                  {selectedReport.category}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-white text-base font-bold p-1 rounded-lg hover:bg-gray-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#121212] p-3 rounded-xl border border-gray-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 block text-[10px]">Pelapor:</span>
                <span className="font-semibold text-gray-200">
                  {selectedReport.users?.username || "Unknown"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[10px]">Email:</span>
                <span className="font-semibold text-gray-200">
                  {selectedReport.users?.email || "-"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1.5">
                Detail Permasalahan:
              </span>
              <div className="bg-[#121212] border border-gray-800 p-3.5 rounded-xl text-xs text-gray-300 leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap">
                {selectedReport.details}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Status:</span>
                <select
                  value={selectedReport.status}
                  disabled={updatingId === selectedReport.id}
                  onChange={(e) => handleStatusChange(selectedReport.id, e.target.value)}
                  className={`text-xs px-2.5 py-1 rounded-full font-bold outline-none cursor-pointer border ${
                    selectedReport.status === "Waiting" || selectedReport.status === "Pending"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  <option value="Waiting" className="bg-[#1e1e1e] text-amber-400">Waiting</option>
                  <option value="Clear" className="bg-[#1e1e1e] text-emerald-400">Clear</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}