import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";
import { useStatus } from "./StatusContext"; // 1. IMPORT USESTATUS (sesuaikan path kalo beda folder)

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
  const { showStatus } = useStatus(); // 2. PANGGIL HOOK

  const userId = localStorage.getItem("user_id");

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
      showStatus("Tag dan deskripsi wajib diisi!", "error"); // 3. GANTI
      return;
    }

    if (!userId) {
      showStatus("Silakan login terlebih dahulu!", "error"); // 4. GANTI
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
      showStatus("Postingan berhasil dibuat!", "success"); // 5. GANTI

      setDescription("");
      setTag("");
      setImage(null);
      setPreview(null);

      if (onPostCreated) onPostCreated();
      if (onClose) onClose();
    } catch (error) {
      console.error("Gagal membuat post:", error.message);
      showStatus("Gagal mengirim postingan: " + error.message, "error"); // 6. GANTI
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[999999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative z-[1000000] w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-2 dark:border-[#f1ece1] transition-colors"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-5 bg-transparent border-none text-xl font-bold text-gray-400 hover:text-black dark:text-[#f1ece1] dark:hover:text-white cursor-pointer transition-colors"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-[#f1ece1]">
            Tuliskan pengalaman anda
          </h2>

          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tambahkan tag/topik"
            className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none text-black dark:text-white bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />

          <textarea
            placeholder="Apa yang ingin kamu bagikan?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-3 h-32 p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none resize-none text-black dark:text-white bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />

          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer text-[#a50034] dark:text-[#f1ece1] hover:text-red-700 dark:hover:text-white font-medium w-fit transition-colors">
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
                className="max-h-48 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

{/* TEST PUSH 2*/}
          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#a50034] dark:bg-[#f1ece1] text-white dark:text-black py-2.5 px-6 rounded-xl hover:bg-[#800028] dark:hover:bg-white transition-colors font-bold cursor-pointer disabled:opacity-50"
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