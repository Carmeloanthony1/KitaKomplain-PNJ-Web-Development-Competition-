import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
import { supabase } from "../supabaseClient";

export default function Profile() {
  const userId = localStorage.getItem("user_id");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempBio, setTempBio] = useState("");

  // Load data sesuai ID yang login
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchUserData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("username, bio, avatar_url") // Fixed: String digabung pake koma
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
      setLoading(false);
    }
    fetchUserData();
  }, [userId]);

  // Fixed: Ditambah async
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

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-6 max-w-5xl mx-auto flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-[#a50034]">Profile</h1>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
            
            {/* Header Profile */}
            <div className="flex items-center gap-4">
              
              {/* Conditional Avatar: Gambar / Inisial Huruf */}
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
                      className="text-2xl font-bold border-b-2 border-blue-500 outline-none bg-transparent text-[#a50034]"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-[#a50034]">{username || "User"}</h2>
                  )}
                  
                  <img
                    src="/assets/config-icon.png"
                    alt="Edit Profile"
                    onClick={() => setIsEditingName((prev) => !prev)}
                    className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-transform active:scale-95"
                  />
                </div>
                
                <p className="text-xs text-blue-600 font-medium cursor-pointer hover:underline mt-0.5">
                  Verify your account?
                </p>
              </div>
              <div>
                <h2>Joined</h2>
              </div>
            </div>

            <hr className="border-gray-100 my-1" />

            {/* Section Deskripsi */}
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
            <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-2">
              Your Posts
            </button>
            <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
              Your Comments
            </button>
            <button className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
              Your Polling
            </button>
          </div>

          {/* Grid Posts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
                <div className="h-48 w-full overflow-hidden rounded-lg">
                  <img
                    src="/assets/Dummy_photo.jpeg"
                    alt="Post media"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <img
                    src="/assets/upvote(current).png"
                    alt="Upvote"
                    className="w-5 h-5 cursor-pointer transition-transform hover:scale-110 active:scale-125"
                  />
                  <img
                    src="/assets/upvote(current).png"
                    alt="Downvote"
                    className="w-5 h-5 cursor-pointer transition-transform hover:scale-110 active:scale-125 rotate-180"
                  />
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}