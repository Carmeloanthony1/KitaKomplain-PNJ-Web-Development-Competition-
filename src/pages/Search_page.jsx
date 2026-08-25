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

        // Fetch Posts sesuai pencarian
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

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Section Tag Populer */}
        <div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Tag Populer</h1>
          <div className="flex flex-wrap gap-3">
            {tags.length > 0 ? (
              tags.map((item) => (
                <span 
                  key={item.id} 
                  className="bg-[#a50034] text-white px-4 py-1.5 rounded-full font-bold cursor-pointer hover:bg-[#801427] transition"
                >
                  #{item.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Tidak ada tag yang sesuai.</p>
            )}
          </div>
        </div>

        {/* Section List Posts (Desain Kapsul Canva) */}
        <div className="mt-4 flex flex-col gap-4">
          {loading ? (
            <p className="text-gray-500 font-semibold text-center py-6">Memuat postingan...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div 
                key={post.id} 
                className="w-full bg-[#fdfaf8] border-2 border-[#a50034] rounded-[35px] p-5 shadow-sm hover:shadow-md transition flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>
                  {post.tag && (
                    <span className="bg-[#a50034] text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {post.tag.startsWith('#') ? post.tag : `#${post.tag}`}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{post.description}</p>
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="mt-2 rounded-2xl max-h-60 object-cover w-full"
                  />
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