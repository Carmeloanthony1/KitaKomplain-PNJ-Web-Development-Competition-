import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // State Data
  const [posts, setPosts] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [pollsCount, setPollsCount] = useState(0);

  // State Tab & Edit
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempBio, setTempBio] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchUserData() {
      setLoading(true);

      // Fetch Profile User
      const { data, error } = await supabase
        .from("users")
        .select("username, bio, avatar_url, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Gagal mengambil data user: ", error.message);
      } else if (data) {
        setUsername(data.username || "");
        setBio(data.bio || "Belum ada deskripsi");
        setAvatarUrl(data.avatar_url || "");
        setTempUsername(data.username || "");
        setTempBio(data.bio || "");
      }

      // Fetch Post User
      const { data: userPosts, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId);

      if (postError) {
        console.error("Gagal mengambil post: ", postError.message);
      } else if (userPosts) {
        setPosts(userPosts);
      }

      setLoading(false);
    }
    fetchUserData();
  }, [userId]);

  const handleSaveName = async () => {
    if (!tempUsername.trim()) return;

    const { error } = await supabase
      .from("users")
      .update({ username: tempUsername })
      .eq("id", userId);

    if (error) {
      alert("Gagal update username!");
    } else {
      setUsername(tempUsername);
    }
    setIsEditingName(false);
  };

  const handleSaveBio = async () => {
    const { error } = await supabase
      .from("users")
      .update({ bio: tempBio })
      .eq("id", userId);

    if (error) {
      alert("Gagal update bio!");
    } else {
      setBio(tempBio);
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
      alert("Foto profil berhasil diubah!");
    } catch (error) {
      alert("Gagal upload foto profile");
      console.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-500">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Top Header: Panah Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <svg
              className="w-6 h-6 stroke-[#a50034]"
              fill="none"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-[#a50034]">Profile</h1>
        </div>

        {/* Profile Card dengan Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Top Crimson Banner */}
          <div className="h-32 bg-[#800020] w-full"></div>

          <div className="px-8 pb-8 relative">
            
            {/* Avatar (Overlapping Banner) */}
            <div className="-mt-14 mb-4 relative inline-block">
              <label className="relative cursor-pointer group rounded-full overflow-hidden block w-28 h-28 border-4 border-white shadow-md bg-white">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto profil"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#a50034] text-white font-bold text-3xl flex items-center justify-center uppercase">
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
            </div>

            {/* Username & Verification */}
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
                    className="text-2xl font-bold border-b-2 border-[#a50034] outline-none bg-transparent text-gray-900"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">
                    {username || "User"}
                  </h2>
                )}

                {/* Edit Icon (Pensil) */}
                <button
                  onClick={() => setIsEditingName((prev) => !prev)}
                  className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
              </div>

              <p
                onClick={() => navigate("/report")}
                className="text-xs text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Verify your account?
              </p>
            </div>

            {/* Stats Counter Box */}
            <div className="my-5 inline-flex items-center gap-6 bg-gray-50/80 px-6 py-2.5 rounded-xl border border-gray-100 text-sm">
              <div>
                <span className="font-bold text-gray-900">{posts.length}</span>{" "}
                <span className="text-gray-500 font-medium">Posts</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{commentsCount}</span>{" "}
                <span className="text-gray-500 font-medium">Comments</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{pollsCount}</span>{" "}
                <span className="text-gray-500 font-medium">Polls</span>
              </div>
            </div>

            {/* Section Deskripsi */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#a50034]">Deskripsi</h3>
                <button
                  onClick={() => setIsEditingBio((prev) => !prev)}
                  className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
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
                    className="w-full text-sm p-2 border rounded-lg focus:outline-none bg-gray-50 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="text-xs px-3 py-1 rounded-md text-gray-500 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="text-xs px-3 py-1 rounded-md bg-[#a50034] text-white cursor-pointer"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">{bio}</p>
              )}
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200 px-2 pt-2">
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
                  ? "text-[#a50034] border-[#a50034]"
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section (Dashed Card) */}
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl min-h-[200px] flex items-center justify-center p-8">
          {activeTab === "posts" &&
            (posts.length === 0 ? (
              <p className="text-gray-400 text-sm font-medium">Belum ada post yang dibuat.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {posts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3"
                  >
                    <div className="h-48 w-full overflow-hidden rounded-lg">
                      <img
                        src={item.image_url || "/assets/Dummy_photo.jpeg"}
                        alt="Post media"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "comments" && (
            <p className="text-gray-400 text-sm font-medium">Belum ada komentar.</p>
          )}

          {activeTab === "polling" && (
            <p className="text-gray-400 text-sm font-medium">Belum ada polling.</p>
          )}
        </div>

      </div>
    </div>
  );
}