import { useState, useEffect } from "react";

export default function ReportPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);
  
  // State untuk Focus/Detail Modal
  const [selectedReport, setSelectedReport] = useState(null);

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

  // Handler update status
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
    <div className="p-6 text-[#f1ece1] relative">
      <h1 className="text-2xl font-bold mb-1">Reports Panel</h1>
      <p className="text-xs text-gray-400 mb-6">
        Pantau laporan dan kelola dari user
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#1e1e1e] border border-gray-800 p-5 rounded-2xl flex flex-col justify-center">
          <p className="text-xs text-gray-400 font-semibold mb-2">
            Problem Waiting
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-[#a50034] leading-none">
              {waitingCount}
            </span>
            <span className="text-sm font-medium text-gray-300">
              Laporan Menunggu
            </span>
          </div>
        </div>

        <div className="bg-[#1e1e1e] border border-gray-800 p-5 rounded-2xl flex flex-col justify-center">
          <p className="text-xs text-gray-400 font-semibold mb-2">
            Problem Clear
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-emerald-500 leading-none">
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
            className="bg-[#121212] border border-gray-800 text-xs text-[#f1ece1] rounded-lg px-3 py-1.5 outline-none focus:border-[#a50034] cursor-pointer"
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
            {filteredReports.map((item) => {
              const isWaiting =
                item.status === "Waiting" || item.status === "Pending";

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReport(item)}
                  className="p-4 bg-[#121212] border border-gray-800 hover:border-gray-700 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-[#161616]"
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
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {item.details}
                    </p>
                  </div>

                  <div 
                    className="flex flex-col items-end gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()} // Mencegah modal kebuka saat klik dropdown
                  >
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value)
                      }
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold outline-none cursor-pointer border transition-all ${
                        isWaiting
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                    >
                      <option value="Waiting" className="bg-[#1e1e1e] text-amber-400">
                        Waiting
                      </option>
                      <option value="Clear" className="bg-[#1e1e1e] text-emerald-400">
                        Clear
                      </option>
                    </select>

                    <span className="text-[10px] text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOCUS REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-gray-800 w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono font-bold text-[#a50034]">
                    #{selectedReport.ticket}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold">
                    {selectedReport.problem_type}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#f1ece1]">
                  {selectedReport.category}
                </h2>
              </div>
              
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-gray-800 transition-all"
              >
                ✕
              </button>
            </div>

            {/* User Info */}
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

            {/* Full Details */}
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1.5">
                Detail Permasalahan:
              </span>
              <div className="bg-[#121212] border border-gray-800 p-4 rounded-xl text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedReport.details}
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Status:</span>
                <select
                  value={selectedReport.status}
                  disabled={updatingId === selectedReport.id}
                  onChange={(e) =>
                    handleStatusChange(selectedReport.id, e.target.value)
                  }
                  className={`text-xs px-3 py-1 rounded-full font-bold outline-none cursor-pointer border ${
                    selectedReport.status === "Waiting" || selectedReport.status === "Pending"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  <option value="Waiting" className="bg-[#1e1e1e]">Waiting</option>
                  <option value="Clear" className="bg-[#1e1e1e]">Clear</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-xl transition-all"
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