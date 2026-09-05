import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";
import { useStatus } from "./StatusContext"; 

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
  const { showStatus } = useStatus(); 

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
      showStatus("Tag dan deskripsi wajib diisi!", "error"); 
      return;
    }

    if (!userId) {
      showStatus("Silakan login terlebih dahulu!", "error"); 
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
      showStatus("Postingan berhasil dibuat!", "success"); 

      setDescription("");
      setTag("");
      setImage(null);
      setPreview(null);

      if (onPostCreated) onPostCreated();
      if (onClose) onClose();
    } catch (error) {
      console.error("Gagal membuat post:", error.message);
      showStatus("Gagal mengirim postingan: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[999999] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-7 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative z-[1000000] w-full max-w-lg max-h-[95vh] overflow-y-auto bg-white dark:bg-[#1e1e1e] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-100 dark:border-2 dark:border-[#f1ece1] transition-colors"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-5 bg-transparent border-none text-xl sm:text-2xl font-bold text-gray-400 hover:text-black dark:text-[#f1ece1] dark:hover:text-white cursor-pointer transition-colors"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col mt-3 sm:mt-0">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-[#f1ece1]">
            Tuliskan pengalaman anda
          </h2>

          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tambahkan tag/topik"
            className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none text-black dark:text-white bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />

          <textarea
            placeholder="Apa yang ingin kamu bagikan?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-3 h-28 sm:h-32 p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none resize-none text-black dark:text-white bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />

          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer text-[#a50034] dark:text-[#f1ece1] hover:text-red-700 dark:hover:text-white text-sm sm:text-base font-medium w-fit transition-colors">
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
            <div className="relative mt-3 w-fit max-w-full">
              <img
                src={preview}
                alt="preview"
                className="max-h-32 sm:max-h-48 w-auto rounded-lg object-contain sm:object-cover border border-gray-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 text-xs cursor-pointer shadow-md"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-end mt-4 sm:mt-5">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#a50034] dark:bg-[#f1ece1] text-white dark:text-black py-2.5 px-6 rounded-xl hover:bg-[#800028] dark:hover:bg-white transition-colors text-sm sm:text-base font-bold cursor-pointer disabled:opacity-50"
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