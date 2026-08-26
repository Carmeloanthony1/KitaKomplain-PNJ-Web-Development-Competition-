import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Comment_detail({ comment, postId, onCommentAdded }) {
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [isComment_getcomment, setIsComment_getcomment] = useState(false);
  const [reply_text, setReply_text] = useState("");
  const [loading, setLoading] = useState(false);
  const [show_reply, setShow_reply] = useState(false);

  const username = comment?.users?.username || "Anonim";
  const avatar = comment?.users?.avatar_url;
  const content = comment?.content || "";
  const replies = comment?.replies || [];

  const handle_reply_click = (targetUser) => {
    setIsComment_getcomment(true);
    setReply_text(`@${targetUser} `);
  };

  const handle_sendreply = async (e) => {
    e.preventDefault();
    if (!reply_text.trim()) return;

    const currentUserID = localStorage.getItem("user_id");
    if (!currentUserID) {
      alert("Silahkan login terlebih dahulu!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: currentUserID,
        content: reply_text,
        parent_id: comment.id, // Parent selalu terhubung ke komentar utama ini
      },
    ]);

    if (error) {
      alert("Gagal membalas komentar: " + error.message);
    } else {
      setReply_text("");
      setIsComment_getcomment(false);
      setShow_reply(true); // Otomatis buka balasan setelah ngirim
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
            {/* LIKE */}
            <button
              onClick={() => setIsCommentLiked((prev) => !prev)}
              className="focus:outline-none cursor-pointer"
            >
              <svg
                className={`w-4 h-4 ${
                  isCommentLiked
                    ? "fill-[#a50034] stroke-[#a50034]"
                    : "fill-none stroke-gray-400 hover:stroke-[#a50034]"
                }`}
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
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

      {/* 2. FLAT SUB-COMMENTS / BALASAN (MAX INDENT 1 TAB KE KANAN) */}
      {show_reply && replies.length > 0 && (
        <div className="ml-8 pl-3 border-l-2 border-gray-200 flex flex-col gap-3">
          {replies.map((reply) => {
            const replyUser = reply?.users?.username || "Anonim";
            const replyAvatar = reply?.users?.avatar_url;

            return (
              <div
                key={reply.id}
                className="flex gap-2.5 text-sm p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
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

                  {/* Isi balasan dengan format @username jika ada */}
                  <p className="text-xs text-gray-700 leading-relaxed break-words">
                    {reply.content}
                  </p>

                  <div className="flex items-center gap-3 mt-1 font-medium text-xs">
                    {/* Tombol Balas di sub-comment (otomatis mention ke pembuat sub-comment) */}
                    <button
                      onClick={() => handle_reply_click(replyUser)}
                      className="text-gray-400 hover:text-[#a50034] font-semibold cursor-pointer text-[11px]"
                    >
                      Balas
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}