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
            const filename = `post_${Date.now()}_${newPhotoFile.name}`;
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
            .from(posts)
            .update({
                title: edit_title,
                tag: edit_tag,
                description:edit_description,
                image_url:final_image_url,
                is_update:true,
            })

        setIs_update(false);

        if(error){
            alert("Gagal memperbarui postingan", + error.message);
        } else {
            alert("Postingan berhasil di perbarui!");
            onpost_update();
            onclose();
        }
    };

}