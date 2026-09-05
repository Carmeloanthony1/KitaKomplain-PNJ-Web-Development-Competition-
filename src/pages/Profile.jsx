import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Focuspost from "../components/FocusPost";
import { useStatus } from "../components/StatusContext";
import VerifyAccount from "../components/Verify";

export default function Profile() {
  const navigate = useNavigate();
  const { showStatus } = useStatus();
  const userId = localStorage.getItem("user_id");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAnonimMode, setIsAnonimMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // State Data
  const [posts, setPosts] = useState([]);
  const [user_comment, setUser_comment] = useState([]);
  const [pollsCount, setPollsCount] = useState(0);
  const [user_vote, setUser_vote] = useState([]);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempBio, setTempBio] = useState("");

  const [selectedpost, setSelectedpost] = useState(null);
  const [selectedcomment, setSelectedcomment] = useState(null);
  const [selectedvote, setSelectedvote] = useState(null);
  const [isfocusopen, setIsfocusopen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

    if (vote_error) {
      console.error("Gagal memperbarui vote: ", vote_error.message);
    } else if (vote_data) {
      setUser_vote(vote_data);
      setPollsCount(count ?? vote_data.length);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    async function fetchUserData() {
      setLoading(true);

      const { data, error: userError } = await supabase
        .from("users")
        .select("username, bio, avatar_url, is_anonim_mode, created_at, is_verified")
        .eq("id", userId)
        .maybeSingle();

      // Handle error or missing user data first
      if (userError || !data) {
        if (userError) console.error("Gagal mengambil data user: ", userError.message);
        
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showStatus("Akun tidak ditemukan atau telah dihapus.", "error");
        navigate("/login");
        return; // Stop execution here
      }

      // Data is safe, set the states exactly once
      setUsername(data.username || "");
      setBio(data.bio || "Belum ada deskripsi");
      setAvatarUrl(data.avatar_url || "");
      setIsAnonimMode(data.is_anonim_mode || false);
      setTempUsername(data.username || "");
      setTempBio(data.bio || "");
      setIsVerified(data.is_verified || false);

      // Fetch Posts
      const { data: userPosts, error: postError } = await supabase
        .from("posts")
        .select(`id, description, image_url, tag, is_anonim_mode, created_at, user_id, users (username, avatar_url)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (postError) {
        console.error("Gagal mengambil post: ", postError.message);
      } else if (userPosts) {
        setPosts(userPosts);
      }

      // Fetch Comments
      const { data: commentsData, error: commentError } = await supabase
        .from("comments")
        .select(`
          id, content, created_at, post_id, 
          posts ( id, description, image_url, tag, created_at, user_id, users (username, avatar_url) )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (commentError) {
        console.error("Gagal mengambil komentar: ", commentError.message);
      } else if (commentsData) {
        setUser_comment(commentsData);
      }

      await refreshpage();
      setLoading(false);
    }

    fetchUserData();
  }, [userId, navigate, refreshpage, showStatus]);

  const handleToggleAnonim = async () => {
    const nextStatus = !isAnonimMode;
    setIsAnonimMode(nextStatus);

    const { error } = await supabase
      .from("users")
      .update({ is_anonim_mode: nextStatus })
      .eq("id", userId);

    if (error) {
      console.error("Gagal update mode anonim:", error.message);
      showStatus("Gagal mengubah status Mode Anonim!", "error");
      setIsAnonimMode(!nextStatus);
    }
  };

  const handleSaveName = async () => {
    if (!tempUsername.trim()) return;

    const { error } = await supabase
      .from("users")
      .update({ username: tempUsername })
      .eq("id", userId);

    if (error) {
      showStatus("Gagal update username!", "error");
    } else {
      setUsername(tempUsername);
      showStatus("Username berhasil diperbarui!", "success");
    }
    setIsEditingName(false);
  };

  const handleSaveBio = async () => {
    const { error } = await supabase
      .from("users")
      .update({ bio: tempBio })
      .eq("id", userId);

    if (error) {
      showStatus("Gagal update bio!", "error");
    } else {
      setBio(tempBio);
      showStatus("Bio berhasil diperbarui!", "success");
    }
    setIsEditingBio(false);
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileEXT = file.name.split(".").pop();
      const filepath = `avatars/${userId}_${Math.random()}.${fileEXT}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filepath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filepath);

      const newAvatar = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: newAvatar })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatar);
      showStatus("Foto profil berhasil diubah!", "success");
    } catch (error) {
      showStatus("Gagal upload foto profile", "error");
      console.error(error.message);
    } finally { 
      setUploading(false);
    }
  };

  const handlePost_click = (item) => {
    const fullpost_data = {
      ...item,
      users: item.users || {
        username: username,
        avatar_url: avatarUrl,
      },
    };
    setSelectedpost(fullpost_data);
    setSelectedcomment(null);
    setSelectedvote(null);
    setIsfocusopen(true);
  };

  const handleComment_click = (item) => {
    if (!item.posts) return;

    const fullpost_data = {
      ...item.posts,
      users: item.posts.users || {
        username: username,
        avatar_url: avatarUrl,
      },
    };

    setSelectedpost(fullpost_data);
    setSelectedcomment(item);
    setSelectedvote(null);
    setIsfocusopen(true);
  };

  const handle_voteclick = async (voteItem) => {
    if (!voteItem) return;

    if (voteItem.posts) {
      const fullpost_data = {
        ...voteItem.posts,
        users: voteItem.posts.users || {
          username: username,
          avatar_url: avatarUrl,
        },
      };
      setSelectedpost(fullpost_data);
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

  if (loading)
    return (
      <div className="p-10 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] dark:bg-[#1a1a1a] text-gray-900 dark:text-[#f1ece1] py-4 sm:py-8 px-3 sm:px-8">
      <div className="max-w-xl sm:max-w-3xl mx-auto flex flex-col gap-4 sm:gap-6">
        
        {/* Header Tombol Kembali */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 stroke-[#a50034] dark:stroke-[#f1ece1]"
              fill="none"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#a50034] dark:text-[#f1ece1]">
            Profile
          </h1>
        </div>

        {/* Kartu Profil Utama */}
        <div className="bg-white dark:bg-[#222222] rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="h-28 sm:h-36 bg-[#f1ece1] dark:bg-[#e4ded3] w-full"></div>

          <div className="px-4 sm:px-8 pb-6 relative flex flex-col items-center sm:items-start">
            {/* Foto Profil */}
            <div className="-mt-14 sm:-mt-16 mb-3 relative inline-block">
              <label className="relative cursor-pointer group rounded-full overflow-hidden block w-24 h-24 sm:w-28 sm:h-28 border-4 border-white dark:border-[#222222] shadow bg-white dark:bg-[#222222]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto profil"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#a50034] dark:bg-[#f1ece1] text-white dark:text-gray-900 font-bold text-2xl sm:text-3xl flex items-center justify-center uppercase">
                    {username ? username.charAt(0) : "U"}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Edit</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {isAnonimMode && (
                <span className="absolute bottom-0 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-700 shadow">
                  Anonim
                </span>
              )}
            </div>

            {/* Info Nama & Switch Mode Anonim */}
            <div className="flex flex-wrap items-center justify-between gap-4 w-full">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      onBlur={handleSaveName}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      autoFocus
                      className="text-2xl font-bold border-b-2 border-[#a50034] dark:border-[#f1ece1] outline-none bg-transparent text-gray-900 dark:text-[#f1ece1] text-center sm:text-left"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f1ece1] flex items-center gap-1.5 justify-center sm:justify-start">
                      {username || "User"}
                    </h2>
                  )}

                  <button
                    onClick={() => setIsEditingName((prev) => !prev)}
                    className="text-gray-500 hover:text-gray-700 dark:text-[#f1ece1] transition cursor-pointer flex-shrink-0"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                </div>

                {!isVerified && (
                  <p
                    onClick={() => setIsVerifyOpen(true)} 
                    className="text-xs text-rose-600 dark:text-rose-400 font-medium cursor-pointer hover:underline text-center sm:text-left mt-1"
                  >
                    Verify your account?
                  </p>
                )}
              </div>

              {/* Toggle Switch Mode Anonim */}
              <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-[#1a1a1a] px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-neutral-800 sm:ml-auto">
                <span className="text-xs font-semibold text-gray-700 dark:text-[#f1ece1]">
                  Mode Anonim
                </span>
                <button
                  type="button"
                  onClick={handleToggleAnonim}
                  className={`relative inline-flex items-center h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAnonimMode ? "bg-[#a50034] dark:bg-[#a50034]" : "bg-gray-300 dark:bg-neutral-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isAnonimMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Statistik Posts / Comments / Polls */}
            <div className="w-full flex justify-center sm:justify-start my-4">
              <div className="flex items-center gap-6 bg-gray-50 dark:bg-[#1a1a1a] px-5 py-2 rounded-xl border border-gray-100 dark:border-neutral-800 text-xs sm:text-sm">
                <div className="text-center">
                  <span className="font-bold text-gray-900 dark:text-white">{posts.length}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">Posts</span>
                </div>
                <div className="w-px h-3 bg-gray-300 dark:bg-neutral-700"></div>
                <div className="text-center">
                  <span className="font-bold text-gray-900 dark:text-white">{user_comment.length}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">Comments</span>
                </div>
                <div className="w-px h-3 bg-gray-300 dark:bg-neutral-700"></div>
                <div className="text-center">
                  <span className="font-bold text-gray-900 dark:text-white">{pollsCount}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">Polls</span>
                </div>
              </div>
            </div>

            {/* Bagian Deskripsi / Bio */}
            <div className="w-full flex flex-col gap-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h3 className="text-xs font-bold text-[#a50034] dark:text-[#f1ece1]">Deskripsi</h3>
                <button
                  onClick={() => setIsEditingBio((prev) => !prev)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-[#f1ece1] transition cursor-pointer p-0.5"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
              </div>

              {isEditingBio ? (
                <div className="flex flex-col gap-2 mt-1">
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-[#f1ece1] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="text-xs px-2.5 py-1 rounded-md text-gray-500 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#a50034] text-white cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-neutral-300 text-xs leading-relaxed">
                  {bio}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="flex items-center gap-6 border-b border-gray-200 dark:border-neutral-800 px-2">
          {[
            { id: "posts", label: "Posts" },
            { id: "comments", label: "Comments" },
            { id: "polling", label: "Vote" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs sm:text-sm font-bold transition-all pb-2.5 border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "text-[#a50034] border-[#a50034] dark:text-[#f1ece1] dark:border-[#f1ece1]"
                  : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-[#f1ece1]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Konten Tab */}
        <div className="bg-white dark:bg-[#222222] rounded-2xl border border-gray-200 dark:border-neutral-800 p-3 sm:p-6 min-h-[160px]">
          {activeTab === "posts" &&
            (posts.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-6">
                Belum ada post yang dibuat.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 w-full">
                {posts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handlePost_click(item)}
                    className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-xl border-2 border-gray-300 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                  >
                    {item.is_anonim_mode && (
                      <div className="absolute top-2 left-2 z-10 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Anonim
                      </div>
                    )}

                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt="Post media"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center">
                        <p className="text-[#a50034] dark:text-[#f1ece1] font-bold text-xs sm:text-sm line-clamp-2">
                          #{item.tag}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "comments" &&
            (user_comment.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-6">
                Belum ada komentar yang dibuat.
              </p>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {user_comment.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleComment_click(item)}
                    className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-3 text-left cursor-pointer hover:border-[#a50034] transition-colors"
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                      <span>
                        Post: <strong className="text-[#a50034] dark:text-[#f1ece1]">#{item.posts?.tag || "komplain"}</strong>
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-[#f1ece1]">
                      "{item.content}"
                    </p>
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "polling" &&
            (user_vote.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-6">
                Belum ada kontribusi vote.
              </p>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                {user_vote.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handle_voteclick(item)}
                    className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-3 text-left cursor-pointer hover:border-[#a50034] transition-colors"
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                      <span>
                        Tag: <strong className="text-[#a50034] dark:text-[#f1ece1]">#{item.posts?.tag || "isu"}</strong>
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1 mb-2">
                      {item.posts?.description || "Tidak ada deskripsi"}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.vote_type === "up"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      }`}
                    >
                      {item.vote_type === "up" ? "Setuju" : "Tidak Setuju"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
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

      <VerifyAccount 
        isOpen={isVerifyOpen} 
        onClose={() => setIsVerifyOpen(false)} 
        onSuccess={() => setIsVerified(true)} 
      />
    </div>
  );
}