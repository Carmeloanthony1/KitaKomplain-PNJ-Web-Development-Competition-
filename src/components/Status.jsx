export default function Status({ status, type = "success", onClose }) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-center justify-between gap-4 min-w-[280px] max-w-sm px-4 py-3 rounded-xl shadow-lg border-2 animate-fadeIn
        ${isError 
          ? "bg-red-50 border-red-500 text-red-700 dark:bg-[#2a1414] dark:text-red-300" 
          : "bg-rose-50 border-[#a50034] text-[#a50034] dark:bg-[#1e1e1e] dark:text-[#f1ece1]"}
      `}
    >
      <span className="text-sm font-semibold">{status}</span>
      <button
        onClick={onClose}
        className="text-lg font-bold opacity-60 hover:opacity-100 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}