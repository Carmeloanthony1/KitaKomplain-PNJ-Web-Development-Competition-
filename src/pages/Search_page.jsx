import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function SearchPage({ user }) {
  const [searchParams] = useSearchParams();
  const queryTag = searchParams.get("tag") || "";

  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Tags
        const resTags = await fetch(`http://localhost:5000/api/tags?query=${encodeURIComponent(queryTag)}`);
        const dataTags = await resTags.json();
        setTags(Array.isArray(dataTags) ? dataTags : []);

        // Fetch Posts
        const resPosts = await fetch(`http://localhost:5000/api/posts?query=${encodeURIComponent(queryTag)}`);
        const dataPosts = await resPosts.json();
        setPosts(Array.isArray(dataPosts) ? dataPosts : []);

      } catch (err) {
        console.error("Gagal load data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryTag]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Section Tag Populer */}
        <div>
          <h1 className="text-xl font-bold mb-3 text-gray-800">Tag Populer</h1>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((item) => (
                <span 
                  key={item.id} 
                  className="bg-[#a50034] text-white px-3.5 py-1 rounded-full text-sm font-bold cursor-pointer hover:bg-[#801427] transition"
                >
                  #{item.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Tidak ada tag yang sesuai.</p>
            )}
          </div>
        </div>

        {/* Section List Posts (Ukuran Lebih Ringkas) */}
        <div className="mt-2 flex flex-col gap-4">
          {loading ? (
            <p className="text-gray-500 font-semibold text-center py-6">Memuat postingan...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div 
                key={post.id} 
                className="w-full bg-[#fdfaf8] cursor-pointer border-2 border-[#a50034] rounded-[24px] p-4 shadow-sm hover:shadow-md hover:scale-102 transition flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-gray-900">{post.title}</h2>
                  {post.tag && (
                    <span className="bg-[#a50034] text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {post.tag.startsWith('#') ? post.tag : `#${post.tag}`}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-2">{post.description}</p>

                {post.image_url && (
                  <div className="w-xs h-48 sm:h-56 mt-1 overflow-hidden rounded-xl border border-gray-200">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="min-w-xs h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 font-medium">
              Belum ada postingan komplain untuk pencarian ini.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}