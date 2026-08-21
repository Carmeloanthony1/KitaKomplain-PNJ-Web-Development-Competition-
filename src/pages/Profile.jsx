import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
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
  const [comments, setComments] = useState([]);
  const [polls, setPolls] = useState([]);

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

      const { data, error } = await supabase
        .from("users")
        .select("username, bio, avatar_url")
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

      const { data: userPosts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId);
      if (userPosts) setPosts(userPosts);

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

      const { data: url_data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filepath);

      const newavatar = url_data.publicUrl;

      const { error: Update_error } = await supabase
        .from("users")
        .update({ avatar_url: newavatar })
        .eq("id", userId);

      if (Update_error) throw Update_error;

      setAvatarUrl(newavatar);
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
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar_Kiri />

      <main className="flex-1">
        <Navbar />

        <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-[#a50034]">Profile</h1>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              
              {/* Avatar Upload Container */}
              <label className="relative cursor-pointer group rounded-full overflow-hidden block">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto profil"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#a50034] text-white font-bold text-2xl flex items-center justify-center border shadow-sm uppercase">
                    {username ? username.charAt(0) : "U"}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs">Edit</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {/* Username Section */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      onBlur={handleSaveName}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      autoFocus
                      className="text-2xl font-bold border-b-2 border-[#a50034] outline-none bg-transparent text-gray-800"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-800">
                      {username || "User"}
                    </h2>
                  )}

                  <img
                    src="/assets/config-icon.png"
                    alt="Edit Profile"
                    onClick={() => setIsEditingName((prev) => !prev)}
                    className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-transform active:scale-95"
                  />
                </div>

                <p
                  onClick={() => navigate("/report")}
                  className="text-xs text-blue-600 font-medium cursor-pointer hover:underline mt-0.5"
                >
                  Verify your account?
                </p>
              </div>
            </div>

            <hr className="border-gray-100 my-1" />

            {/* Bio Section */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-[#a50034]">Deskripsi</h3>
                <img
                  src="/assets/config-icon.png"
                  alt="Edit Deskripsi"
                  onClick={() => setIsEditingBio((prev) => !prev)}
                  className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100 transition-transform active:scale-95"
                />
              </div>

              {isEditingBio ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    rows={3}
                    className="w-full text-sm p-2 border rounded-lg focus:outline-none bg-gray-50 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="text-xs px-3 py-1 rounded-md text-gray-500"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="text-xs px-3 py-1 rounded-md bg-[#a50034] text-white"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-6 border-b border-gray-200 pb-2">
            {[
              { id: "posts", label: "Your Posts" },
              { id: "comments", label: "Your Comments" },
              { id: "polling", label: "Your Polling" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-semibold transition pb-2 border-b-2 ${
                  activeTab === tab.id
                    ? "text-[#a50034] border-[#a50034]"
                    : "text-gray-500 border-transparent hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid Posts */}
          <div className="min-h-[200px]">
            {activeTab === "posts" &&
              (posts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm border border-dashed rounded-xl">
                  Belum ada post.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              <div className="text-center py-10 text-gray-400 text-sm border border-dashed rounded-xl">
                Belum ada komentar.
              </div>
            )}

            {activeTab === "polling" && (
              <div className="text-center py-10 text-gray-400 text-sm border border-dashed rounded-xl">
                Belum ada polling.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}