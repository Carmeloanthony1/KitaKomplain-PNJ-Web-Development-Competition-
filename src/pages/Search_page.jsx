import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Post from "../components/Post";

export default function Search_page() {
  const [searchparams, setSearchparams] = useSearchParams();
  const query_tag = searchparams.get("tag") || "";

  const [search_input, setSearch_input] = useState(query_tag);
  const [popular_tags, setPopular_tags] = useState([]);
  const [output_search, setOutput_search] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Ambil data tag & hitung frekuensi saat pertama kali halaman dimuat
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

      // Urutkan dari yang postingannya terbanyak ke sedikit
      const sorted_tags = Object.keys(tag_count)
        .map((tag) => ({ tag, count: tag_count[tag] }))
        .sort((a, b) => b.count - a.count);

      setPopular_tags(sorted_tags);
      setOutput_search(sorted_tags); // Default tampilkan semua urut terpopuler
    }
  };

  useEffect(() => {
    fetch_tag();
  }, []);

  // 2. Filter tag secara real-time saat user mengetik
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
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8">
      {/* Header & Search Bar Pill (Sesuai Desain Canva) */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-[#a50034]">KitaKomplain</h1>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search_input}
            onChange={(e) => setSearch_input(e.target.value)}
            placeholder="Hitam"
            className="w-full px-5 py-2 border-2 border-[#a50034] rounded-full text-center text-gray-800 font-bold focus:outline-none bg-white shadow-xs"
          />
          <svg
            className="w-5 h-5 absolute right-4 top-3 stroke-[#a50034] fill-none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        <button className="bg-[#a50034] text-white px-5 py-2 rounded-full font-bold flex items-center gap-2 cursor-pointer">
          <span>Akusuka</span>
          <div className="w-6 h-6 rounded-full bg-white/30" />
        </button>
      </div>

      {/* TAMPILAN 1: GRID 2 KOLOM (Daftar Tag) */}
      {!query_tag && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {output_search.length > 0 ? (
            output_search.map((item) => (
              <div
                key={item.tag}
                onClick={() => handle_select_tag(item.tag)}
                className="border-2 border-[#a50034] bg-[#fdfaf8] hover:bg-[#a50034] hover:text-white rounded-3xl p-6 flex justify-between items-center cursor-pointer transition-all duration-200 group shadow-xs"
              >
                <span className="font-extrabold text-lg text-gray-800 group-hover:text-white">
                  #{item.tag}
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-[#a50034]/10 text-[#a50034] rounded-full group-hover:bg-white group-hover:text-[#a50034]">
                  {item.count} Postingan
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-400 font-bold py-10">
              Tidak ada tag yang sesuai.
            </div>
          )}
        </div>
      )}

      {/* TAMPILAN 2: LIST POSTINGAN (Muncul pas Tag diklik) */}
      {query_tag && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Hasil untuk: <span className="text-[#a50034]">#{query_tag}</span>
            </h2>
            <button
              onClick={() => {
                setSearchparams({});
                setSearch_input("");
              }}
              className="text-xs font-bold text-[#a50034] hover:underline cursor-pointer"
            >
              ← Kembali ke daftar tag
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 font-semibold py-8">
              Memuat postingan...
            </p>
          ) : posts.length > 0 ? (
            posts.map((postData) => (
              <Post key={postData.id} post={postData} />
            ))
          ) : (
            <p className="text-center text-gray-400 py-8 font-semibold">
              Belum ada postingan untuk tag ini.
            </p>
          )}
        </div>
      )}
    </div>
  );
}