import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

// Helper Sanitasi Tag
    export const filter_tag = (raw_input) => {
    if (typeof raw_input === "string") {
        // Hapus semua spasi dan karakter non-alphanumeric
        const clean = raw_input.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().trim();
        return clean;
    }
    return "";
    };

    // Komponen Utama (Named Export & Default Export disatukan)
    export function NewPost() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tag, setTag] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem("user_id");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setImage(file);
        setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !tag.trim()) {
            alert("Judul, tag dan deskripsi wajib diisi!");
            return;
        }

        if (!userId) {
            alert("Silakan login terlebih dahulu!");
            return;
        }

        setLoading(true);

        try {
            // 1. DEKLARASIKAN VARIABEL imageURL DI SINI BIAR BISA DIAKSES OLEH SUPABASE INSERT
            let imageURL = null; 

            if (image) {
            const fileEXT = image.name.split(".").pop();
            const filename = `${userId}_${Date.now()}.${fileEXT}`;
            const filepath = `posts/${filename}`;

            const { error: uploadError } = await supabase.storage
                .from("posts")
                .upload(filepath, image);

            if (uploadError) throw uploadError;

            const { data: url_data } = supabase.storage
                .from("posts")
                .getPublicUrl(filepath);

            // Isi nilainya jika upload gambar berhasil
            imageURL = url_data.publicUrl; 
            }

            const cleanedTag = filter_tag(tag);

            // 2. MASUKKAN VARIABEL imageURL KE PERINTAH INSERT
            const { error: insert_error } = await supabase.from("posts").insert([
            {
                user_id: userId,
                title: title,
                description: description,
                tag: cleanedTag,
                image_url: imageURL, // Jangan sampai typo jadi image_url: image_url
            },
            ]);

            if (insert_error) throw insert_error;
            alert("Postingan berhasil dibuat!");

            // Reset Form & Navigate
            setTitle("");
            setDescription("");
            setTag("");
            setImage(null);
            setPreview(null);

            navigate("/home");
        } catch (error) {
            console.error("Gagal membuat post:", error.message);
            alert("Gagal mengirim postingan: " + error.message);
        } finally {
            setLoading(false);
        }
    };
  return (
    <div className="flex">
      <div className="flex flex-col flex-1">
        <form onSubmit={handleSubmit} className="mt-4 w-full bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Tuliskan pengalaman anda</h2>

          {/* Input Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul postingan"
            className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          />

          {/* Input Tag */}
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tambahkan tag (pisahkan dengan koma, contoh: nignig, pnj)"
            className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Input Description */}
          <textarea
            placeholder="Apa yang ingin kamu bagikan?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-3 h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Input Gambar */}
          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer text-blue-500 hover:text-blue-600 w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span>Tambahkan gambar</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview Gambar */}
          {preview && (
            <div className="relative mt-3 w-fit">
              <img
                src={preview}
                alt="preview"
                className="max-h-64 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80"
              >
                ×
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-150 cursor-pointer"
          >
            {loading ? "Mengirim..." : "Posting"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Menambahkan default export sebagai cadangan
export default NewPost;