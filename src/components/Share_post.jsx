import { useState } from "react";
import { createPortal } from "react-dom";
import { useStatus } from "./StatusContext";

export default function Share_post({ post, onclose }) {
  const { showStatus } = useStatus();
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const shareUrl = `${window.location.origin}/home?post_id=${post.id}`;
  const shareTitle = `Lihat postingan komplain #${post.tag || "isu"} di KitaKomplain:`;
  const shareText = `"${(post.description || "").slice(0, 80)}..."`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showStatus("Tautan postingan berhasil disalin!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showStatus("Gagal menyalin tautan", "error");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "KitaKomplain",
          text: `${shareTitle} ${shareText}`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Gagal share:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof onclose === "function") {
      onclose();
    }
  };

  return createPortal(
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      style={{ pointerEvents: "auto" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm w-full bg-white dark:bg-[#1e1e1e] border-2 border-[#a50034]/30 dark:border-[#f1ece1]/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center transition-colors"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 dark:hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-1 mt-1">
          <span className="bg-[#a50034]/10 dark:bg-white/10 text-[#a50034] dark:text-[#f1ece1] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Bagikan
          </span>
          <h3 className="text-base font-extrabold text-gray-800 dark:text-[#f1ece1]">
            Bagikan Postingan Ini
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-neutral-700 rounded-xl p-1.5">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full text-xs bg-transparent px-2 text-gray-700 dark:text-[#f1ece1] outline-none truncate select-all"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="bg-[#a50034] hover:bg-[#85002a] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors cursor-pointer"
          >
            {copied ? "Tersalin!" : "Salin"}
          </button>
        </div>

        {"share" in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2 text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-dashed border-gray-300 dark:border-neutral-700 rounded-xl transition-colors cursor-pointer"
          >
            Opsi Bagikan Lainnya...
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}