import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Comment_detail from "./Comment_detail";
import { useStatus } from "./StatusContext";

export default function CommentSection({ comments = [], onCommentAdded, postId, postOwnerId }) {
  const [commentList, setCommentList] = useState(comments);
  const [inputText, setInputText] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const { showStatus } = useStatus();

  // SINKRONISASI: Tiap kali prop 'comments' dari Post.jsx berubah, update state lokal
  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentUserId = localStorage.getItem("user_id");

    if (!currentUserId) {
      alert("Silakan login untuk memberikan komentar!");
      return;
    }

    setLoading(true);

    // Verification check
    const { data: userData } = await supabase
      .from("users")
      .select("is_verified")
      .eq("id", currentUserId)
      .single();

    if (!userData?.is_verified)
    {
      showStatus("Akun belum diverifikasi! Silakan verifikasi untuk berkomentar.");
      setLoading(false);
      return;
    }

    // Comment to supabase
    const { error: commentError } = await supabase.from("comments").insert([
      {
        post_id: postId,
        user_id: currentUserId,
        content: inputText,
      },
    ]);

    if (commentError) {
      console.error("Gagal mengirim komentar:", commentError);
      setLoading(false);
      return;
    }

    // Create notif if commenting on people's post
    if (postOwnerId !== currentUserId) {
      await supabase.from("notifications").insert([
        {
          user_id: postOwnerId,     // The owner of the post
          actor_id: currentUserId,  // The commenter
          post_id: postId,
          type: "comment",
          is_read: false
        }
      ]);
    }

    setInputText(""); // Clear input box

    // Re-fetch data dari Supabase via parent agar data user (avatar & username) terambil lengkap
    if (onCommentAdded) {
      await onCommentAdded();
    }

    setLoading(false);
  };

  const handleLoadMore = () => setVisibleCount((prev) => prev + 3);

  return (
    <div className="w-full mt-3 pt-3 border-t border-gray-200 flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Form Input Komentar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 border border-transparent focus-within:border-gray-300 transition-all"
      >
        <input
          type="text"
          placeholder="Tambahkan komentar..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 outline-none"
        />
        {inputText.trim() && (
          <button
            type="submit"
            disabled={loading}
            className="text-xs font-bold text-[#a50034] hover:underline cursor-pointer"
          >
            {loading ? "..." : "Kirim"}
          </button>
        )}
      </form>

      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-gray-700 dark:text-white">Komentar</span>
      </div>

      {/* List Komentar */}
      <div className="flex flex-col gap-4">
        {commentList.length > 0 ? (
          commentList
            .slice(0, visibleCount)
            .map((c) => (
              <Comment_detail
                key={c.id || Math.random()}
                comment={c}
                postId={postId} // <-- DISINI PERBAIKANNYA MAS RUSDI!
                onCommentAdded={onCommentAdded} // <-- SUPAYA SETELAH BALAS BISA REFRESH
              />
            ))
        ) : (
          <p className="text-xs text-gray-400 text-center py-2 dark:text-white">
            Belum ada komentar.
          </p>
        )}
      </div>

      {/* Load More Button */}
      {visibleCount < commentList.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-2 mt-1 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          Lihat komentar lainnya ▾
        </button>
      )}
    </div>
  );
}