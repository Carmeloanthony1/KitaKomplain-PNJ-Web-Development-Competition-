import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
import Post from "../components/Post";
import Most_Polling from "../components/Most_Polling";
import Notification from "../components/Notification";

export default function Home({ user, onLogout, onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Ambil ID user yang lagi login
  const currentUserId = user?.id || localStorage.getItem("user_id");

  useEffect(() => {
    async function fetchAllPosts() {
      setLoading(true);

      // Mengambil SEMUA post dari semua user (feed publik)
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

  if (loading) return <div className="p-10 text-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      {/* 1. Header dibuat w-full p-0 tanpa px-8 biar Navbar narik mentok ujung ke ujung */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
        <Navbar 
          user={user} 
          openProfile={() => onNavigate && onNavigate("/profile")} 
          openNotifications={() => setIsNotificationOpen(true)}
        />
      </header>

      {/* 2. Container body disesuaikan padding-nya */}
      <div className="flex flex-1 pt-24 px-6 md:px-10 gap-8 w-full justify-between items-start">
        <aside className="min-w-xs flex-shrink-0 sticky top-24 z-20">
          <Sidebar_Kiri 
            onNavigate={onNavigate}
            openNotifications={() => setIsNotificationOpen(true)}
          />
        </aside>

        <main className="flex-1 max-w-3xl mx-auto z-10 flex flex-col">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Belum ada postingan.
            </div>
          ) : (
            posts.map((postData) => <Post key={postData.id} post={postData} />)
          )}
        </main>

        <aside className="w-[360px] flex-shrink-0 sticky top-24 z-0">
          <Most_Polling />
        </aside>
      </div>

      <Notification
        isOpen={isNotificationOpen}
        setIsOpen={setIsNotificationOpen}
      />
    </div>
  );
}