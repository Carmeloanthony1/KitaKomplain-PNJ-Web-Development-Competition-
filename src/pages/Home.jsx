import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
import Post from "../components/Post";
import Most_Polling from "../components/Most_Polling";
import Notification from "../components/Notification";
import UserProfileModal from "../components/Other_profile";

export default function Home({ user, onLogout, onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selecteduser, setSelecteduser] = useState(null);
  const [is_otherprofile_open, setIs_otherprofile_open] = useState(false);

  useEffect(() => {
    async function fetchAllPosts() {
      setLoading(true);

      const { data, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal mengambil posts:", error.message);
      } else {
        setPosts(data);
      }
      setLoading(false);
    }

    fetchAllPosts();
  }, []);

  const handleUserClick = (targetUserId) => {
    const currentUserId = user?.id || localStorage.getItem("user_id");

    if (targetUserId === currentUserId) {
      if (onNavigate) onNavigate("profile");
    } else {
      setSelecteduser(targetUserId);
      setIs_otherprofile_open(true);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col relative">
      {/* Navbar pakai z-10 saja */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <Navbar 
          user={user} 
          openProfile={() => onNavigate && onNavigate("/profile")} 
          openNotifications={() => setIsNotificationOpen(true)}
        />
      </header>

      {/* Main Container */}
      <div className="flex flex-1 pt-24 px-6 md:px-10 gap-8 w-full justify-between items-start">
        {/* Sidebar Kiri */}
        <aside className="min-w-xs flex-shrink-0 sticky top-24 z-0">
          <Sidebar_Kiri 
            onNavigate={onNavigate}
            openNotifications={() => setIsNotificationOpen(true)}
          />
        </aside>

        {/* Main Feed */}
        <main className="flex-1 max-w-3xl mx-auto flex flex-col">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Belum ada postingan.
            </div>
          ) : (
            posts.map((postData) => (
              <Post 
                key={postData.id} 
                post={postData} 
                onUserClick={handleUserClick}
              />
            ))
          )}
        </main>

        {/* Sidebar Kanan (Most Polling) */}
        <aside className="w-[360px] flex-shrink-0 sticky top-24 z-0">
          <Most_Polling />
        </aside>
      </div>

      {/* Global Modals */}
      <Notification
        isOpen={isNotificationOpen}
        setIsOpen={setIsNotificationOpen}
      />

      <UserProfileModal
        userId={selecteduser}
        isOpen={is_otherprofile_open}
        onClose={() => setIs_otherprofile_open(false)}
      />
    </div>
  );
}