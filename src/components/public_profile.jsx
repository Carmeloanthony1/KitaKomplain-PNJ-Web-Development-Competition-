import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Focuspost from "../components/FocusPost";

export default function PublicProfile() {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("user_id");

  // Jika yang di-klik adalah ID diri sendiri, lempar ke /profile pribadi
  useEffect(() => {
    if (targetUserId === currentUserId) {
      navigate("/profile", { replace: true });
    }
  }, [targetUserId, currentUserId, navigate]);

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userComment, setUserComment] = useState([]);
  const [userVote, setUserVote] = useState([]);
  const [pollsCount, setPollsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // State Tab
  const [activeTab, setActiveTab] = useState("posts");

  // Focus Post Modal
  const [selectedpost, setSelectedpost] = useState(null);
  const [selectedcomment, setSelectedcomment] = useState(null);
  const [selectedvote, setSelectedvote] = useState(null);
  const [isfocusopen, setIsfocusopen] = useState(false);

  const fetchPublicProfile = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);

    // 1. Fetch Data User
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, bio, avatar_url, is_anonim_mode")
      .eq("id", targetUserId)
      .single();

    if (userError) {
      console.error("Gagal mengambil data profile publik: ", userError.message);
    } else {
      setUserData(user);
    }

    // Hanya fetch aktivitas publik jika user TIDAK dalam mode anonim
    if (user && !user.is_anonim_mode) {
      // 2. Fetch Posts
      const { data: publicPosts, error: postError } = await supabase
        .from("posts")
        .select(`id, description, image_url, tag, is_anonim_mode, created_at, user_id, users (username, avatar_url)`)
        .eq("user_id", targetUserId)
        .neq("is_anonim_mode", true)
        .order("created_at", { ascending: false });

      if (!postError) setPosts(publicPosts || []);

      // 3. Fetch Comments
      const { data: commentsData, error: commentError } = await supabase
        .from("comments")
        .select(`
          id, content, created_at, post_id, 
          posts ( id, description, image_url, tag, created_at, user_id, users (username, avatar_url) )
        `)
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (!commentError) setUserComment(commentsData || []);

      // 4. Fetch Votes / Polling
      const { data: voteData, error: voteError, count } = await supabase
        .from("votes")
        .select(
          `
          id, vote_type, created_at, post_id, 
          posts ( id, tag, description, image_url, created_at, user_id, users (username, avatar_url) )
        `,
          { count: "exact" }
        )
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (!voteError && voteData) {
        setUserVote(voteData);
        setPollsCount(count ?? voteData.length);
      }
    }

    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchPublicProfile();
  }, [fetchPublicProfile]);

  const handlePostClick = (item) => {
    const formattedPost = {
      ...item,
      users: item.users || {
        username: userData?.username || "User",
        avatar_url: userData?.avatar_url,
      },
    };
    setSelectedpost(formattedPost);
    setSelectedcomment(null);
    setSelectedvote(null);
    setIsfocusopen(true);
  };

  const handleCommentClick = (item) => {
    if (!item.posts) return;

    const formattedPost = {
      ...item.posts,
      users: item.posts.users || {
        username: userData?.username || "User",
        avatar_url: userData?.avatar_url,
      },
    };

    setSelectedpost(formattedPost);
    setSelectedcomment(item);
    setSelectedvote(null);
    setIsfocusopen(true);
  };

  const handleVoteClick = async (voteItem) => {
    if (!voteItem) return;

    if (voteItem.posts) {
      const formattedPost = {
        ...voteItem.posts,
        users: voteItem.posts.users || {
          username: userData?.username || "User",
          avatar_url: userData?.avatar_url,
        },
      };
      setSelectedpost(formattedPost);
      setSelectedcomment(null);
      setSelectedvote(voteItem);
      setIsfocusopen(true);
      return;
    }

    if (voteItem.post_id) {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, users (id, username, avatar_url)`)
        .eq("id", voteItem.post_id)
        .single();

      if (!error && data) {
        setSelectedpost(data);
        setSelectedcomment(null);
        setSelectedvote(voteItem);
        setIsfocusopen(true);
      }
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading Profile...</div>;
  }

  if (!userData) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Pengguna tidak ditemukan.</div>;
  }

  const isAnonim = userData.is_anonim_mode;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#292828] text-gray-900 dark:text-[#f1ece1] py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:scale-105 transition-colors cursor-pointer"
          >
            <svg
              className="w-6 h-6 stroke-[#a50034] dark:stroke-[#f1ece1]"
              fill="none"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-[#a50034] dark:text-[#f1ece1]">User Profile</h1>
        </div>

        {/* Profile Card Publik */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-32 bg-[#800020] dark:bg-[#f1ece1] w-full"></div>

          <div className="px-8 pb-8 relative">
            
            {/* Foto Profil */}
            <div className="-mt-14 mb-4 relative inline-block">
              <div className="w-28 h-28 border-4 border-white dark:border-[#1e1e1e] rounded-full shadow-md bg-white dark:bg-[#1e1e1e] overflow-hidden flex items-center justify-center">
                {isAnonim ? (
                  <div className="w-full h-full rounded-full bg-gray-800 text-white font-bold text-3xl flex items-center justify-center">
                    <svg className = "w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                      <path d="M267 48C230.6 48 209.2 106.3 198.7 160L168 160C154.7 160 144 170.7 144 184C144 197.3 154.7 208 168 208L192 208L192 240C192 257 195.3 273.2 201.3 288L192 288L192 288L171.5 288C156.3 288 144 300.3 144 315.5C144 318.5 144.5 321.4 145.4 324.2L174.3 410.8C136.2 443.6 112 492.1 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 492.1 503.8 443.6 465.7 410.9L494.6 324.3C495.5 321.5 496 318.6 496 315.6C496 300.4 483.7 288.1 468.5 288.1L448 288.1L448 288.1L438.7 288.1C444.7 273.3 448 257.1 448 240.1L448 208.1L472 208.1C485.3 208.1 496 197.4 496 184.1C496 170.8 485.3 160.1 472 160.1L441.3 160.1C430.9 106.4 409.4 48.1 373 48.1C363.4 48.1 354 52 345.5 56.3C337.3 60.4 327.1 64.1 320 64.1C312.9 64.1 302.7 60.4 294.5 56.3C286 51.9 276.6 48 267 48zM360.7 532.4L335.9 461.5L363.8 429C366.5 425.8 368 421.8 368 417.6C368 407.9 360.2 400.1 350.5 400.1L289.5 400.1C279.8 400.1 272 407.9 272 417.6C272 421.8 273.5 425.8 276.2 429L304.1 461.5L279.3 532.4L222.3 352L258 352C276.4 362.2 297.5 368 320 368C342.5 368 363.6 362.2 382 352L417.7 352L360.7 532.4zM320 320C285.3 320 255.8 297.9 244.7 267C250.4 270.2 257 272 264 272L276.4 272C292.9 272 307.5 261.4 312.7 245.8C315 238.8 324.9 238.8 327.2 245.8C332.4 261.4 347.1 272 363.5 272L375.9 272C382.9 272 389.5 270.2 395.2 267C384.1 297.9 354.6 320 319.9 320z"/>
                    </svg>
                  </div>
                ) : userData.avatar_url ? (
                  <img
                    src={userData.avatar_url}
                    alt="Foto profil"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-700 text-white font-bold text-3xl flex items-center justify-center uppercase">
                    {(userData.username || "U").charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Nama & Span Mode Anonim */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f1ece1]">
                {isAnonim ? "Pengguna Anonim" : userData.username || "User"}
              </h2>

              {/* SPAN NOTIFIKASI ANONIM */}
              {isAnonim && (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl inline-block max-w-md">
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      pengguna ini mengaktifkan mode anonim untuk post comment dan vote
                  </span>
                </div>
              )}
            </div>

            {/* STAT BADGES & DESKRIPSI (HANYA TAMPIL JIKA BUKAN ANONIM) */}
            {!isAnonim && (
              <>
                <div className="my-5 inline-flex items-center gap-6 bg-gray-50/80 dark:bg-[#f1ece1] px-6 py-2.5 rounded-xl border border-gray-100 text-sm">
                  <div>
                    <span className="font-bold text-gray-900">{posts.length}</span>{" "}
                    <span className="text-gray-500 dark:text-gray-900 font-medium">Posts</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">{userComment.length}</span>{" "}
                    <span className="text-gray-500 dark:text-gray-900 font-medium">Comments</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">{pollsCount}</span>{" "}
                    <span className="text-gray-500 dark:text-gray-900 font-medium">Polls</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-[#a50034] dark:text-[#f1ece1]">Deskripsi</h3>
                  <p className="text-gray-700 dark:text-[#f1ece1] text-sm leading-relaxed">
                    {userData.bio || "Belum ada deskripsi"}
                  </p>
                </div>
              </>
            )}

          </div>
        </div>

        {/* NAVIGATION TABS & KONTEN AKTIVITAS (HANYA TAMPIL JIKA BUKAN ANONIM) */}
        {!isAnonim && (
          <>
            {/* Tabs Header */}
            <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-800 px-2 pt-2">
              {[
                { id: "posts", label: "Posts" },
                { id: "comments", label: "Comments" },
                { id: "polling", label: "Polling" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-semibold transition-all pb-3 border-b-2 cursor-pointer ${
                    activeTab === tab.id
                      ? "text-[#a50034] border-[#a50034] dark:text-[#f1ece1] dark:border-[#f1ece1]"
                      : "text-gray-500 dark:text-[#f1ece1]/70 border-transparent hover:text-gray-800 dark:hover:text-[#f1ece1]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Section */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl min-h-[200px] flex items-center justify-center p-8">
              {/* TAB POSTS */}
              {activeTab === "posts" &&
                (posts.length === 0 ? (
                  <p className="text-gray-400 dark:text-[#f1ece1] text-sm font-medium">
                    Belum ada post yang dibuat.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                    {posts.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handlePostClick(item)}
                        className="bg-white dark:bg-[#f1ece1] rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
                      >
                        <div className="h-48 w-full overflow-hidden rounded-lg flex justify-center items-center bg-[#f1ece1]">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt="Post media"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <p className="text-[#a50034] font-semibold text-center text-xl line-clamp-4">
                              {`#${item.tag}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

              {/* TAB COMMENTS */}
              {activeTab === "comments" &&
                (userComment.length === 0 ? (
                  <p className="text-gray-400 dark:text-[#f1ece1] text-sm font-medium">
                    Belum ada komentar yang dibuat.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3 w-full">
                    {userComment.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleCommentClick(item)}
                        className="bg-gray-50 dark:bg-[#292828] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-1 text-left cursor-pointer hover:border-[#a50034] dark:hover:border-[#f1ece1] transition-all group"
                      >
                        <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-400 mb-1">
                          <span>
                            Membalas post:{" "}
                            <strong className="text-[#a50034] dark:text-[#f1ece1] group-hover:underline">
                              #{item.posts?.tag || "komplain"}
                            </strong>
                          </span>
                          <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                        </div>

                        <p className="text-sm font-semibold text-gray-800 dark:text-[#f1ece1]">
                          "{item.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                ))}

              {/* TAB POLLING */}
              {activeTab === "polling" &&
                (userVote.length === 0 ? (
                  <p className="text-gray-400 dark:text-[#f1ece1] text-sm font-medium">
                    Belum ada kontribusi terhadap suatu isu.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3 w-full">
                    {userVote.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleVoteClick(item)}
                        className="bg-gray-50 dark:bg-[#292828] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-2 text-left cursor-pointer hover:border-[#a50034] dark:hover:border-[#f1ece1] transition-all group"
                      >
                        <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-400">
                          <span>
                            tag:{" "}
                            <strong className="text-[#a50034] dark:text-[#f1ece1] group-hover:underline">
                              #{item.posts?.tag || "isu"}
                            </strong>
                          </span>
                          <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {item.posts?.description || "Tidak ada deskripsi"}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Pilihan Vote:</span>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                              item.vote_type === "up"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                            }`}
                          >
                            {item.vote_type === "up" ? "Setuju" : "Tidak Setuju"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </>
        )}

      </div>

      {/* Focus Post Modal */}
      <Focuspost
        post={selectedpost}
        focused_comment={selectedcomment}
        focused_vote={selectedvote}
        isOpen={isfocusopen}
        onClose={() => setIsfocusopen(false)}
        onVoteSuccess={fetchPublicProfile}
      />
    </div>
  );
}