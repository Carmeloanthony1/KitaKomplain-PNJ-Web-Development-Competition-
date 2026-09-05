import { useState } from "react";
import { createPortal } from "react-dom";
import { useStatus } from "./StatusContext";

export default function Share_post({ post, onclose }) {
  const { showStatus } = useStatus();
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const shareUrl = `${window.location.origin}/search?tag=${encodeURIComponent(post.tag || "")}`;
  const shareTitle = `Lihat postingan komplain #${post.tag || "isu"} di KitaKomplain:`;
  const shareText = `"${(post.description || "").slice(0, 80)}..."`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showStatus("Tautan berhasil disalin!", "success");
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

  const shareOptions = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`,
      icon: (
        <svg className="w-5 h-5 fill-emerald-500" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.19 8.19 0 0 1-5.82 2.42c-1.48 0-2.93-.39-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24z"/>
        </svg>
      ),
      bgClass: "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle}\n`)}&url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bgClass: "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-gray-900 dark:text-[#f1ece1]",
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      icon: (
        <svg className="w-5 h-5 fill-sky-500" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      ),
      bgClass: "hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-600 dark:text-sky-400",
    },
  ];

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
        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 dark:hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header Modal */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <span className="bg-[#a50034]/10 dark:bg-white/10 text-[#a50034] dark:text-[#f1ece1] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Bagikan
          </span>
          <h3 className="text-base font-extrabold text-gray-800 dark:text-[#f1ece1]">
            Bagikan Postingan Ini
          </h3>
        </div>

        {/* Tombol Platform Sosial */}
        <div className="grid grid-cols-3 gap-2">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800 transition-all cursor-pointer ${opt.bgClass}`}
            >
              {opt.icon}
              <span className="text-[11px] font-semibold">{opt.name}</span>
            </a>
          ))}
        </div>

        {/* Input Box Salin URL */}
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

        {/* Opsi Native Share di Perangkat Mobile */}
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