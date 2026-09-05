import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Focuspost from "../components/FocusPost";
import { useStatus } from "../components/StatusContext";
//import VerifyAccount from "../components/Verify";

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

  //const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  //const [isVerified, setIsVerified] = useState(false);

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

      if (userError || !data) {
        if (userError) console.error("Gagal mengambil data user: ", userError.message);
        localStorage.removeItem("user_id");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showStatus("Akun tidak ditemukan atau telah dihapus.", "error");
        navigate("/login");
        return;
      }

      setUsername(data.username || "");
      setBio(data.bio || "Belum ada deskripsi");
      setAvatarUrl(data.avatar_url || "");
      setIsAnonimMode(data.is_anonim_mode || false);
      setTempUsername(data.username || "");
      setTempBio(data.bio || "");
      setIsVerified(data.is_verified || false);

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

  if (loading) {
    return (
      <div className="p-10 text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#121212] text-gray-900 dark:text-[#f1ece1] pb-16">
      <div className="max-w-md md:max-w-xl mx-auto flex flex-col items-center">
        
        {/* Top App Bar */}
        <header className="w-full flex items-center justify-between py-3.5 px-4 border-b border-gray-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <svg className="w-6 h-6 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <h1 className="text-base font-bold tracking-tight truncate max-w-[200px]">
            {username || "Profile"}
          </h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showStatus("Fitur notifikasi aktif", "success")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showStatus("Tautan profil disalin!", "success");
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition cursor-pointer"
            >
              <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Background Banner Lebih Jelas & Tinggi */}
        <div className="w-full h-44 sm:h-52 bg-gradient-to-b from-[#ece5d8] to-[#dfd7c7] dark:from-[#2a2e34] dark:to-[#1e2126] border-b border-gray-200 dark:border-neutral-800"></div>

        {/* Area Profil Utama */}
        <div className="w-full flex flex-col items-center px-4">
          
          {/* Avatar Bulat Lebih Besar */}
          <div className="-mt-16 sm:-mt-20 relative flex flex-col items-center">
            <label className="relative cursor-pointer group rounded-full overflow-hidden block w-28 h-28 sm:w-32 sm:h-32 border-4 border-white dark:border-[#121212] shadow-lg bg-gray-100 dark:bg-neutral-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#a50034] text-white font-bold text-3xl sm:text-4xl flex items-center justify-center uppercase">
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
              <span className="mt-1.5 bg-black/85 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow border border-neutral-700">
                Anonim
              </span>
            )}
          </div>

          {/* Username + Tombol Edit & Verify Link */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            {isEditingName ? (
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                autoFocus
                className="text-base sm:text-lg font-bold border-b border-[#a50034] outline-none bg-transparent text-center"
              />
            ) : (
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                @{username || "user"}
              </h2>
            )}

            {/*
            {!isVerified && (
              <button
                type="button"
                onClick={() => setIsVerifyOpen(true)}
                className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer ml-1"
              >
                Verify?
              </button>
            )}
            */}

            <button
              type="button"
              onClick={() => setIsEditingName((prev) => !prev)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer p-0.5"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
            </button>
          </div>

          {/* Baris Statistik (Posts, Comments, Polls) */}
          <div className="w-full flex items-center justify-center gap-9 sm:gap-12 my-3.5">
            <div className="flex flex-col items-center">
              <span className="text-lg sm:text-xl font-bold">{posts.length}</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg sm:text-xl font-bold">{user_comment.length}</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">Comments</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg sm:text-xl font-bold">{pollsCount}</span>
              <span className="text-xs text-gray-500 dark:text-neutral-400 font-medium">Polls</span>
            </div>
          </div>

          {/* Tombol Aksi: Edit Bio (Kecil di HP) & Mode Anonim di Tengah Bawah */}
          <div className="w-full flex flex-col items-center gap-2 my-1">
            <button
              type="button"
              onClick={() => setIsEditingBio(true)}
              className="w-36 sm:w-44 md:max-w-xs py-1.5 sm:py-2 bg-[#fe2c55] hover:bg-[#e0264b] text-white font-semibold text-xs sm:text-sm rounded-md shadow-xs transition cursor-pointer"
            >
              Edit Bio
            </button>

            <div className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 px-3.5 py-1 rounded-full border border-gray-200 dark:border-neutral-700">
              <span className="text-[11px] font-semibold text-gray-700 dark:text-neutral-200 select-none">
                Mode Anonim
              </span>
              <button
                type="button"
                onClick={handleToggleAnonim}
                className={`relative inline-flex items-center h-4 w-8 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAnonimMode ? "bg-[#fe2c55]" : "bg-gray-300 dark:bg-neutral-600"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    isAnonimMode ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bio / Deskripsi */}
          <div className="w-full max-w-sm text-center my-3">
            {isEditingBio ? (
              <div className="flex flex-col items-center gap-2">
                <textarea
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:outline-none bg-gray-50 dark:bg-neutral-900 text-center resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(false)}
                    className="text-xs px-3 py-1 rounded text-gray-500 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    className="text-xs px-3 py-1 rounded bg-[#fe2c55] text-white font-medium cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-700 dark:text-neutral-300 leading-relaxed break-words whitespace-pre-line">
                {bio}
              </p>
            )}
          </div>

          {/* Tab Navigasi Ikon */}
          <div className="w-full flex border-b border-gray-200 dark:border-neutral-800 mt-2">
            {[
              {
                id: "posts",
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zm-12 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                  </svg>
                ),
              },
              {
                id: "comments",
                icon: (
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                ),
              },
              {
                id: "polling",
                icon: (
                  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 flex justify-center items-center cursor-pointer transition relative ${
                  activeTab === tab.id
                    ? "text-black dark:text-white"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
                }`}
              >
                {tab.icon}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-black dark:bg-white" />
                )}
              </button>
            ))}
          </div>

          {/* Konten Grid Galeri 3 Kolom */}
          <div className="w-full mt-1">
            {activeTab === "posts" &&
              (posts.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-12">Belum ada post.</p>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                  {posts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handlePost_click(item)}
                      className="aspect-[3/4] bg-gray-100 dark:bg-neutral-800 border border-gray-900 overflow-hidden cursor-pointer relative group"
                    >
                      {item.is_anonim_mode && (
                        <div className="absolute top-1.5 left-1.5 z-10 bg-black/70 text-white text-[8px] font-bold px-1 py-0.5 rounded">
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
                        <div className="w-full h-full flex items-center justify-center p-2 text-center bg-neutral-900">
                          <p className="text-[#fe2c55] font-bold text-xs line-clamp-2">
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
                <p className="text-gray-400 text-xs text-center py-12">Belum ada komentar.</p>
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  {user_comment.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleComment_click(item)}
                      className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-100 dark:border-neutral-800 cursor-pointer"
                    >
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Post: <strong className="text-neutral-700 dark:text-neutral-200">#{item.posts?.tag || "isu"}</strong></span>
                        <span>{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
                      </div>
                      <p className="text-xs font-medium text-gray-800 dark:text-neutral-200">
                        "{item.content}"
                      </p>
                    </div>
                  ))}
                </div>
              ))}

            {activeTab === "polling" &&
              (user_vote.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-12">Belum ada kontribusi polling.</p>
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  {user_vote.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handle_voteclick(item)}
                      className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-100 dark:border-neutral-800 cursor-pointer"
                    >
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Tag: <strong className="text-neutral-700 dark:text-neutral-200">#{item.posts?.tag || "isu"}</strong></span>
                        <span className={`font-bold uppercase text-[9px] px-1.5 py-0.5 rounded ${
                          item.vote_type === "up" ? "text-emerald-500 bg-emerald-950/20" : "text-rose-500 bg-rose-950/20"
                        }`}>
                          {item.vote_type === "up" ? "Setuju" : "Tidak Setuju"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-neutral-300 line-clamp-1">
                        {item.posts?.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
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

      {/*
      <VerifyAccount
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onSuccess={() => setIsVerified(true)}
      />
      */}
      
    </div>
  );
}