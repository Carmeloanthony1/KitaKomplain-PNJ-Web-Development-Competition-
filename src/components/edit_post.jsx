import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";

export default function Edit_post({ post, onclose, onpost_update }) {
  const [edit_tag, setEdit_tag] = useState(post?.tag || "");
  const [edit_description, setEdit_description] = useState(post?.description || "");
  const [edit_photo, setEdit_photo] = useState(post?.image_url || "");
  const [newphoto_url, setNewphoto_url] = useState(null);
  const [is_update, setIs_update] = useState(false);

  const handlenew_image = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewphoto_url(file);
      setEdit_photo(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setNewphoto_url(null);
    setEdit_photo("");
  };

  const handleSave_edit = async (e) => {
    e.preventDefault();

    if (!edit_description.trim() || !edit_tag.trim()) {
      alert("tag dan deskripsi wajib diisi");
      return;
    }

    setIs_update(true);

    try {
      let final_image_url = edit_photo ? post.image_url : null;

      if (newphoto_url) {
        const fileEXT = newphoto_url.name.split(".").pop();
        const filename = `post_${Date.now()}.${fileEXT}`;
        const filepath = `posts/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filepath, newphoto_url);

        if (uploadError) {
          alert("Gagal mengunggah foto baru: " + uploadError.message);
          setIs_update(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("posts")
          .getPublicUrl(filepath);

        final_image_url = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from("posts")
        .update({
          tag: edit_tag,
          description: edit_description,
          image_url: final_image_url,
          is_update: true,
        })
        .eq("id", post.id);

      if (error) {
        alert("Gagal memperbarui postingan: " + error.message);
      } else {
        alert("Postingan berhasil diperbarui!");
        if (onpost_update) onpost_update();
        if (onclose) onclose();
      }
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIs_update(false);
    }
  };

  // Komponen Modal yang akan ditarik keluar DOM
  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 pt-5 pb-2">
          <h2 className="text-xl font-bold text-black">Edit postingan</h2>
          <button
            type="button"
            onClick={onclose}
            className="text-gray-400 hover:text-black text-lg font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave_edit} className="px-6 pb-6 pt-2 flex flex-col gap-3 overflow-y-auto">
          <input
            type="text"
            value={edit_tag}
            onChange={(e) => setEdit_tag(e.target.value)}
            placeholder="Tambahkan tag..."
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a50034] text-sm"
          />

          <textarea
            placeholder="Apa yang ingin kamu bagikan?"
            value={edit_description}
            onChange={(e) => setEdit_description(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a50034] text-sm resize-none"
          />

          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-[#a50034] hover:text-blue-700 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-[#a50034]" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span>{edit_photo ? "Ganti gambar" : "Tambahkan gambar"}</span>
              <input type="file" accept="image/*" onChange={handlenew_image} className="hidden" />
            </label>
          </div>

          {edit_photo && (
            <div className="relative mt-3 w-fit border border-gray-200 rounded-xl">
              <img src={edit_photo} alt="preview" className="max-h-64 object-cover rounded-lg" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onclose}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={is_update}
              className="px-6 py-2 rounded-xl bg-[#a50034] text-white font-medium hover: bg-[#a50034] transition-colors text-sm cursor-pointer disabled:opacity-50"
            >
              {is_update ? "Memproses..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render modal langsung ke document.body
  return createPortal(modalContent, document.body);
}