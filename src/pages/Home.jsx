import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";
import Post from "../components/Post";
import Most_Polling from "../components/Most_Polling";

export default function Home({ user, onLogout, onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);

      // 1. Fetch data posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Gagal mengambil posts:", postsError.message);
        setLoading(false);
        return;
      }

      // 2. Fetch data users untuk mencocokkan user_id
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, username, avatar_url");

      if (usersError) {
        console.error("Gagal mengambil users:", usersError.message);
      }

      // 3. Gabungkan data user ke tiap post
      const formattedPosts = postsData.map((p) => {
        const author = usersData?.find((u) => u.id === p.user_id);
        return {
          ...p,
          users: author || { username: "Anonim", avatar_url: "" },
        };
      });

      setPosts(formattedPosts);
      setLoading(false);
    }

    fetchPosts();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading posts...</div>;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#f7f7f7] border-b border-gray-200 px-8 py-3">
        <Navbar user={user} openProfile={() => onNavigate && onNavigate("profile")} />
      </header>

      <div className="flex flex-1 pt-20 px-8 gap-8 w-full justify-between items-start">
        <aside className="min-w-xs flex-shrink-0 sticky top-24 z-50">
          <Sidebar_Kiri onNavigate={onNavigate} />
        </aside>

        <main className="flex-1 max-w-3xl mx-auto z-10 flex flex-col gap-6">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Belum ada postingan</div>
          ) : (
            posts.map((postData) => <Post key={postData.id} post={postData} />)
          )}
        </main>

        <aside className="w-[360px] flex-shrink-0 sticky top-24 z-0">
          <Most_Polling />
        </aside>
      </div>
    </div>
  );
}