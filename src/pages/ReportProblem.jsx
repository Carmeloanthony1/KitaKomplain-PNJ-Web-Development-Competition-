import { useState } from "react";
import { useStatus } from "../components/StatusContext";

export default function ReportProblem() {
  const { showStatus } = useStatus();
  const [category, setCategory] = useState("");
  const [problemType, setProblemType] = useState("Technical");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastToken, setLastToken] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!category || !details) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          problemType,
          details,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showStatus(data.message || "Gagal mengirim report.", "error");
        return;
      }

      setLastToken(data.ticket);
      showStatus(`Report berhasil dikirim! Ticket: ${data.ticket}`, "success");

      setCategory("");
      setProblemType("Technical");
      setDetails("");
    } catch (error) {
      console.error("Error:", error);
      showStatus("Tidak dapat terhubung ke server.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#292828] text-[#f1ece1] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e1e1e] border-2 border-[#a50034] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f1ece1] text-center mb-6">
          Report a Problem
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Subject Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#a50034] px-1">
              Subject
            </label>
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Masukkan judul/kategori..."
              className="w-full h-12 px-4 bg-[#121212] border border-gray-800 rounded-xl text-sm text-[#f1ece1] placeholder-gray-500 outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034] transition-all"
              required
            />
          </div>

          {/* Problem Type Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#a50034] px-1">
              Problem Type
            </label>
            <div className="relative flex items-center">
              <select
                value={problemType}
                onChange={(event) => setProblemType(event.target.value)}
                className="w-full h-12 px-4 bg-[#121212] border border-gray-800 rounded-xl text-sm text-[#f1ece1] outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034] transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="Technical">Technical</option>
                <option value="Bug">Bug</option>
                <option value="Recommendation">Recommendation</option>
                <option value="Question">Question</option>
              </select>
              <div className="absolute right-4 pointer-events-none text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Details Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#a50034] px-1">
              Details
            </label>
            <textarea
              rows={5}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Jelaskan detail masalah kamu..."
              className="w-full p-4 bg-[#121212] border border-gray-800 rounded-xl text-sm text-[#f1ece1] placeholder-gray-500 outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034] transition-all resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-2 bg-[#a50034] hover:bg-[#8f002d] text-white text-base font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </button>
        </form>

        {/* Info Ticket jika berhasil dikirim */}
        {lastToken && (
          <div className="mt-5 p-3 bg-[#121212] border border-emerald-500/30 rounded-xl text-center">
            <p className="text-xs text-gray-400">Nomor Ticket Kamu:</p>
            <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
              #{lastToken}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}