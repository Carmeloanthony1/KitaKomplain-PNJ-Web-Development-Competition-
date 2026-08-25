import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";

export default function SearchPage({ user, onNavigate }) {
  const [searchParams] = useSearchParams();
  const queryTag = searchParams.get("tag") || "";
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearchPosts() {
      if (!queryTag || queryTag.trim() === "") {
        setPosts([]);
        setLoading(false);
        return;
      }

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
        .ilike("tag", `%${queryTag.toLowerCase()}%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal melakukan pencarian:", error.message);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }

    fetchSearchPosts();
  }, [queryTag]);

  useEffect(() => {
    const search_input = document.querySelector('input[placeholder="Cari topik"]');

    if(search_input){
      search_input.focus();
      const valLength = search_input.value.length;
      search_input.setSelectionRange(valLength, valLength);
    }
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] flex flex-col overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#f7f7f7] border-b border-gray-200">
        <Navbar user={user} openProfile={() => onNavigate && onNavigate("profile")} />
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto pt-24 pb-12 px-4 flex flex-col">
        {/* Header Tag Populer / Active Tag */}
        <div className="mb-6 w-full">
          <h2 className="text-gray-700 font-semibold mb-2">Tag Populer</h2>
          {queryTag && (
            <span className="inline-block bg-[#8B0021] text-white px-4 py-1.5 rounded-full text-sm font-bold">
              #{queryTag.toLowerCase()}
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="w-full flex-1">
          {loading ? (
            <div className="w-full text-center py-20 text-gray-500 font-medium">
              Mencari postingan...
            </div>
          ) : posts.length === 0 ? (
            <div className="w-full text-center py-20 text-gray-500 font-medium">
              Tidak ada postingan dengan tag #{queryTag}
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              {posts.map((post) => {
                let attachmentCount = 0;
                if (Array.isArray(post.image_url)) {
                  attachmentCount = post.image_url.length;
                } else if (post.image_url) {
                  attachmentCount = 1;
                }

                return (
                  <div
                    key={post.id}
                    className="w-full bg-white border-2 border-[#8B0021]/30 rounded-2xl p-5 shadow-sm hover:border-[#8B0021] transition-all"
                  >
                    {/* Header User */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.users?.avatar_url || "https://via.placeholder.com/40"}
                          alt={post.users?.username || "User"}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <h4 className="font-bold text-gray-900 text-sm">
                          {post.users?.username || "Anonim"}
                        </h4>
                      </div>

                      {post.tag && (
                        <span className="inline-block bg-[#8B0021]/10 text-[#8B0021] text-xs font-semibold px-2.5 py-1 rounded-full">
                          #{post.tag.toLowerCase()}
                        </span>
                      )}
                    </div>

                    {/* Body Deskripsi */}
                    <p className="text-gray-800 text-sm leading-relaxed pl-[52px]">
                      {post.description}
                    </p>

                    {/* Attachment Indicator */}
                    {attachmentCount > 0 && (
                      <div className="mt-3 pt-2 pl-[52px]">
                        <div className="inline-flex items-center gap-1.5 bg-[#8B0021] text-white text-xs font-medium px-3 py-1.5 rounded-lg w-fit">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span className="font-bold">
                            {attachmentCount} {attachmentCount === 1 ? "Attachment" : "Attachments"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}