import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
import Post from "../components/Post";
import Most_Polling from "../components/Most_Polling";
import Notification from "../components/Notification";
import { NewPost } from "../components/newpost";

export default function Home({ user, onLogout, onNavigate }) {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const [isdark, setIsdark] = useState(false);

  const toggle_darkmode = () => {
    const isdark = document.documentElement.classList.toggle("dark");
    setIsdark(isdark);
    if (isdark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setIsdark(true);
    }
  }, []);

  const fetchAllPosts = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        description,
        image_url,
        tag,
        is_anonim_mode,
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
      setPosts(data || []);
    }

    if (showLoader) setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllPosts(true);
  }, [fetchAllPosts]);

  const handleUserClick = (targetUserId) => {
    const currentUserId = user?.id || localStorage.getItem("user_id");

    if (targetUserId === currentUserId) {
      if (onNavigate) onNavigate("profile");
      else navigate("/profile");
    } else {
      navigate(`/user/${targetUserId}`);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
    );
  };

  if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading posts...</div>;

  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] dark:bg-[#1e1e1e] flex flex-col">
      {/* Navbar Fixed di Atas */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800">
        <Navbar 
          user={user} 
          openProfile={() => onNavigate ? onNavigate("profile") : navigate("/profile")} 
          openNotifications={() => setIsNotificationOpen(true)}
          onOpenNewPost={() => setIsPostModalOpen(true)}
        />
      </header>

      {/* Grid dibuat FULL WIDTH (w-full px-4/px-6) biar mentok pinggir */}
      <div className="pt-20 md:pt-24 pb-10 px-4 md:px-6 w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_340px] gap-6 items-start">
        
        {/* SIDEBAR KIRI: Mentok Kiri */}
        <aside className="hidden md:block w-full sticky top-24 self-start z-10">
          <Sidebar_Kiri 
            onNavigate={onNavigate}
            openNotifications={() => setIsNotificationOpen(true)}
            openPostModal={() => setIsPostModalOpen(true)}
          />
        </aside>

        {/* MAIN FEED: Di Tengah (1fr), postingan terpusat otomatis */}
        <main className="w-full max-w-2xl flex flex-col items-center justify-center min-w-0 mx-auto">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              Belum ada postingan.
            </div>
          ) : (
            posts.map((postData) => (
              <Post 
                key={postData.id} 
                post={postData} 
                onUserClick={handleUserClick}
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
              />
            ))
          )}
        </main>

        {/* SIDEBAR KANAN: Mentok Kanan */}
        <aside className="hidden lg:block w-full sticky top-24 self-start z-10">
          <Most_Polling />
        </aside>

      </div>

      {/* Global Modals */}
      <NewPost 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={() => fetchAllPosts(false)}
      />

      <Notification
        isOpen={isNotificationOpen}
        setIsOpen={setIsNotificationOpen}
      />
    </div>
  );
}