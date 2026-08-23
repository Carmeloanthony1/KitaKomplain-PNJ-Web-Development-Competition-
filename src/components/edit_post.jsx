import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Edit_post ({ post, onclose, onpost_update}){
    //pake yang lama, kalau ga ada di kosongin jadi pake kosongan
    const [edit_title, setEdit_title] = useState(post.title || "");
    const [edit_tag, setEdit_tag] = useState(post.tag || "");
    const [edit_description, setEdit_description] = useState(post.description || "");
    const [edit_photo, setEdit_photo] = useState(post.image_url || "");
    const [newphoto_url, setNewphoto_url] = useState(null);
    const [is_update, setIs_update] = useState(false);

    const handlenew_image = (e) => {
        const file = e.target.files[0];
        if(file){
            setNewphoto_url(file);
            setEdit_photo(URL.createObjectURL(file));
        }
    };

    const handleSave_edit = async (e) => {
        e.preventDefault();
        setIs_update(true);

        let final_image_url = post.image_url;

        if(newphoto_url){
            const filename = `post_${Date.now()}_${newphoto_url.name}`;
            const { data, error: uploadError } = await supabase.storage
                .from("post-images")
                .upload(filename, newphoto_url);

            if(uploadError){
                alert("Gagal mengunggah foto baru: " + uploadError.message);
                setIs_update(false);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("post-images")
                .getPublicUrl(filename);
            
            final_image_url = publicUrlData.publicUrl;
        }

        const { error } =  await supabase
            .from("posts")
            .update({
                title: edit_title,
                tag: edit_tag,
                description:edit_description,
                image_url:final_image_url,
                is_update:true,
            })
            .eq("id", post.id);

        setIs_update(false);

        if(error){
            alert("Gagal memperbarui postingan" + error.message);
        } else {
            alert("Postingan berhasil di perbarui!");
            onpost_update();
            onclose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-lg text-gray-800">Edit postingan</h3>
                    <button
                        onClick={onclose}
                        className="text-gray-400 hover:text-black font-bold text-lg"
                    >
                    ✕
                    </button>
                </div>
                <form onSubmit={handleSave_edit} className="flex flex-col gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-600">Judul Postingan</label>
                        <input  
                            type="text"
                            value={edit_title}
                            onChange={(e) => setEdit_title(e.target.value)}
                            className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                            
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600">Tag</label>
                        <input
                            type="text"
                            value={edit_tag}
                            onChange={(e) => setEdit_tag(e.target.value)}
                            className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600">Deskripsi</label>
                        <textarea
                            value={edit_description}
                            onChange={(e) => setEdit_description(e.target.value)}
                            rows="4"
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#a50034] mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600">Foto Postingan</label>
                        {edit_photo && (
                            <img
                                src={edit_photo}
                                alt="Preview"
                                className="max-h-48 rounded-lg object-cover my-2 border"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlenew_image}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#a50034] hover:file:bg-red-100 cursor-pointer mt-1"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                        <button
                            type="button"
                            onClick={onclose}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                        X
                        </button>
                        <button
                            type="submit"
                            disabled={is_update}
                            className="px-4 py-2 text-sm bg-[#a50034] text-white font-bold rounded-lg hover:bg-[#800028] cursor-pointer disabled:opacity-50"
                            >
                            {is_update ? "Memproses..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}