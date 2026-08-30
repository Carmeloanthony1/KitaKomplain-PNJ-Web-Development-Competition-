import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";

export const filter_tag = (raw_input) => {
  if (typeof raw_input === "string") {
    return raw_input.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().trim();
  }
  return "";
};

export function NewPost({ isOpen, onClose, onPostCreated }) {
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("user_id");

  // Jika modal sedang ditutup, stop render!
  if (!isOpen) return null;

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

    if (!description.trim() || !tag.trim()) {
      alert("Tag dan deskripsi wajib diisi!");
      return;
    }

    if (!userId) {
      alert("Silakan login terlebih dahulu!");
      return;
    }

    setLoading(true);

    try {
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

        imageURL = url_data.publicUrl;
      }

      const cleanedTag = filter_tag(tag);

      const { error: insert_error } = await supabase.from("posts").insert([
        {
          user_id: userId,
          description: description,
          tag: cleanedTag,
          image_url: imageURL,
        },
      ]);

      if (insert_error) throw insert_error;
      alert("Postingan berhasil dibuat!");

      setDescription("");
      setTag("");
      setImage(null);
      setPreview(null);

      if (onPostCreated) onPostCreated();
      if (onClose) onClose();
    } catch (error) {
      console.error("Gagal membuat post:", error.message);
      alert("Gagal mengirim postingan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* KOTAK FORM MODAL */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          position: 'relative',
          zIndex: 1000000,
          width: '100%',
          maxWidth: '32rem', // max-w-lg
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #f3f4f6'
        }}
      >
        {/* Tombol Silang Close */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#9ca3af',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Tuliskan pengalaman anda</h2>

          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tambahkan tag/topik"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a50034] text-black bg-white"
          />

          <textarea
            placeholder="Apa yang ingin kamu bagikan?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-3 h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a50034] resize-none text-black bg-white"
          />

          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer text-[#a50034] hover:text-red-700 font-medium w-fit">
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

          {preview && (
            <div className="relative mt-3 w-fit">
              <img
                src={preview}
                alt="preview"
                className="max-h-48 rounded-lg object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#a50034] text-white py-2.5 px-6 rounded-xl hover:bg-[#800028] transition-colors font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Posting"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default NewPost;