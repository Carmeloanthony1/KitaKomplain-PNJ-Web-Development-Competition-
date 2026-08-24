import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Post from "../components/Post";
import Navbar from "../components/Navbar";

export default function Search_page({ user, onNavigate }) {
  const [searchparams, setSearchparams] = useSearchParams();
  const query_tag = searchparams.get("tag") || "";

  const [search_input, setSearch_input] = useState(query_tag);
  const [popular_tags, setPopular_tags] = useState([]);
  const [output_search, setOutput_search] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Ambil data tag & hitung frekuensi
  const fetch_tag = async () => {
    const { data, error } = await supabase.from("posts").select("tags, title");

    if (!error && data) {
      const tag_count = {};

      data.forEach((item) => {
        const raw_tags = item.tags || (item.title ? [item.title] : []);
        raw_tags.forEach((t) => {
          const clean_tag = t.replace(/\s+/g, "").toLowerCase();
          if (clean_tag) {
            tag_count[clean_tag] = (tag_count[clean_tag] || 0) + 1;
          }
        });
      });

      const sorted_tags = Object.keys(tag_count)
        .map((tag) => ({ tag, count: tag_count[tag] }))
        .sort((a, b) => b.count - a.count);

      setPopular_tags(sorted_tags);
      setOutput_search(sorted_tags);
    }
  };

  useEffect(() => {
    fetch_tag();
  }, []);

  // 2. Filter tag secara real-time
  useEffect(() => {
    const clean_input = search_input.trim().toLowerCase().replace(/^#/, "");

    if (clean_input.length >= 1) {
      const matched = popular_tags.filter((item) =>
        item.tag.includes(clean_input)
      );
      setOutput_search(matched);
    } else {
      setOutput_search(popular_tags);
    }
  }, [search_input, popular_tags]);

  // 3. Fetch postingan jika tag diklik / query_tag di URL ada
  const fetch_posts_by_tag = async (tag_to_search) => {
    setLoading(true);
    const clean_tag = tag_to_search.trim().toLowerCase().replace(/^#/, "");

    const { data, error } = await supabase
      .from("posts")
      .select(`*, users (id, username, avatar_url)`)
      .or(`tags.cs.{${clean_tag}},title.ilike.%${clean_tag}%`)
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (query_tag) {
      setSearch_input(query_tag);
      fetch_posts_by_tag(query_tag);
    } else {
      setPosts([]);
    }
  }, [query_tag]);

  const handle_select_tag = (selected_tag) => {
    setSearchparams({ tag: selected_tag });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Fixed di Atas */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white">
        <Navbar user={user} openProfile={() => onNavigate && onNavigate("profile")} />
      </header>

      {/* Main Container: diberi pt-28 / pt-32 biar gak ketutupan Navbar yang makin tinggi */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 flex flex-col gap-8">
        
        {/* TAMPILAN 1: GRID DAFTAR TAG (Ubah ke grid-cols-1 md:grid-cols-2 lg:grid-cols-3 biar proporsional dan gagah) */}
        {!query_tag && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-black text-gray-800">
              Tag Populer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {output_search.length > 0 ? (
                output_search.map((item) => (
                  <div
                    key={item.tag}
                    onClick={() => handle_select_tag(item.tag)}
                    /* Card dibuat lebih padat (p-6) & ada shadow hover effect biar keliatan gede & interaktif */
                    className="border-2 border-[#a50034] bg-[#fdfaf8] hover:bg-[#a50034] rounded-2xl p-6 flex justify-between items-center cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
                  >
                    <span className="font-extrabold text-xl text-gray-800 group-hover:text-white">
                      #{item.tag}
                    </span>
                    <span className="text-sm font-bold px-3.5 py-1.5 bg-[#a50034]/10 text-[#a50034] rounded-full group-hover:bg-white group-hover:text-[#a50034]">
                      {item.count} Postingan
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 font-bold py-16 text-lg">
                  Tidak ada tag yang sesuai.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAMPILAN 2: LIST POSTINGAN */}
        {query_tag && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-black text-gray-800">
                Hasil untuk: <span className="text-[#a50034]">#{query_tag}</span>
              </h2>
              <button
                onClick={() => {
                  setSearchparams({});
                  setSearch_input("");
                }}
                className="text-sm font-bold text-[#a50034] hover:underline cursor-pointer bg-[#a50034]/10 px-4 py-2 rounded-full transition"
              >
                ← Kembali ke daftar tag
              </button>
            </div>

            {loading ? (
              <p className="text-center text-gray-400 font-bold py-16 text-lg">
                Memuat postingan...
              </p>
            ) : posts.length > 0 ? (
              posts.map((postData) => (
                <Post key={postData.id} post={postData} />
              ))
            ) : (
              <p className="text-center text-gray-400 py-16 font-bold text-lg">
                Belum ada postingan untuk tag ini.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}