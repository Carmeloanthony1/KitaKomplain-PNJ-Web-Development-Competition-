import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";
import { useStatus } from "./StatusContext";

export default function VoteModal({ post, onClose, onVoteSuccess }) {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showStatus } = useStatus();

  const getActiveUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || localStorage.getItem("user_id");
  };

  const fetchVoteData = useCallback(async (isInitial = false) => {
    if (!post?.id) return;
    if (isInitial) setLoading(true);

    const activeUserId = await getActiveUserId();

    const { data: voteData, error: voteErr } = await supabase
      .from("votes")
      .select("vote_type, user_id")
      .eq("post_id", post.id);

    if (voteErr) {
      console.error("Gagal mengambil data vote:", voteErr.message);
    } else if (voteData) {
      const up = voteData.filter((v) => v.vote_type === "up").length;
      const down = voteData.filter((v) => v.vote_type === "down").length;
      setUpvotes(up);
      setDownvotes(down);

      if (activeUserId) {
        const myVote = voteData.find((v) => String(v.user_id) === String(activeUserId));
        setUserVote(myVote ? myVote.vote_type : null);
      }
    }

    if (isInitial) setLoading(false);
  }, [post?.id]);

  useEffect(() => {
    fetchVoteData(true);
  }, [fetchVoteData]);

  const handleClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleVote = async (type) => {
    const activeUserId = await getActiveUserId();

    if (!activeUserId) {
      showStatus("Silakan login terlebih dahulu!");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_verified")
      .eq("id", activeUserId)
      .single();

    if (userError || !userData?.is_verified) {
      showStatus("Akun belum diverifikasi! Anda tidak dapat mengikuti voting ini.");
      return;
    }

    if (userVote === type) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", activeUserId);

      if (error) {
        showStatus("Gagal menghapus vote: " + error.message, "error");
        return;
      }
    } else {
      const { error } = await supabase.from("votes").upsert(
        [
          {
            post_id: post.id,
            user_id: activeUserId,
            vote_type: type,
          },
        ],
        { onConflict: "post_id, user_id" }
      );

      if (error) {
        showStatus("Gagal menyimpan vote: " + error.message, "error");
        return;
      }
    }

    await fetchVoteData(false);

    if (typeof onVoteSuccess === "function") {
      await onVoteSuccess();
    }

    handleClose();
  };

  if (!post) return null;

  return createPortal(
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      style={{ pointerEvents: "auto" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-white dark:bg-[#1e1e1e] border-4 border-[#a50034]/50 dark:border-[#f1ece1]/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-5 transition-colors"
        style={{ pointerEvents: "auto" }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup modal"
          className="absolute top-3 right-3 z-50 text-gray-500 hover:text-black dark:text-[#f1ece1] hover:bg-gray-100 dark:hover:bg-neutral-800 w-10 h-10 flex items-center justify-center rounded-full text-2xl font-black transition-colors cursor-pointer select-none"
        >
          ✕
        </button>

        {loading ? (
          <div className="py-12 font-semibold text-gray-600 dark:text-gray-300">
            Memperbaharui Data voting...
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <span className="bg-[#a50034]/10 dark:bg-white/10 text-[#a50034] dark:text-[#f1ece1] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Vote Postingan
              </span>
              <h2 className="text-xl font-extrabold text-gray-800 dark:text-[#f1ece1]">
                Apakah issue ini penting?
              </h2>
            </div>

            <div className="w-full bg-red-50 dark:bg-[#252525] border border-red-200 dark:border-neutral-700 py-3 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Dukungan Saat Ini</p>
              <div className="text-lg font-black text-[#a50034] dark:text-[#f1ece1] mt-1 flex items-center justify-center gap-2">
                {upvotes}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
                <span className="text-gray-300 dark:text-neutral-600 mx-1">|</span>
                {downvotes}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 20l8-8h-5V4h-6v8H4z" />
                </svg>
              </div>
            </div>

            <div className="flex gap-3 w-full justify-center">
              <button
                type="button"
                onClick={() => handleVote("up")}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  userVote === "up"
                    ? "bg-[#a50034] text-white border-[#a50034] shadow-md scale-105"
                    : "bg-white dark:bg-transparent text-[#a50034] dark:text-[#f1ece1] border-[#a50034] dark:border-[#f1ece1] hover:bg-red-50 dark:hover:bg-white/10"
                }`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
                Setuju
              </button>

              <button
                type="button"
                onClick={() => handleVote("down")}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  userVote === "down"
                    ? "bg-[#a50034] text-white border-[#a50034] shadow-md scale-105"
                    : "bg-white dark:bg-transparent text-[#a50034] dark:text-[#f1ece1] border-[#a50034] dark:border-[#f1ece1] hover:bg-red-50 dark:hover:bg-white/10"
                }`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 20l8-8h-5V4h-6v8H4z" />
                </svg>
                Tidak Setuju
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}