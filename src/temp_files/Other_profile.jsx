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
          <div className="flex-1 text-center pl-6">
            <h2 className="text-xl font-bold text-[#a50034]">Profil Pengguna</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-[#a50034] font-bold text-xl transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Isi Content Modal (Scrollable - Dihapus justify-center nya) */}
        <div className="p-6 overflow-y-auto space-y-6 flex flex-col items-center w-full">
          {loading ? (
            <div className="text-center py-10 font-semibold text-gray-500">
              Memuat profil...
            </div>
          ) : (
            <>
              {/* Header Info User */}
              <div className="bg-white border-2 border-[#a50034] rounded-xl p-3 flex items-center justify-center gap-4 w-full max-w-md shadow-xs flex-shrink-0">
                <img 
                  src={targetUser?.avatar_url || "/assets/Dummy_photo.png"} 
                  alt="Avatar" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#a50034] bg-white flex-shrink-0"
                />
                <div className="flex flex-col text-left">
                  <h3 className="text-xl font-black text-[#a50034] leading-tight">
                    @{targetUser?.username || "Pengguna"}
                  </h3>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Total Komplain: <span className="font-bold text-gray-800">{userPosts.length}</span> Post
                  </p>
                </div>
              </div>

              {/* Feed Komplain milik User */}
              <div className="w-full flex flex-col items-center">
                <h4 className="text-lg flex justify-center font-bold text-gray-800 border-b border-gray-300 pb-2 w-full text-center mb-4">
                  Riwayat Komplain
                </h4>

                {userPosts.length === 0 ? (
                  <div className="text-center text-gray-500 bg-white rounded-xl border border-gray-200 p-6 w-full">
                    Pengguna ini belum pernah membuat postingan.
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center gap-4">
                    {userPosts.map((postData) => (
                      <div key={postData.id} className="w-full flex justify-center [&>div]:min-w-0 [&>div]:w-full">
                        <Post post={postData} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}