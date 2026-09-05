import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Post from "../components/Post";

export default function SearchPage({ user, onNavigate }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryTag = searchParams.get("tag") || "";
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focused_post, setFocused_post] = useState(null); 
  const CHUNK_SIZE = 40;
  const [visibleWordsMap, setVisibleWordsMap] = useState({});

  useEffect(() => {
    async function fetchSearchPosts() {
      if (!queryTag) {
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
        .ilike("tag", `%${queryTag}%`)
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

  const renderDescription = (post) => {
    const rawText = post.description || "";
    const words = rawText.trim().split(/\s+/);
    const totalWords = words.length;

    const currentVisible = visibleWordsMap[post.id] || CHUNK_SIZE;

    if (totalWords <= CHUNK_SIZE) {
      return (
        <p className="text-gray-800 dark:text-neutral-200 text-sm leading-relaxed sm:pl-[52px] break-words whitespace-pre-line">
          {rawText}
        </p>
      );
    }

    const hasMore = currentVisible < totalWords;
    const displayedWords = words.slice(0, currentVisible).join(" ");

    return (
      <div className="flex flex-col items-start sm:pl-[52px]">
        <p className="text-gray-800 dark:text-neutral-200 text-sm leading-relaxed break-words whitespace-pre-line">
          {displayedWords}
          {hasMore && "..."}
        </p>

        {hasMore ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVisibleWordsMap((prev) => ({
                ...prev,
                [post.id]: (prev[post.id] || CHUNK_SIZE) + CHUNK_SIZE,
              }));
            }}
            className="mt-1 text-xs font-bold text-[#8B0021] dark:text-[#f1ece1] hover:underline cursor-pointer focus:outline-none"
          >
            Lihat selengkapnya
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVisibleWordsMap((prev) => ({
                ...prev,
                [post.id]: CHUNK_SIZE,
              }));
            }}
            className="mt-1 text-xs font-bold text-gray-500 dark:text-neutral-400 hover:underline cursor-pointer focus:outline-none"
          >
            Sembunyikan
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-[#1a1a1a] flex flex-col transition-colors">
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#f7f7f7] dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-neutral-800">
        <Navbar user={user} openProfile={() => onNavigate && onNavigate("profile")} />
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full pt-24 pb-12 px-4">
        <div className="mb-6">
          <h2 className="text-gray-700 dark:text-neutral-300 font-semibold mb-2">Tag Populer</h2>
          {queryTag && (
            <span className="inline-block bg-[#8B0021] text-white px-4 py-1.5 rounded-full text-sm font-bold">
              #{queryTag}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-neutral-400">Mencari postingan...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-neutral-400">
            Tidak ada postingan dengan tag #{queryTag}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
                  onClick={() => setFocused_post(post)}
                  className="bg-white dark:bg-[#242424] border-2 border-[#8B0021]/30 rounded-2xl p-5 shadow-xs hover:border-[#8B0021] dark:hover:border-[#f1ece1] cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {post.users?.avatar_url ? (
                        <img
                          src={post.users.avatar_url}
                          alt={post.users?.username || "User"}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-neutral-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#8B0021] text-white font-bold flex items-center justify-center uppercase text-sm">
                          {(post.users?.username || "U")[0]}
                        </div>
                      )}
                      <h4 className="font-bold text-gray-900 dark:text-[#f1ece1] text-sm">
                        {post.users?.username || "Anonim"}
                      </h4>
                    </div>

                    {post.tag && (
                      <span className="inline-block bg-[#8B0021]/10 text-[#8B0021] dark:bg-[#8B0021]/20 dark:text-[#f1ece1] text-xs font-semibold px-2.5 py-1 rounded-full">
                        #{post.tag}
                      </span>
                    )}
                  </div>

                  {renderDescription(post)}

                  {attachmentCount > 0 && (
                    <div className="mt-3 pt-2 sm:pl-[52px]">
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
      </main>

      {/* Modal Popup Focus Post */}
      {focused_post && (
        <div
          onClick={() => setFocused_post(null)}
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-transparent relative my-auto"
          >
            <Post
              post={focused_post}
              hideaction={true}
              onClose={() => setFocused_post(null)}
              onUserClick={(userId) => {
                setFocused_post(null);
                if (onNavigate) onNavigate("profile");
                else navigate(`/user/${userId}`);
              }}
              onUpdate={(updated) => {
                setFocused_post((prev) => (prev ? { ...prev, ...updated } : null));
                setPosts((prev) =>
                  prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
                );
              }}
              onDelete={(deletedId) => {
                setFocused_post(null);
                setPosts((prev) => prev.filter((p) => p.id !== deletedId));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}