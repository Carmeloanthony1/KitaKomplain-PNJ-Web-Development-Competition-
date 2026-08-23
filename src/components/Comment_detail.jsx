import { useState } from "react";

export default function Comment_detail({ comment }) {
  const [isCommentLiked, setIsCommentLiked] = useState(false);

  // Ambil data user dari relasi Supabase (atau fallback jika belum ada)
  const username = comment.users?.username || comment.username 
  const avatar = comment.users?.avatar_url || comment.avatar;
  const content = comment.content || comment.comment_text || comment.text;

  return (
    <div className="flex gap-3 text-sm">
      {/* Avatar User */}
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600 text-xs flex-shrink-0">
          {username[0]?.toUpperCase()}
        </div>
      )}

      {/* Content Komentar */}
      <div className="flex flex-col flex-1 gap-1">
        <span className="font-bold text-xs text-gray-900">{username}</span>
        <p className="text-xs text-gray-800 leading-relaxed break-words">
          {content}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500 font-medium">
          <button
            onClick={() => setIsCommentLiked((prev) => !prev)}
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
            <svg
              className="w-4 h-4 fill-none stroke-gray-500 hover:scale-110 transition-transform cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
            >
              <path d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}