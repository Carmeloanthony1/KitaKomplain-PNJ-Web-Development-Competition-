import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Post from "./Post";

export default function UserProfileModal({ userId, isOpen, onClose }) {
  const [targetUser, setTargetUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    async function fetchUserData() {
      setLoading(true);

      // 1. Fetch data profil user target
      const { data: userData } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .eq("id", userId)
        .single();

      setTargetUser(userData);

      // 2. Fetch postingan milik user target ini
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          id,
          description,
          image_url,
          tag,
          created_at,
          user_id,
          users (
            username,
            avatar_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setUserPosts(postsData || []);
      setLoading(false);
    }

    fetchUserData();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      {/* Box Modal Profil */}
      <div className="bg-[#f7f7f7] border-2 border-[#a50034] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header Modal & Tombol Close */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-[#a50034]">Profil Pengguna</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-[#a50034] font-bold text-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Isi Content Modal (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-center py-10 font-semibold text-gray-500">
              Memuat profil...
            </div>
          ) : (
            <>
              {/* Header Info User */}
              <div className="bg-white border-2 border-[#a50034] rounded-2xl p-6 flex items-center justify-center gap-5 shadow-xs">
                <img 
                  src={targetUser?.avatar_url || "/assets/Dummy_photo.png"} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#a50034] bg-white"
                />
                <div>
                  <h3 className="text-2xl font-black text-[#a50034]">
                    @{targetUser?.username || "Pengguna"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Total Komplain: <span className="font-bold text-gray-800">{userPosts.length}</span> Post
                  </p>
                </div>
              </div>

              {/* Feed Komplain milik User */}
              <div>
                <h4 className="text-lg flex justify-center font-bold text-gray-800 border-b border-gray-300 pb-2">
                  Riwayat Komplain
                </h4>

                {userPosts.length === 0 ? (
                  <div className="text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                    Pengguna ini belum pernah membuat postingan.
                  </div>
                ) : (
                  userPosts.map((postData) => (
                    <Post key={postData.id} post={postData} />
                  ))
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}