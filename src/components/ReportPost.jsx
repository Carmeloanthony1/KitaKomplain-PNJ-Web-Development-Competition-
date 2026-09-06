import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";
import { useStatus } from "./StatusContext";

const REPORT_REASONS = [
  { value: "spam", label: "Spam atau iklan" },
  { value: "harassment", label: "Pelecehan atau bullying" },
  { value: "hate_speech", label: "Ujaran kebencian / SARA" },
  { value: "misinformation", label: "Informasi palsu / hoax" },
  { value: "nsfw", label: "Konten dewasa / tidak pantas" },
  { value: "other", label: "Lainnya" },
];

export default function Report_post({
  post,
  currentUserId,
  onClose,
  onReported,
}) {
  const { showStatus } = useStatus();

  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  const handleSubmit = async () => {
    if (!currentUserId) {
      showStatus("Silahkan login/sign up untuk melaporkan postingan!", "error");
      return;
    }

    if (!selectedReason) {
      showStatus("Pilih alasan laporan terlebih dahulu ya.", "error");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("reportpost").insert([
      {
        post_id: post.id,
        reporter_id: currentUserId,
        reason: selectedReason,
        description: description.trim() || null,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error("Gagal mengirim laporan:", error.message);
      showStatus("Gagal mengirim laporan: " + error.message, "error");
      return;
    }

    if (onReported) onReported();
    onClose();
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1e1e1e] p-4 sm:p-5 rounded-t-2xl sm:rounded-2xl max-w-sm w-full shadow-2xl border sm:border-2 border-[#a50034]/30 dark:border-[#f1ece1]/30 animate-fadeIn"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-[#f1ece1]">
            Laporkan Postingan
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#a50034] dark:hover:text-[#f1ece1] font-bold text-lg sm:text-xl cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
          Kenapa lauw mau laporkan postingan ini?
        </p>

        <div className="flex flex-col gap-1.5 sm:gap-2 max-h-52 overflow-y-auto pr-1">
          {REPORT_REASONS.map((reasonItem) => (
            <label
              key={reasonItem.value}
              className={`flex items-center gap-2.5 sm:gap-3 cursor-pointer p-2 sm:p-2.5 rounded-xl border-2 transition-colors ${
                selectedReason === reasonItem.value
                  ? "border-[#a50034] bg-rose-50 dark:bg-[#a50034]/10 dark:border-[#a50034]"
                  : "border-transparent hover:bg-rose-50/60 dark:hover:bg-neutral-800/80"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value={reasonItem.value}
                checked={selectedReason === reasonItem.value}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="accent-[#a50034] w-4 h-4 flex-shrink-0"
              />
              <span className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-[#f1ece1]">
                {reasonItem.label}
              </span>
            </label>
          ))}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detail tambahan (opsional)"
          rows={3}
          className="w-full mt-3 p-2.5 text-xs sm:text-sm rounded-xl border-2 border-[#a50034]/30 dark:border-[#f1ece1]/30 bg-white dark:bg-[#252525] text-gray-800 dark:text-[#f1ece1] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#a50034] dark:focus:border-[#f1ece1] resize-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-lg font-semibold text-xs sm:text-sm text-gray-700 dark:text-[#f1ece1] bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="flex-1 py-2 rounded-lg font-semibold text-xs sm:text-sm text-white bg-[#a50034] hover:bg-[#8a002c] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
