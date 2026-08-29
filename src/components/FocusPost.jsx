import Post from "./Post";

export default function Focuspost({ post, focused_comment, isOpen, onClose }) {
  if (!isOpen || !post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-100 dark:bg-[#292828] p-4 rounded-3xl shadow-2xl w-full max-w-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Postingan dengan focused_comment + passing onClose */}
        <div className="w-full">
          <Post 
            post={post} 
            hideaction={true} 
            focused_comment={focused_comment} 
            onClose={onClose} 
          />
        </div>
      </div>
    </div>
  );
}