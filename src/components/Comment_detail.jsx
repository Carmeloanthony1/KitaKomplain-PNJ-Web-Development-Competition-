import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useStatus } from "./StatusContext";

// --- KOMPONEN UNTUK ITEM BALASAN (SUB-COMMENT) ---
function ReplyItem({ reply, onReplyClick, hideaction = false }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { showStatus } = useStatus();

  const replyUser = reply?.users?.username || "Anonim";
  const replyAvatar = reply?.users?.avatar_url;
  const currentUserId = localStorage.getItem("user_id");

  const fetchReplyLikes = async () => {
    if (!reply?.id) return;
    const { data, error } = await supabase
      .from("likes")
      .select("id, user_id")
      .eq("comment_id", reply.id);

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
    if (hideaction) return; // 🔒 MATIKAN FUNGSI LIKE BALASAN PAS ADMIN

    if (!currentUserId) {
      showStatus("Silakan login untuk menyukai balasan!", "error");
      return;
    }

    // Verification check
    const { data: userData } = await supabase
      .from("users")
      .select("is_verified")
      .eq("id", currentUserId)
      .single();

    if (!userData?.is_verified)
    {
      showStatus("Akun belum diverifikasi! Tindakan ini tidak diizinkan.");
      return;
    }

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
        setIsLiked(prevIsLiked);
        setLikeCount(prevCount);
      }
    } else {
      const { error } = await supabase.from("likes").insert([
        {
          user_id: currentUserId,
          comment_id: reply.id,
        },
      ]);

      if (error) {
        setIsLiked(prevIsLiked);
        setLikeCount(prevCount);
      }
    }
  };

  return (
    <div className="flex gap-2.5 text-sm p-1.5 rounded-lg">
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
        <span className="font-bold text-xs text-gray-800 dark:text-gray-200 hover:underline cursor-pointer">
          {replyUser}
        </span>

        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed break-words">
          {reply.content}
        </p>

        <div className="flex items-center gap-3 mt-1 font-medium text-xs">
          {/* LIKE BUTTON BALASAN (TETAP ADA, TAPI DISABLED) */}
          <button
            onClick={toggleReplyLike}
            disabled={hideaction}
            className={`focus:outline-none flex items-center gap-1 group ${
              hideaction ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${
                hideaction ? "" : "group-hover:scale-110"
              } ${
                isLiked
                  ? "fill-[#a50034] stroke-[#a50034]"
                  : `fill-none stroke-gray-400 ${hideaction ? "" : "group-hover:stroke-[#a50034]"}`
              }`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likeCount > 0 && (
              <span
                className={`text-[11px] font-bold transition-colors ${
                  isLiked
                    ? "text-[#a50034] dark:text-[#a50034]"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {likeCount}
              </span>
            )}
          </button>

          {/* TOMBOL BALAS (TETAP ADA, TAPI DISABLED) */}
          <button
            onClick={() => !hideaction && onReplyClick(replyUser)}
            disabled={hideaction}
            className={`font-semibold ${
              hideaction
                ? "text-gray-400 opacity-60 cursor-default"
                : "text-gray-400 hover:text-[#a50034] cursor-pointer"
            }`}
            title={hideaction ? "Tidak dapat membalas di mode admin" : "Balas komentar"}
          >
            <svg
              className="w-4 h-4 fill-current transition-colors"
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

// --- KOMPONEN UTAMA COMMENT DETAIL ---
export default function Comment_detail({ comment, postId, hideaction = false }) {
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [commentLikeCount, setCommentLikeCount] = useState(0);
  const [isComment_getcomment, setIsComment_getcomment] = useState(false);
  const [reply_text, setReply_text] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [show_reply, setShow_reply] = useState(true);
  const [repliesList, setRepliesList] = useState(comment?.replies || []);

  const { showStatus } = useStatus();

  const username = comment?.users?.username || "Anonim";
  const avatar = comment?.users?.avatar_url;
  const content = comment?.content || "";
  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    if (comment?.replies) {
      setRepliesList(comment.replies);
    }
  }, [comment?.replies]);

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
    if (hideaction) return; // 🔒 MATIKAN FUNGSI LIKE KOMENTAR PAS ADMIN

    if (!currentUserId) {
      showStatus("Silakan login terlebih dahulu!", "error");
      return;
    }

    // Verification check
    const { data: userData } = await supabase
      .from("users")
      .select("is_verified")
      .eq("id", currentUserId)
      .single();

    if (!userData?.is_verified)
    {
      showStatus("Akun belum diverifikasi! Tindakan ini tidak diizinkan.");
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
    if (hideaction) return; // 🔒 MATIKAN KLIK BALAS PAS ADMIN
    setIsComment_getcomment(true);
    setReply_text(`@${targetUser} `);
  };

  const handle_sendreply = async (e) => {
    e.preventDefault();
    if (hideaction) return; // 🔒 MATIKAN KIRIM BALASAN PAS ADMIN
    if (!reply_text.trim()) return;

    if (!currentUserId) {
      showStatus("Silakan login terlebih dahulu!", "error");
      return;
    }

    // Verification check
    const { data: userData } = await supabase
      .from("users")
      .select("is_verified")
      .eq("id", currentUserId)
      .single();

    if (!userData?.is_verified)
    {
      showStatus("Akun belum diverifikasi! Tindakan ini tidak diizinkan.");
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          user_id: currentUserId,
          content: reply_text,
          parent_id: comment.id,
        },
      ])
      .select(`
        id, 
        content, 
        created_at, 
        user_id, 
        post_id, 
        parent_id, 
        users (username, avatar_url)
      `)
      .single();

    if (error) {
      showStatus("Gagal membalas komentar: " + error.message, "error");
    } else if (data) {
      setRepliesList((prev) => [...prev, data]);
      setReply_text("");
      setIsComment_getcomment(false);
      setShow_reply(true);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 shadow-sm transition-colors">
      <div className="flex gap-3 text-sm p-2 rounded-xl">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 border border-gray-200 dark:border-zinc-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {username[0]?.toUpperCase()}
          </div>
        )}

        <div className="flex flex-col flex-1 gap-1">
          <span className="font-bold text-xs text-gray-800 dark:text-gray-100 cursor-pointer hover:underline">
            {username}
          </span>
          <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed break-words">
            {content}
          </p>

          <div className="flex items-center gap-3 mt-1 font-medium text-xs">
            {/* LIKE KOMENTAR UTAMA (DISABLED DI ADMIN) */}
            <button
              onClick={toggleMainCommentLike}
              disabled={hideaction}
              className={`focus:outline-none flex items-center gap-1 group ${
                hideaction ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  hideaction ? "" : "group-hover:scale-110"
                } ${
                  isCommentLiked
                    ? "fill-[#a50034] stroke-[#a50034]"
                    : `fill-none stroke-gray-400 ${hideaction ? "" : "group-hover:stroke-[#a50034]"}`
                }`}
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {commentLikeCount > 0 && (
                <span
                  className={`text-[11px] font-bold transition-colors ${
                    isCommentLiked
                      ? "text-[#a50034] dark:text-[#a50034]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {commentLikeCount}
                </span>
              )}
            </button>

            {/* TOMBOL BALAS (TETAP ADA, TAPI DISABLED) */}
            <button
              onClick={() => handle_reply_click(username)}
              disabled={hideaction}
              className={`font-semibold ${
                hideaction
                  ? "text-gray-400 opacity-60 cursor-default"
                  : "text-gray-400 hover:text-[#a50034] cursor-pointer"
              }`}
              title={hideaction ? "Tidak dapat membalas di mode admin" : "Balas komentar"}
            >
              <svg
                className="w-4 h-4 fill-current transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z" />
              </svg>
            </button>

            {/* TOGGLE LIHAT BALASAN */}
            {repliesList.length > 0 && (
              <button
                onClick={() => setShow_reply((prev) => !prev)}
                className="text-[11px] text-[#a50034] font-bold hover:underline cursor-pointer ml-auto"
              >
                {show_reply
                  ? "Sembunyikan balasan"
                  : `Lihat ${repliesList.length} balasan`}
              </button>
            )}
          </div>

          {/* FORM BALASAN */}
          {!hideaction && isComment_getcomment && (
            <form onSubmit={handle_sendreply} className="flex gap-2 mt-2">
              <input
                type="text"
                value={reply_text}
                onChange={(e) => setReply_text(e.target.value)}
                placeholder="Tulis balasan..."
                autoFocus
                className="flex-1 bg-white dark:bg-zinc-700 text-xs text-gray-800 dark:text-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#a50034]"
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

      {/* DAFTAR BALASAN */}
      {show_reply && repliesList.length > 0 && (
        <div className="ml-8 pl-3 border-l-2 border-slate-300 dark:border-zinc-700 flex flex-col">
          {repliesList.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onReplyClick={handle_reply_click}
              hideaction={hideaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}