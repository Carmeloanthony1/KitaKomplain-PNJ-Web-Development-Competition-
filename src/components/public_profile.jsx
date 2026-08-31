import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Focuspost from "../components/FocusPost";

export default function PublicProfile() {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("user_id");

  // Jika yang di-klik adalah ID diri sendiri, lempar langsung ke /profile pribadi
  useEffect(() => {
    if (targetUserId === currentUserId) {
      navigate("/profile", { replace: true });
    }
  }, [targetUserId, currentUserId, navigate]);

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Focus Post Modal
  const [selectedpost, setSelectedpost] = useState(null);
  const [isfocusopen, setIsfocusopen] = useState(false);

  useEffect(() => {
    if (!targetUserId) return;

    async function fetchPublicProfile() {
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

      // 2. Fetch Posts (FILTER SAFE: Ambil hanya post non-anonim)
      const { data: publicPosts, error: postError } = await supabase
        .from("posts")
        .select(`id, description, image_url, tag, is_anonim_mode, created_at, user_id, users (username, avatar_url)`)
        .eq("user_id", targetUserId)
        .neq("is_anonim_mode", true) // <-- Lebih ringkas & aman dari error sintaks Supabase
        .order("created_at", { ascending: false });

      if (postError) {
        console.error("Gagal mengambil post publik: ", postError.message);
      } else {
        setPosts(publicPosts || []);
      }

      setLoading(false);
    }

    fetchPublicProfile();
  }, [targetUserId]);

  const handlePostClick = (item) => {
    // Inject profil publik ke item post agar di FocusPost modal tampil seragam
    const formattedPost = {
      ...item,
      users: {
        username: isAnonim ? "Pengguna Anonim" : userData?.username || "User",
        avatar_url: isAnonim ? null : userData?.avatar_url,
      }
    };
    setSelectedpost(formattedPost);
    setIsfocusopen(true);
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading Profile...</div>;
  }

  if (!userData) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Pengguna tidak ditemukan.</div>;
  }

  // Jika user target mengaktifkan mode anonim akun
  const isAnonim = userData.is_anonim_mode;
  const displayName = isAnonim ? "Pengguna Anonim" : userData.username || "User";
  const displayAvatar = isAnonim ? null : userData.avatar_url;
  const displayBio = isAnonim ? "Pengguna ini berada dalam Mode Anonim." : userData.bio || "Belum ada deskripsi";

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
            <div className="-mt-14 mb-4 relative inline-block">
              <div className="w-28 h-28 border-4 border-white dark:border-[#1e1e1e] rounded-full shadow-md bg-white dark:bg-[#1e1e1e] overflow-hidden flex items-center justify-center">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Foto profil"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-700 text-white font-bold text-3xl flex items-center justify-center uppercase">
                    {isAnonim ? "🕵️" : displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#f1ece1]">
                {displayName}
              </h2>
            </div>

            <div className="my-5 inline-flex items-center gap-6 bg-gray-50/80 dark:bg-[#f1ece1] px-6 py-2.5 rounded-xl border border-gray-100 text-sm">
              <div>
                <span className="font-bold text-gray-900">{posts.length}</span>{" "}
                <span className="text-gray-500 dark:text-gray-900 font-medium">Public Posts</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-[#a50034] dark:text-[#f1ece1]">Deskripsi</h3>
              <p className="text-gray-700 dark:text-[#f1ece1] text-sm leading-relaxed">{displayBio}</p>
            </div>

          </div>
        </div>

        {/* Postingan Publik */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl min-h-[200px] flex items-center justify-center p-8">
          {posts.length === 0 ? (
            <p className="text-gray-400 dark:text-[#f1ece1] text-sm font-medium">
              Pengguna belum memiliki postingan publik.
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
          )}
        </div>

      </div>

      {/* Focus Post Modal */}
      <Focuspost 
        post={selectedpost}
        isOpen={isfocusopen} 
        onClose={() => setIsfocusopen(false)}
      />
    </div>
  );
}