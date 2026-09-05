import { createPortal } from "react-dom"; // 1. IMPORT CREATEPORTAL
import Post from "./Post";

export default function Focuspost({ 
  post, 
  focused_comment, 
  focused_vote, 
  isOpen, 
  onClose,
  onVoteSuccess,
  isFromPolling = false 
}) {
  if (!isOpen || !post) return null;

  const showVote = isFromPolling || !!focused_vote;

  return createPortal(
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-8 cursor-pointer animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-3xl relative flex flex-col my-auto cursor-default"
      >
        {/* Tombol Tutup (X) Mengambang */}
        <div className="sticky top-0 z-[99999] flex justify-end w-full mb-2 pr-1">
          <button 
            onClick={onClose} 
            className="bg-black/50 hover:bg-red-600 text-white rounded-md w-8 h-8 flex items-center justify-center transition-colors cursor-pointer shadow-lg backdrop-blur-md"
          >
            ✕
          </button>
        </div>

        <Post 
          post={post} 
          hideaction={false} 
          hideVoteButton={!showVote} 
          focused_comment={focused_comment}
          onVoteSuccess={onVoteSuccess} 
        />
      </div>
    </div>,
    document.body
  );
}