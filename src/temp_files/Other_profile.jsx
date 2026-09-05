import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Focuspost from "../components/FocusPost"; // <--- SESUAIKAN PATH FILE FOCUSPOST DI SINI

export default function UserProfileModal({ userId, isOpen, onClose }) {
  const [targetUser, setTargetUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'comments' | 'votes'
  
  // Data State
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Focuspost Modal
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [focusedComment, setFocusedComment] = useState(null);
  const [focusedVote, setFocusedVote] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    async function fetchUserData() {
      setLoading(true);

      try {
        // 1. Fetch data profil user target
        const { data: userData } = await supabase
          .from("users")
          .select("id, username, avatar_url")
          .eq("id", userId)
          .single();

        setTargetUser(userData);

        // 2. Fetch Posts
        const { data: postsData } = await supabase
          .from("posts")
          .select("id, description, image_url, tag, created_at, user_id, users(id, username, avatar_url)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        setUserPosts(postsData || []);

        // 3. Fetch Comments (JOIN posts & users)
        const { data: commentsData, error: commentsErr } = await supabase
          .from("comments")
          .select("*, posts(*, users(id, username, avatar_url))")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (!commentsErr) {
          setUserComments(commentsData || []);
        } else {
          console.warn("Gagal fetch comments:", commentsErr.message);
        }

        // 4. Fetch Votes (JOIN posts & users)
        const { data: votesData, error: votesErr } = await supabase
          .from("votes")
          .select("*, posts(*, users(id, username, avatar_url))")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!votesErr) {
          setUserVotes(votesData || []);
        } else {
          console.warn("Gagal fetch votes:", votesErr.message);
        }

      } catch (err) {
        console.error("Error fetching user detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId, isOpen]);

  // Handler Buka Focuspost Modal
  const handleOpenFocusPost = (item, type) => {
    if (type === "posts") {
      setSelectedPost(item);
      setFocusedComment(null);
      setFocusedVote(null);
    } else if (type === "comments") {
      setSelectedPost(item.posts);
      setFocusedComment(item);
      setFocusedVote(null);
    } else if (type === "votes") {
      setSelectedPost(item.posts);
      setFocusedComment(null);
      setFocusedVote(item);
    }
    setIsFocusOpen(true);
  };

  const handleCloseFocusPost = () => {
    setIsFocusOpen(false);
    setSelectedPost(null);
    setFocusedComment(null);
    setFocusedVote(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
        {/* Box Modal Profil Utama */}
        <div className="bg-[#f7f7f7] border-2 border-[#a50034] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Header Modal & Tombol Close */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
            <div className="flex-1 text-center pl-6">
              <h2 className="text-xl font-bold text-[#a50034]">Profil Pengguna</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-[#a50034] font-bold text-xl transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Isi Content Modal */}
          <div className="p-6 overflow-y-auto space-y-6 flex flex-col items-center w-full">
            {loading ? (
              <div className="text-center py-10 font-semibold text-gray-500">
                Memuat profil pengguna...
              </div>
            ) : (
              <>
                {/* Header Info User */}
                <div className="bg-white border-2 border-[#a50034] rounded-xl p-3 flex items-center justify-center gap-4 w-full max-w-md shadow-xs flex-shrink-0">
                  <img 
                    src={targetUser?.avatar_url || "/assets/Dummy_photo.png"} 
                    alt="Avatar" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#a50034] bg-white flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "/assets/Dummy_photo.png";
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <h3 className="text-xl font-black text-[#a50034] leading-tight">
                      @{targetUser?.username || "Pengguna"}
                    </h3>
                  </div>
                </div>

                {/* Active Tab System Navigation */}
                <div className="w-full flex justify-center border-b border-gray-300 gap-2 pb-2">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === "posts"
                        ? "bg-[#a50034] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    Postingan
                  </button>

                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === "comments"
                        ? "bg-[#a50034] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    Komentar
                  </button>

                  <button
                    onClick={() => setActiveTab("votes")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === "votes"
                        ? "bg-[#a50034] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    Riwayat Vote
                  </button>
                </div>

                {/* Dynamic Content Berdasarkan Active Tab */}
                <div className="w-full flex flex-col items-center">
                  
                  {/* TAB 1: POSTINGAN */}
                  {activeTab === "posts" && (
                    <div className="w-full flex flex-col items-center">
                      <h4 className="text-md font-bold text-gray-800 mb-4">Riwayat Postingan</h4>
                      {userPosts.length === 0 ? (
                        <div className="text-center text-gray-500 bg-white rounded-xl border border-gray-200 p-6 w-full text-xs">
                          Pengguna ini belum pernah membuat postingan.
                        </div>
                      ) : (
                        <div className="w-full flex flex-col items-center gap-4">
                          {userPosts.map((postData) => (
                            <div 
                              key={postData.id} 
                              onClick={() => handleOpenFocusPost(postData, "posts")}
                              className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col gap-2 text-left hover:border-[#a50034] transition cursor-pointer"
                            >
                              <div className="flex justify-between items-center text-xs font-bold text-[#a50034]">
                                <span>#{postData.tag || "Umum"}</span>
                                <span className="text-[11px] text-gray-400 font-normal">
                                  {new Date(postData.created_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-800 text-sm line-clamp-2">{postData.description || "-"}</p>
                              {postData.image_url && (
                                <img 
                                  src={postData.image_url} 
                                  alt="Post Media" 
                                  className="mt-1 rounded-lg max-h-48 object-cover border border-gray-100"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: KOMENTAR */}
                  {activeTab === "comments" && (
                    <div className="w-full flex flex-col items-center">
                      <h4 className="text-md font-bold text-gray-800 mb-4">Riwayat Komentar</h4>
                      {userComments.length === 0 ? (
                        <div className="text-center text-gray-500 bg-white rounded-xl border border-gray-200 p-6 w-full text-xs">
                          Pengguna ini belum pernah memberikan komentar.
                        </div>
                      ) : (
                        <div className="w-full flex flex-col gap-3">
                          {userComments.map((comment) => (
                            <div 
                              key={comment.id}
                              onClick={() => handleOpenFocusPost(comment, "comments")}
                              className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-xs text-left hover:border-[#a50034] transition cursor-pointer"
                            >
                              <div className="flex justify-between items-center text-[11px] text-gray-400 mb-1">
                                <span className="font-bold text-[#a50034]">
                                  #{comment.posts?.tag || "Umum"}
                                </span>
                                <span>
                                  {comment.created_at ? new Date(comment.created_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  }) : ""}
                                </span>
                              </div>
                              <p className="text-gray-800 text-xs">
                                {comment.comment_text || comment.content || comment.text || comment.comment || "-"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: RIWAYAT VOTE */}
                  {activeTab === "votes" && (
                  <div className="w-full flex flex-col items-center">
                    <h4 className="text-md font-bold text-gray-800 mb-4">Riwayat Vote</h4>
                    {userVotes.length === 0 ? (
                      <div className="text-center text-gray-500 bg-white rounded-xl border border-gray-200 p-6 w-full text-xs">
                        Pengguna ini belum pernah melakukan vote.
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        {userVotes.map((vote) => (
                          <div 
                            key={vote.id}
                            /* onClick={() => handleOpenFocusPost(vote, "votes")} dan hover effect dihapus */
                            className="w-full bg-white border border-gray-200 rounded-xl p-3 shadow-xs text-left flex justify-between items-center select-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                vote.vote_type === "up" 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {vote.vote_type === "up" ? "▲ Upvote" : "▼ Downvote"}
                              </span>
                              <span className="text-xs font-bold text-[#a50034]">
                                #{vote.posts?.tag || "Umum"}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400">
                              {vote.created_at ? new Date(vote.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              }) : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* RENDER KOMPONEN FOCUS POST DARI INTERAKSI ITEM */}
      <Focuspost
        isOpen={isFocusOpen}
        onClose={handleCloseFocusPost}
        post={selectedPost}
        focused_comment={focusedComment}
        focused_vote={focusedVote}
      />
    </>
  );
}