import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function VoteModal({ post, onClose }) {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = localStorage.getItem("user_id");

  const fetchVoteData = async () => {
    if (!post?.id) return;
    setLoading(true);

    const { data: voteData, error: voteErr } = await supabase
      .from("votes")
      .select("vote_type, user_id")
      .eq("post_id", post.id);

    if (!voteErr && voteData) {
      const up = voteData.filter((v) => v.vote_type === "up").length;
      const down = voteData.filter((v) => v.vote_type === "down").length;
      setUpvotes(up);
      setDownvotes(down);

      const myVote = voteData.find((v) => v.user_id === currentUserId);
      setUserVote(myVote ? myVote.vote_type : null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchVoteData();
  }, [post?.id]);

  const handleVote = async (type) => {
    if (!currentUserId) {
      alert("Silakan login untuk memberikan vote!");
      return;
    }

    if (userVote === type) {
      await supabase
        .from("votes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
    } else {
      await supabase.from("votes").upsert(
        [
          {
            post_id: post.id,
            user_id: currentUserId,
            vote_type: type,
          },
        ],
        { onConflict: "post_id, user_id" }
      );
    }

    fetchVoteData();
  };

  if (!post) return null;

  return (
    // Click di background overlay bakal nutup modal
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
    >
      {/* stopPropagation biar click di dalam box modal ga ikutan nutup modal */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-white border-4 border-[#a50034]/50 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-5"
      >
        
        {/* TOMBOL CLOSE (X) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {loading ? (
          <div className="py-12 font-semibold text-gray-600">
            Memuat data polling...
          </div>
        ) : (
          <>
            {/* Pertanyaan */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="bg-[#a50034]/10 text-[#a50034] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Polling Postingan
              </span>
              <h2 className="text-xl font-extrabold text-gray-800">
                Apakah issue ini penting?
              </h2>
            </div>

            {/* Total Vote */}
            <div className="w-full bg-red-50 border border-red-200 py-3 rounded-xl">
              <p className="text-xs text-gray-600 font-medium">Total Dukungan Saat Ini</p>
              <div className="text-lg font-black text-[#a50034] mt-1 flex items-center justify-center gap-2">
                {upvotes} <span className="text-xs font-bold text-gray-500">Setuju</span> 
                <span className="text-gray-300 mx-1">|</span> 
                {downvotes} <span className="text-xs font-bold text-gray-500">Tidak Setuju</span>
              </div>
            </div>

            {/* Tombol Up/Down */}
            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={() => handleVote("up")}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  userVote === "up"
                    ? "bg-[#a50034] text-white border-[#a50034] shadow-md scale-105"
                    : "bg-white text-[#a50034] border-[#a50034] hover:bg-red-50"
                }`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
                Sangat Penting
              </button>

              <button
                onClick={() => handleVote("down")}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                  userVote === "down"
                    ? "bg-gray-800 text-white border-gray-800 shadow-md scale-105"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 20l8-8h-5V4h-6v8H4z" />
                </svg>
                Kurang Penting
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}