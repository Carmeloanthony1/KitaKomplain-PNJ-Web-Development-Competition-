import Post from "./Post";
import Vote from "./Vote";

export default function Focuspost({ 
  post, 
  focused_comment, 
  focused_vote, 
  isOpen, 
  onClose,
  onVoteSuccess
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

        {/* 1. RENDER KOMPONEN POST UTAMA (Sembunyikan aksi/vote) */}
        <Post post={post} hideaction={true} onClose={onClose} />

        {/* 2. JIKA DIKLIK DARI TAB POLLING -> PANGGIL KOMPONEN VOTE */}
        {focused_vote && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Vote 
              vote={focused_vote} 
              post={post} 
              onClose={onClose} 
              onVoteSuccess={onVoteSuccess} 
            />
          </div>
        )}

      </div>
    </div>
  );
}