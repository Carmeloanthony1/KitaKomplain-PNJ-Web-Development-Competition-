import Post from "./Post";
import Comment from "./Comment";
import Vote from "./Vote";

export default function Focuspost({ 
  post, 
  focused_comment, 
  focused_vote, 
  isOpen, 
  onClose,
  onVoteSuccess // 1. TANGKAP PROP REFRESH DI SINI
}) {
  if (!isOpen || !post) return null;

  return (
    // Backdrop / Overlay Hitam
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 cursor-pointer"
    >
      {/* Kontainer Modal */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-[#1e1e1e] w-full max-w-xl rounded-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh] cursor-default"
      >
        {/* Tombol Close ✕ */}
        <button 
          onClick={onClose} 
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl font-bold cursor-pointer z-20 p-1"
        >
          ✕
        </button>

        {/* 1. RENDER KOMPONEN POST UTAMA */}
        <Post post={post} />

        {/* 2. JIKA DIKLIK DARI TAB POLLING -> PANGGIL KOMPONEN VOTE */}
        {focused_vote && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {/* 2. OPER ONVOTESUCCESS KE KOMPONEN VOTE */}
            <Vote 
              vote={focused_vote} 
              post={post} 
              onClose={onClose} 
              onVoteSuccess={onVoteSuccess} 
            />
          </div>
        )}

        {/* 3. JIKA DIKLIK DARI TAB COMMENT -> PANGGIL KOMPONEN COMMENT */}
        {focused_comment && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Comment comment={focused_comment} isFocused={true} />
          </div>
        )}

      </div>
    </div>
  );
}