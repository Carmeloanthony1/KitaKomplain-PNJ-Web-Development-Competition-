import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// --- KOMPONEN UNTUK SATU ITEM BALASAN (SUB-COMMENT) ---
function ReplyItem({ reply, onReplyClick }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const replyUser = reply?.users?.username || "Anonim";
  const replyAvatar = reply?.users?.avatar_url;
  const currentUserId = localStorage.getItem("user_id");

  // Fetch data likes untuk balasan ini
  const fetchReplyLikes = async () => {
    if (!reply?.id) return;
    const { data, error } = await supabase
      .from("likes")
      .select("id, user_id")
      .eq("comment_id", reply.id); // Jika ada tabel / kolom comment_id

    if (!error && data) {
      setLikeCount(data.length);
      if (currentUserId) {
        setIsLiked(data.some((l) => l.user_id === currentUserId));
      }
    }
  };

  useEffect(() => {
    fetchReplyLikes();
  }, [reply?.id, currentUserId]);

  const toggleReplyLike = async () => {
    if (!currentUserId) {
      alert("Silakan login untuk menyukai balasan!");
      return;
    }

    // Toggle tampilan secara lokal terlebih dahulu (Optimistic UI)
    const prevIsLiked = isLiked;
    const prevCount = likeCount;

    setIsLiked(!prevIsLiked);
    setLikeCount(prevIsLiked ? prevCount - 1 : prevCount + 1);

    if (prevIsLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("comment_id", reply.id)
        .eq("user_id", currentUserId);

      if (error) {
        // Rollback jika gagal
        setIsLiked(prevIsLiked);
        setLikeCount(prevCount);
      }
    } else {
      const { error } = await supabase.from("likes").insert([
        {
          comment_id: reply.id,
          user_id: currentUserId,
        },
      ]);

      if (error) {
        // Rollback jika gagal
        setIsLiked(prevIsLiked);
        setLikeCount(prevCount);
      }
    }
  };

  return (
    <div className="flex gap-2.5 text-sm p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
      {replyAvatar ? (
        <img
          src={replyAvatar}
          alt={replyUser}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 border border-gray-200"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
          {replyUser[0]?.toUpperCase()}
        </div>
      )}

      <div className="flex flex-col flex-1 gap-0.5">
        <span className="font-bold text-xs text-gray-800 hover:underline cursor-pointer">
          {replyUser}
        </span>

        {/* Isi balasan dengan format @username */}
        <p className="text-xs text-gray-700 leading-relaxed break-words">
          {reply.content}
        </p>

        <div className="flex items-center gap-3 mt-1 font-medium text-xs">
          {/* LIKE BUTTON FOR REPLY */}
          <button
            onClick={toggleReplyLike}
            className="focus:outline-none cursor-pointer flex items-center gap-1 group"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                isLiked
                  ? "fill-[#a50034] stroke-[#a50034]"
                  : "fill-none stroke-gray-400 group-hover:stroke-[#a50034]"
              }`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likeCount > 0 && (
              <span className="text-[10px] text-gray-500 font-semibold">
                {likeCount}
              </span>
            )}
          </button>

          {/* TOMBOL BALAS */}
          <button
            onClick={() => onReplyClick(replyUser)}
            className="text-gray-400 hover:text-[#a50034] font-semibold cursor-pointer text-[11px]"
          >
            Balas
          </button>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA COMMENT DETAIL ---
export default function Comment_detail({ comment, postId, onCommentAdded }) {
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [commentLikeCount, setCommentLikeCount] = useState(0);
  const [isComment_getcomment, setIsComment_getcomment] = useState(false);
  const [reply_text, setReply_text] = useState("");
  const [loading, setLoading] = useState(false);
  const [show_reply, setShow_reply] = useState(false);

  const username = comment?.users?.username || "Anonim";
  const avatar = comment?.users?.avatar_url;
  const content = comment?.content || "";
  const replies = comment?.replies || [];
  const currentUserId = localStorage.getItem("user_id");

  // Fetch likes untuk komentar utama
  const fetchCommentLikes = async () => {
    if (!comment?.id) return;
    const { data, error } = await supabase
      .from("likes")
      .select("id, user_id")
      .eq("comment_id", comment.id);

    if (!error && data) {
      setCommentLikeCount(data.length);
      if (currentUserId) {
        setIsCommentLiked(data.some((l) => l.user_id === currentUserId));
      }
    }
  };

  useEffect(() => {
    fetchCommentLikes();
  }, [comment?.id, currentUserId]);

  const toggleMainCommentLike = async () => {
    if (!currentUserId) {
      alert("Silakan login terlebih dahulu!");
      return;
    }

    const prevIsLiked = isCommentLiked;
    const prevCount = commentLikeCount;

    setIsCommentLiked(!prevIsLiked);
    setCommentLikeCount(prevIsLiked ? prevCount - 1 : prevCount + 1);

    if (prevIsLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("comment_id", comment.id)
        .eq("user_id", currentUserId);

      if (error) {
        setIsCommentLiked(prevIsLiked);
        setCommentLikeCount(prevCount);
      }
    } else {
      const { error } = await supabase.from("likes").insert([
        {
          comment_id: comment.id,
          user_id: currentUserId,
        },
      ]);

      if (error) {
        setIsCommentLiked(prevIsLiked);
        setCommentLikeCount(prevCount);
      }
    }
  };

  const handle_reply_click = (targetUser) => {
    setIsComment_getcomment(true);
    setReply_text(`@${targetUser} `);
  };

  const handle_sendreply = async (e) => {
    e.preventDefault();
    if (!reply_text.trim()) return;

    if (!currentUserId) {
      alert("Silahkan login terlebih dahulu!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: currentUserId,
        content: reply_text,
        parent_id: comment.id,
      },
    ]);

    if (error) {
      alert("Gagal membalas komentar: " + error.message);
    } else {
      setReply_text("");
      setIsComment_getcomment(false);
      setShow_reply(true);
      if (onCommentAdded) await onCommentAdded();
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 1. KOMENTAR UTAMA */}
      <div className="flex gap-3 text-sm p-2 rounded-xl hover:bg-slate-50 transition-colors">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 border border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {username[0]?.toUpperCase()}
          </div>
        )}

        <div className="flex flex-col flex-1 gap-1">
          <span className="font-bold text-xs text-gray-800 cursor-pointer hover:underline">
            {username}
          </span>
          <p className="text-xs text-gray-700 leading-relaxed break-words">
            {content}
          </p>

          <div className="flex items-center gap-3 mt-1 font-medium text-xs">
            {/* LIKE KOMENTAR UTAMA */}
            <button
              onClick={toggleMainCommentLike}
              className="focus:outline-none cursor-pointer flex items-center gap-1 group"
            >
              <svg
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isCommentLiked
                    ? "fill-[#a50034] stroke-[#a50034]"
                    : "fill-none stroke-gray-400 group-hover:stroke-[#a50034]"
                }`}
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {commentLikeCount > 0 && (
                <span className="text-[11px] text-gray-500 font-semibold">
                  {commentLikeCount}
                </span>
              )}
            </button>

            {/* REPLY */}
            <button
              onClick={() => handle_reply_click(username)}
              className="text-gray-500 hover:text-[#a50034] font-semibold cursor-pointer"
            >
              Balas
            </button>

            {/* TOGGLE LIHAT BALASAN */}
            {replies.length > 0 && (
              <button
                onClick={() => setShow_reply((prev) => !prev)}
                className="text-[11px] text-[#a50034] font-bold hover:underline cursor-pointer ml-auto"
              >
                {show_reply
                  ? "Sembunyikan balasan"
                  : `Lihat ${replies.length} balasan`}
              </button>
            )}
          </div>

          {/* INPUT FORM BALASAN */}
          {isComment_getcomment && (
            <form onSubmit={handle_sendreply} className="flex gap-2 mt-2">
              <input
                type="text"
                value={reply_text}
                onChange={(e) => setReply_text(e.target.value)}
                placeholder="Tulis balasan..."
                autoFocus
                className="flex-1 bg-gray-100 text-xs text-gray-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#a50034]"
              />
              <button
                type="submit"
                disabled={loading}
                className="text-xs bg-[#a50034] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#800028] cursor-pointer"
              >
                {loading ? "..." : "Kirim"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. DAFTAR BALASAN (SUB-COMMENTS) */}
      {show_reply && replies.length > 0 && (
        <div className="ml-8 pl-3 border-l-2 border-gray-200 flex flex-col gap-3">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onReplyClick={handle_reply_click}
            />
          ))}
        </div>
      )}
    </div>
  );
}