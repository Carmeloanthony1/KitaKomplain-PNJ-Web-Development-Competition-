// CommentSection.jsx
import { useState } from "react";

export default function CommentSection({ comments = [] }) {
  const [commentList, setCommentList] = useState(comments);
  const [inputText, setInputText] = useState("");
  const [visibleCount, setVisibleCount] = useState(2);
  const [liked_comment, setLiked_comment] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment = {
      username: "Kamu",
      content: inputText,
      time: "Baru saja",
    };

    setCommentList([newComment, ...commentList]);
    setInputText("");
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const toggleLike_comment = (index) => {
    setLiked_comment((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
          commentList.slice(0, visibleCount).map((c, i) => {
            const isCommentLiked = !!liked_comment[i];

            return (
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
                  
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500 font-medium">
                    <button 
                      onClick={() => toggleLike_comment(i)} 
                      className="focus:outline-none cursor-pointer flex items-center gap-1"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform hover:scale-110 ${
                          isCommentLiked 
                            ? "fill-[#a50034] stroke-[#a50034]" 
                            : "fill-none stroke-gray-500 hover:stroke-[#a50034]"
                        }`} 
                        viewBox="0 0 24 24" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    <button className="focus:outline-none cursor-pointer">
                      <svg className="w-4 h-4 fill-none stroke-gray-500 hover:scale-110 transition-transform cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <path d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"/>
                      </svg>
                    </button>                  
                  </div>
                </div>
              </div>
            );
          })
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