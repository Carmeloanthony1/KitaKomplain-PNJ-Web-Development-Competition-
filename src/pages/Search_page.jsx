import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function SearchPage({ user }) {
  const [searchParams] = useSearchParams();
  const queryTag = searchParams.get("tag") || "";

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTagsFromDB = async () => {
      setLoading(true);
      setError(null);
      try {
        // Panggil endpoint backend kamu
        const res = await fetch(`http://localhost:5000/api/tags?query=${encodeURIComponent(queryTag)}`);
        
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        
        const data = await res.json();
        setTags(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTagsFromDB();
  }, [queryTag]); // Rerender tiap kali param ?tag= berubah

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />

      <main className="max-w-7xl mx-[#a50034] px-6 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Tag Populer</h1>

        {/* State Loading */}
        {loading && <p className="text-gray-500 font-semibold">Memuat data dari database...</p>}

        {/* State Error */}
        {error && <p className="text-red-500 font-semibold">{error}</p>}

        {/* Hasil Data DB */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-3">
            {tags.length > 0 ? (
              tags.map((item) => (
                <span 
                  key={item.id || item._id} 
                  className="bg-[#a50034] text-white px-4 py-2 rounded-full font-bold cursor-pointer hover:bg-[#801427] transition"
                >
                  #{item.name}
                </span>
              ))
            ) : (
              <p className="text-gray-400 font-semibold">
                Tidak ada tag yang sesuai dengan "{queryTag}" di database.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}