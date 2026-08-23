import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Comment_detail from "./Comment_detail";

export default function CommentSection({ postId, initialComments = [], onCommentAdded }) {
  const [commentList, setCommentList] = useState(initialComments);
  const [inputText, setInputText] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const currentUserId = localStorage.getItem("user_id");

  // Fetch Komentar + Join data User (username & avatar_url)
  const fetchComments = async () => {
    if (!postId) return;
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        users (id, username, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCommentList(data);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (postId && currentUserId) {
      setLoading(true);
      const { error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          user_id: currentUserId,
          content: inputText,
        },
      ]);
      setLoading(false);

      if (!error) {
        setInputText("");
        fetchComments(); // Reload komentar biar avatar & nama user yang baru muncul

        if(onCommentAdded){
          onCommentAdded();
        }
      }

    } else {
      // Fallback lokal jika belum pakai DB
      const newComment = {
        id: Date.now(),
        username: "Kamu",
        content: inputText,
      };
      setCommentList([newComment, ...commentList]);
      setInputText("");
    }
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
        <span className="text-xs font-bold text-gray-700">Komentar</span>
      </div>

      {/* List Komentar */}
      <div className="flex flex-col gap-4">
        {commentList.length > 0 ? (
          commentList
            .slice(0, visibleCount)
            .map((c) => <Comment_detail key={c.id || Math.random()} comment={c} />)
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">
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