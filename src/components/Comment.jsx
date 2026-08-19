// CommentSection.jsx
import { useState } from "react";

export default function CommentSection({ comments = [] }) {
  const [commentList, setCommentList] = useState(comments);
  const [inputText, setInputText] = useState("");
  // State untuk limit berapa komentar yang ditampilkan (mirip Quora)
  const [visibleCount, setVisibleCount] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment = {
      username: "Kamu",
      content: inputText,
      time: "Baru saja",
    };

    setCommentList([newComment, ...commentList]); // Taruh komentar baru di paling atas
    setInputText("");
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3); // Tambah 3 komentar tiap diklik
  };

  return (
    <div className="w-full mt-3 pt-3 border-t border-gray-200 flex flex-col gap-4 animate-in fade-in duration-200">
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 border border-transparent focus-within:border-gray-300 transition-all">
        <input
          type="text"
          placeholder="Tambahkan komentar..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 outline-none"
        />
        {inputText.trim() && (
          <button
            type="submit"
            className="text-xs font-bold text-[#a50034] hover:underline cursor-pointer"
          >
            Kirim
          </button>
        )}
      </form>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-gray-700">Komentar</span>
      </div>

      <div className="flex flex-col gap-4">
        {commentList.length > 0 ? (
          commentList.slice(0, visibleCount).map((c, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 text-xs flex-shrink-0">
                {c.username ? c.username[0].toUpperCase() : "U"}
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900">{c.username || c.user || "Anonim"}</span>
                  <span className="text-[10px] text-gray-400">• {c.time || "1j lalu"}</span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed">{c.content || c.text}</p>
                
                <div className="flex items-center gap-4 mt-1 text-[11px] text-gray-500 font-medium">
                  <button className="hover:text-gray-800 cursor-pointer">Like</button>
                  <button className="hover:text-gray-800 cursor-pointer">Balas</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">Belum ada komentar.</p>
        )}
      </div>

      {visibleCount < commentList.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-2 mt-1 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          Lihat komentar lainnya ▾
        </button>
      )}

    </div>
  );
}