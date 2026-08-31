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

  // KONTRIBUSI DUA BRANCH: PAKE USECALLBACK & MINTA KOLOM is_anonim_mode
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

  // NAVIGASI LANGSUNG KE PUBLIC PROFILE
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

  if (loading) return <div className="p-10 text-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#1e1e1e] flex flex-col relative">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <Navbar 
          user={user} 
          openProfile={() => onNavigate ? onNavigate("profile") : navigate("/profile")} 
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
            openPostModal={() => setIsPostModalOpen(true)}
          />
        </aside>

        {/* Main Feed */}
        <main className="flex-1 max-w-4xl mx-auto flex flex-col items-center">
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
                onDelete={handlePostDeleted}
                onUpdate={handlePostUpdated}
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