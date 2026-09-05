import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
import Post from "../components/Post";
import Focuspost from "../components/FocusPost";
import Most_Polling from "../components/Most_Polling";
import Notification from "../components/Notification";
import { NewPost } from "../components/newpost";
import History from "../components/History";

export default function Home({ user, onLogout, onNavigate }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sharedPostId = searchParams.get("post_id");
  const [sharedFocusedPost, setSharedFocusedPost] = useState(null);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPollingModalOpen, setIsPollingModalOpen] = useState(false);
  const [isdark, setIsdark] = useState(false);

  const toggle_darkmode = () => {
    const isdarkState = document.documentElement.classList.toggle("dark");
    setIsdark(isdarkState);
    if (isdarkState) {
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

  useEffect(() => {
    if (!sharedPostId) {
      setSharedFocusedPost(null);
      return;
    }

    const fetchSharedPost = async () => {
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
        .eq("id", sharedPostId)
        .single();

      if (!error && data) {
        setSharedFocusedPost(data);
      }
    };

    fetchSharedPost();
  }, [sharedPostId]);

  useEffect(() => {
    if (sharedFocusedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sharedFocusedPost]);

  const handleCloseSharedFocus = () => {
    setSharedFocusedPost(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("post_id");
    setSearchParams(newParams, { replace: true });
  };

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
    if (!updatedPost?.id) {
      fetchAllPosts(false);
      return;
    }
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
    );
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading posts...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] dark:bg-[#1e1e1e] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800">
        <Navbar 
          user={user} 
          openProfile={() => (onNavigate ? onNavigate("profile") : navigate("/profile"))} 
          openNotifications={() => setIsNotificationOpen(true)}
          openHistory={() => setIsHistoryOpen(true)}
          onOpenNewPost={() => setIsPostModalOpen(true)}
          openPollingModal={() => setIsPollingModalOpen(true)}
        />
      </header>

      <div className="pt-20 md:pt-24 pb-10 px-4 md:px-6 w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_340px] gap-6 items-start">
        <aside className="hidden md:block w-full sticky top-24 self-start z-10">
          <Sidebar_Kiri 
            onNavigate={onNavigate}
            openNotifications={() => setIsNotificationOpen(true)}
            openHistory={() => setIsHistoryOpen(true)}
            openPostModal={() => setIsPostModalOpen(true)}
          />
        </aside>

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

        <aside className="hidden lg:block w-full sticky top-24 self-start z-10">
          <Most_Polling />
        </aside>
      </div>

      {sharedFocusedPost && (
        <div
          onClick={handleCloseSharedFocus}
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-transparent relative my-auto"
          >
            <Post
              post={sharedFocusedPost}
              hideaction={false}
              onClose={handleCloseSharedFocus}
              onUserClick={(userId) => {
                handleCloseSharedFocus();
                if (onNavigate) onNavigate("profile");
                else navigate(`/user/${userId}`);
              }}
              onUpdate={(updated) => {
                setSharedFocusedPost((prev) => (prev ? { ...prev, ...updated } : null));
                fetchAllPosts(false);
              }}
              onDelete={() => {
                handleCloseSharedFocus();
                fetchAllPosts(false);
              }}
            />
          </div>
        </div>
      )}

      {isPollingModalOpen && (
        <div 
          onClick={() => setIsPollingModalOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1e1e1e] w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-neutral-800 max-h-[85vh] overflow-y-auto relative"
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="font-bold text-base text-[#a50034] dark:text-[#f1ece1]">Most Polling</h2>
              <button 
                type="button"
                onClick={() => setIsPollingModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <Most_Polling />
          </div>
        </div>
      )}

      <NewPost 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={() => fetchAllPosts(false)}
      />

      <Notification
        isOpen={isNotificationOpen}
        setIsOpen={setIsNotificationOpen}
      />

      <History 
        isOpen={isHistoryOpen} 
        setIsOpen={setIsHistoryOpen} 
      />
    </div>
  );
}