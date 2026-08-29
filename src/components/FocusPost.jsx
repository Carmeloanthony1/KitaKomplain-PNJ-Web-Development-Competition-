import Post from "./Post";

export default function Focuspost ({ post, isOpen, OnClose }) {
    if(isOpen || !post) return null;
    return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
        >
          ✕
        </button>
        <Post post={post} />
      </div>
    </div>
    );
}