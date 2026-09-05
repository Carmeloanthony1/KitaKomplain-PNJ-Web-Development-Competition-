import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Focuspost from "../components/FocusPost";
import { useStatus } from "../components/StatusContext";

export default function Profile() {
  const navigate = useNavigate();
  const { showStatus } = useStatus();
  const userId = localStorage.getItem("user_id");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAnonimMode, setIsAnonimMode] = useState(false); // STATE MODE ANONIM
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isanonim_mode, setIsanonim_mode] = useState(false);

  // State Data
  const [posts, setPosts] = useState([]);
  const [user_comment, setUser_comment] = useState([]);
  const [pollsCount, setPollsCount] = useState(0);
  const [user_vote, setUser_vote] = useState([]);

  // State Tab & Edit
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

  // Fungsi untuk refresh khusus data vote/polling
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
      setLoading(false);
      return;
    }

    async function fetchUserData() {
      setLoading(true);

      // 1. Fetch Profile User (Termasuk is_anonim_mode)
      const { data, error: userError } = await supabase
        .from("users")
        .select("username, bio, avatar_url, is_anonim_mode, created_at")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Gagal mengambil data user: ", userError.message);
      } else if (data) {
        setUsername(data.username || "");
        setBio(data.bio || "Belum ada deskripsi");
        setAvatarUrl(data.avatar_url || "");
        setIsAnonimMode(data.is_anonim_mode || false); // Set Status Mode Anonim
        setTempUsername(data.username || "");
        setTempBio(data.bio || "");
        setIsanonim_mode(data.is_anonim_mode || false); // <-- Diset langsung di sini
      }

      // 2. Fetch Post User
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

      // 3. Fetch Comments User
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

      // 4. Fetch Polling User
      await refreshpage();

      setLoading(false);
    }
    fetchUserData();
  }, [userId, refreshpage]);

  // Handler Switch Mode Anonim
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
      setIsAnonimMode(!nextStatus); // Revert jika gagal
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
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading Profile...</div>;

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
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-[#a50034] dark:text-[#f1ece1]">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-32 bg-[#800020] dark:bg-[#f1ece1] w-full"></div>

          <div className="px-8 pb-8 relative">
            <div className="-mt-14 mb-4 relative inline-block">
              <label className="relative cursor-pointer group rounded-full overflow-hidden block w-28 h-28 border-4 border-white dark:border-[#1e1e1e] shadow-md bg-white dark:bg-[#1e1e1e]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto profil"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#a50034] dark:bg-[#f1ece1] text-white dark:text-gray-900 font-bold text-3xl flex items-center justify-center uppercase">
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

              {/* BADGE MODE ANONIM AKUN */}
              {isanonim_mode && (
                <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-700 shadow flex items-center gap-1" title="Mode Anonim Aktif">
                  Anonim
                </span>
              )}
            </div>

            {/* Info Nama & Switch Mode Anonim */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      onBlur={handleSaveName}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      autoFocus
                      className="text-2xl font-bold border-b-2 border-[#a50034] dark:border-[#f1ece1] outline-none bg-transparent text-gray-900 dark:text-[#f1ece1]"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f1ece1]">
                      {username || "User"}
                    </h2>
                  )}

                  <button
                    onClick={() => setIsEditingName((prev) => !prev)}
                    className="text-gray-500 hover:text-gray-700 dark:text-[#f1ece1] transition cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>

                  {/* BADGE INDIKATOR MODES ANONIM */}
                  {isAnonimMode && (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white dark:bg-[#f1ece1] dark:text-gray-900 flex items-center justify-center gap-1">
                      Mode Anonim
                    </span>
                  )}
                </div>

                <p className="text-xs text-blue-600 dark:text-[#a50034] font-medium cursor-pointer hover:underline">
                  Verify your account?
                </p>
              </div>

              {/* TOGGLE SWITCH MODE ANONIM */}
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-[#292828] p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold text-gray-700 dark:text-[#f1ece1]">
                  Mode Anonim
                </span>
                <button
                  type="button"
                  onClick={handleToggleAnonim}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAnonimMode ? "bg-[#a50034] dark:bg-[#a50034]" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isAnonimMode ? "translate-x-5 dark:bg-gray-900" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="my-5 inline-flex items-center gap-6 bg-gray-50/80 dark:bg-[#f1ece1] px-6 py-2.5 rounded-xl border border-gray-100 text-sm">
              <div>
                <span className="font-bold text-gray-900">{posts.length}</span>{" "}
                <span className="text-gray-500 dark:text-gray-900 font-medium">Posts</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{user_comment.length}</span>{" "}
                <span className="text-gray-500 dark:text-gray-900 font-medium">Comments</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{pollsCount}</span>{" "}
                <span className="text-gray-500 dark:text-gray-900 font-medium">Polls</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#a50034] dark:text-[#f1ece1]">Deskripsi</h3>
                <button
                  onClick={() => setIsEditingBio((prev) => !prev)}
                  className="text-gray-500 hover:text-gray-700 dark:text-[#f1ece1] transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
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
                    className="w-full text-sm p-2 border rounded-lg focus:outline-none bg-gray-50 text-gray-900 dark:bg-[#f1ece1] dark:text-gray-900 dark:font-semibold resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="text-xs px-3 py-1 rounded-md text-gray-500 dark:text-[#f1ece1] cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="text-xs px-3 py-1 rounded-md bg-[#a50034] dark:bg-[#f1ece1] dark:text-black dark:font-semibold text-white cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-[#f1ece1] text-sm leading-relaxed">{bio}</p>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-800 px-2 pt-2">
          {[
            { id: "posts", label: "Posts" },
            { id: "comments", label: "Comments" },
            { id: "polling", label: "Vote" },
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
          {activeTab === "posts" &&
            (posts.length === 0 ? (
              <p className="text-gray-400 dark:text-[#f1ece1] text-sm font-medium">Belum ada post yang dibuat.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {posts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handlePost_click(item)}
                    className="bg-white dark:bg-[#f1ece1] rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    {/* BADGE JIKA POSTINGAN DIPUBLIKASIKAN ANONIM */}
                    {item.is_anonim_mode && (
                      <div className="absolute top-3 left-3 z-10 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow">
                        🕵️ Anonim
                      </div>
                    )}

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
            (user_comment.length === 0 ? (
              <p className="text-gray-400 dark:text-[#f1ece1] text-sm font-medium">
                Belum ada komentar yang dibuat.
              </p>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                {user_comment.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleComment_click(item)}
                    className="bg-gray-50 dark:bg-[#292828] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-1 text-left cursor-pointer hover:border-[#a50034] dark:hover:border-[#f1ece1] transition-all group"
                  >
                    <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-400 mb-1">
                      <span>
                        Membalas post: <strong className="text-[#a50034] dark:text-[#f1ece1] group-hover:underline">#{item.posts?.tag || "komplain"}</strong>
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
            (user_vote.length === 0 ? (
              <p className="text-gray-400 dark:text-[#f1ece1] text-sm font-medium">
                Belum ada kontribusi terhadap suatu isu.
              </p>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                {user_vote.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handle_voteclick(item)}
                    className="bg-gray-50 dark:bg-[#292828] border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-2 text-left cursor-pointer hover:border-[#a50034] dark:hover:border-[#f1ece1] transition-all group"
                  > 
                    <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-400">
                      <span>
                        tag: <strong className="text-[#a50034] dark:text-[#f1ece1] group-hover:underline">#{item.posts?.tag || "isu"}</strong>
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

      </div>

      {/* MODAL FOCUS POST */}
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