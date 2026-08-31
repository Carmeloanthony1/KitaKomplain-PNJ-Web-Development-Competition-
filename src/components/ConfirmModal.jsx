export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 border-[#a50034] dark:border-[#f1ece1] animate-fadeIn"
      >
        <p className="text-gray-800 dark:text-[#f1ece1] font-semibold mb-5">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl font-bold text-gray-600 dark:text-[#f1ece1] hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl font-bold bg-[#a50034] text-white hover:bg-[#800028] transition-colors cursor-pointer"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}