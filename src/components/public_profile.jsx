import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Focuspost from "../components/FocusPost";
import { useStatus } from "../components/StatusContext";

export default function PublicProfile() {
  const { userId } = useParams(); // Ambil userId dari URL (/profile/:userId)
  const navigate = useNavigate();
  const { showStatus } = useStatus();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAnonimMode, setIsAnonimMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState([]);
  const [user_comment, setUser_comment] = useState([]);
  const [pollsCount, setPollsCount] = useState(0);
  const [user_vote, setUser_vote] = useState([]);

  const [activeTab, setActiveTab] = useState("posts");
  const [selectedpost, setSelectedpost] = useState(null);
  const [selectedcomment, setSelectedcomment] = useState(null);
  const [selectedvote, setSelectedvote] = useState(null);
  const [isfocusopen, setIsfocusopen] = useState(false);

  // Fungsi Share Profile
  const share_profile = async () => {
    const shareUrl = `${window.location.origin}/profile/${userId}`;
    const shareData = {
      title: `Profile KitaKomplain - ${username}`,
      text: `Cek profile dan riwayat aduan ${username} di platform KitaKomplain!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share dibatalkan', err);
      }
    } else { 
      try {
        await navigator.clipboard.writeText(shareUrl);
        showStatus("Link profil berhasil disalin ke clipboard!", "success");
      } catch (err) {
        showStatus("Gagal menyalin link profil!", "error");
      }
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const refreshpage = useCallback(async () => {
    if (!userId) return;

    const { data: vote_data, error: vote_error, count } = await supabase
      .from("votes")
      .select(
        `
        id, vote_type, created_at, post_id, 
        posts ( id, tag, description, image_url, created_at, user_id, users (username, avatar_url) )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!vote_error && vote_data) {
      setUser_vote(vote_data);
      setPollsCount(count ?? vote_data.length);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    async function fetchUserData() {
      setLoading(true);

      const { data, error: userError } = await supabase
        .from("users")
        .select("username, bio, avatar_url, is_anonim_mode")
        .eq("id", userId)
        .maybeSingle();

      if (userError || !data) {
        showStatus("User tidak ditemukan.", "error");
        navigate("/");
        return;
      }

      setUsername(data.username || "");
      setBio(data.bio || "Belum ada deskripsi");
      setAvatarUrl(data.avatar_url || "");
      setIsAnonimMode(data.is_anonim_mode || false);

      // Ambil postingan user
      const { data: userPosts } = await supabase
        .from("posts")
        .select(`id, description, image_url, tag, is_anonim_mode, created_at, user_id, users (username, avatar_url)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (userPosts) setPosts(userPosts);

      // Ambil komentar user
      const { data: commentsData } = await supabase
        .from("comments")
        .select(`
          id, content, created_at, post_id, 
          posts ( id, description, image_url, tag, created_at, user_id, users (username, avatar_url) )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (commentsData) setUser_comment(commentsData);

      await refreshpage();
      setLoading(false);
    }

    fetchUserData();
  }, [userId, navigate, refreshpage, showStatus]);

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f5f8] dark:bg-[#0d0e11] text-gray-900 dark:text-[#f1ece1] pb-16 transition-colors duration-200">
      <div className="max-w-md md:max-w-xl mx-auto flex flex-col items-center bg-white dark:bg-[#16181c] md:border border-gray-200 dark:border-neutral-800/80 md:shadow-lg md:rounded-3xl md:my-6 overflow-x-hidden relative">
        
        {/* Top Header Bar */}
        <header className="w-full flex items-center justify-between py-3.5 px-4 border-b border-black/5 dark:border-white/10 bg-transparent z-10">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/50 transition cursor-pointer z-20"
          >
            <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <h1 className="text-base font-bold tracking-tight truncate max-w-[200px]">
            {username || "Profile"}
          </h1>

          <button
            type="button"
            onClick={share_profile}
            className="p-1.5 rounded-full bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/50 transition cursor-pointer z-20"
          >
            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186b2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </button>
        </header>

        {/* Banner */}
        <div className="w-full h-44 sm:h-52 -mt-[57px] bg-gradient-to-br from-slate-200 via-slate-100 to-gray-300 dark:from-[#23272e] dark:via-[#1c1f24] dark:to-[#14161a] border-b border-gray-300/80 dark:border-neutral-800 relative z-0 md:rounded-t-3xl" />

        {/* Profil Content */}
        <div className="w-full flex flex-col items-center px-4 relative z-10">
          <div className="-mt-16 sm:-mt-20 relative flex flex-col items-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-[#16181c] shadow-md bg-gray-100 dark:bg-neutral-800 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#a50034] text-white font-bold text-3xl flex items-center justify-center uppercase">
                  {username ? username.charAt(0) : "U"}
                </div>
              )}
            </div>
            {isAnonimMode && (
              <span className="mt-1.5 bg-black/85 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-neutral-700">
                Anonim
              </span>
            )}
          </div>

          <h2 className="mt-2.5 text-base sm:text-lg font-bold tracking-tight">
            @{username || "user"}
          </h2>

          {/* Stats */}
          <div className="w-full flex items-center justify-center gap-9 my-3.5">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">{posts.length}</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">{user_comment.length}</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400">Comments</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">{pollsCount}</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400">Polls</span>
            </div>
          </div>

          {/* Bio */}
          <div className="w-full max-w-sm text-center my-2">
            <p className="text-xs text-gray-700 dark:text-neutral-300 leading-relaxed break-words whitespace-pre-line">
              {bio}
            </p>
          </div>

          {/* Grid Content / Tabs */}
          <div className="w-full flex border-b border-gray-200 dark:border-neutral-800 mt-2 mb-4">
            {["posts", "comments", "polling"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold capitalize transition relative ${
                  activeTab === tab ? "text-black dark:text-white" : "text-gray-400"
                }`}
              >
                {tab}
                {activeTab === tab && <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-black dark:bg-white" />}
              </button>
            ))}
          </div>

          {/* Grid Post */}
          <div className="w-full px-3 pb-6">
            {activeTab === "posts" && (
              <div className="grid grid-cols-3 gap-2">
                {posts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedpost(item);
                      setIsfocusopen(true);
                    }}
                    className="aspect-[3/4] bg-gray-100 dark:bg-[#1f2228] rounded-xl overflow-hidden cursor-pointer"
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt="Post" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center bg-gray-900">
                        <p className="text-[#fe2c55] font-bold text-xs">#{item.tag}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <Focuspost
        post={selectedpost}
        focused_comment={selectedcomment}
        focused_vote={selectedvote}
        isOpen={isfocusopen}
        onClose={() => setIsfocusopen(false)}
        onVoteSuccess={refreshpage}
      />
    </div>
  );
}