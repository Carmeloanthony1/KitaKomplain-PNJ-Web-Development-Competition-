import Post from "./Post";

export default function Focuspost({ post, focused_comment, isOpen, onClose }) {
  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      {/* Container background */}
      <div
        className="relative max-h-[90vh] overflow-y-auto bg-slate-100 dark:bg-[#292828] p-3.5 rounded-3xl shadow-2xl flex flex-row items-start gap-1 backdrop-blur-md w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Postingan dengan focused_comment */}
        <div className="flex-1 w-full">
          <Post post={post} hideaction={true} focused_comment={focused_comment} />
        </div>

        {/* Tombol X */}
        <button
          onClick={onClose}
          className="sticky top-1 flex-shrink-0 mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200/80 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-neutral-200 text-sm font-bold transition-all cursor-pointer shadow-xs"
          title="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
}