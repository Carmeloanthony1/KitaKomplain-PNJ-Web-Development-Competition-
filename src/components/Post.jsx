import { useState, useEffect } from "react";
import Share_post from "./Share_post";
import CommentSection from "./Comment";
import { supabase } from "../supabaseClient";

export default function Post({ post }) {
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isshare_open, setIsshare_open] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  const [isPop, setIsPop] = useState(false);

  const currentUserId = localStorage.getItem("user_id");

  if (!post) return null;

  const username = post.users?.username || "Unknown";
  const avatar = post.users?.avatar_url || "/default-avatar.png";

  const fetchLikes = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select(`id, user_id, users (id, username, avatar_url)`)
      .eq("post_id", post.id);

    if (!error && data) {
      setLikes(data);
      const userHasLiked = data.some((like) => like.user_id === currentUserId);
      setIsLiked(userHasLiked);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [post.id, currentUserId]);

  // Pemicu pop up like
  const triggerPop = () => {
    setIsPop(true);
    setTimeout(() => {
      setIsPop(false);
    }, 200); 
  };

  const toggleLike = async () => {
    if (!currentUserId) {
      alert("Silakan login untuk memberikan like!");
      return;
    }

    // Jalankan efek mekar/pop instan pas tombol dipencet
    triggerPop();

    if (isLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);

      if (!error) {
        setIsLiked(false);
        fetchLikes();
      }
    } else {
      const { error } = await supabase.from("likes").insert([
        {
          post_id: post.id,
          user_id: currentUserId,
        },
      ]);

      if (!error) {
        setIsLiked(true);
        fetchLikes();
      }
    }
  };

  const handleToggleComment = () => setIsCommentOpen((prev) => !prev);
  const handle_share = () => setIsshare_open(true);

  return (
    <div className="min-w-2xl w-full bg-slate-50/70 p-4 rounded-2xl flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 border-4 border-[#a50034]/50 rounded-lg bg-white shadow-xs">
        <div className="flex items-start gap-3">
          <img
            src={avatar}
            alt={username}
            className="w-10 h-10 mt-1 rounded-full object-cover flex-shrink-0"
          />

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{username}</span>
                <span className="text-[#a50034] font-bold text-xs">#{post.title}</span>
              </div>
              <button className="text-2xl mb-1 cursor-pointer">...</button>
            </div>

            <p className="text-gray-900 text-sm leading-relaxed break-words">
              {post.description}
            </p>

            {post.image_url && (
              <img
                src={post.image_url}
                alt="post"
                className="max-h-96 rounded-lg object-cover mt-2"
              />
            )}

            <div className="flex justify-between gap-2 mt-2 items-center">
              <div className="flex flex-row gap-3 items-center">
                
                {/* Like button*/}
                <div className="flex items-center gap-2">
                  <button onClick={toggleLike} className="focus:outline-none cursor-pointer">
                    <svg
                      style={{
                        transform: isPop ? "scale(1.3)" : "scale(1)",
                        transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                      }}
                      className={`w-9 h-9 ${
                        isLiked
                          ? "fill-[#a50034] stroke-[#a50034]"
                          : "fill-none stroke-[#a50034]"
                      }`}
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Jumlah like */}
                  {likes.length > 0 && (
                    <span
                      onClick={() => setShowLikers(true)}
                      style={{
                        transform: isPop ? "scale(1.6)" : "scale(1)",
                        transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        display: "inline-block"
                      }}
                      className="font-bold text-sm text-[#a50034] cursor-pointer hover:underline"
                    >
                      {likes.length}
                    </span>
                  )}
                </div>

                {/* COMMENT */}
                <button onClick={handleToggleComment} className="focus:outline-none cursor-pointer">
                  <svg
                    className="w-9 h-9 fill-[#a50034] hover:scale-110 transition-transform cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                  >
                    <path d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z" />
                  </svg>
                </button>

                {/* SHARE */}
                <button onClick={handle_share} className="focus:outline-none cursor-pointer">
                  <svg
                    className="w-9 h-9 stroke-[#a50034] fill-none hover:scale-110 transition-transform cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="m5 12l-.604-5.437C4.223 5.007 5.825 3.864 7.24 4.535l11.944 5.658c1.525.722 1.525 2.892 0 3.614L7.24 19.466c-1.415.67-3.017-.472-2.844-2.028zm0 0h7"
                    />
                  </svg>
                </button>
              </div>

              <button className="bg-red-50 p-2 leading-relaxed rounded-lg border-2 border-[#a50034] font-semibold cursor-pointer">
                Polling
              </button>
            </div>

            {isCommentOpen && <CommentSection comments={post.comments || []} />}
          </div>
        </div>
      </div>

      {isshare_open && <Share_post post={post} onclose={() => setIsshare_open(false)} />}

      {/* POPUP DAFTAR PENYUKA */}
      {showLikers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg max-w-sm w-full shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg text-gray-800">Menyukai postingan ini</h3>
              <button
                onClick={() => setShowLikers(false)}
                className="text-gray-500 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-3">
              {likes.map((likeItem) => (
                <div key={likeItem.id} className="flex items-center gap-3">
                  <img
                    src={likeItem.users?.avatar_url || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm text-gray-800">
                    {likeItem.users?.username || "Pengguna"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}