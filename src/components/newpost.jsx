import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";

export function NewPost() {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [lokasi, setLokasi] = useState("");

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

    return ( 
        <div className="flex ">
            <Sidebar_Kiri />
            <div className="flex flex-col flex-1">
                <Navbar />
                <div className="mt-4 w-full bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Tuliskan pengalaman anda</h2>
                    <textarea 
                        placeholder="Apa yang ingin kamu bagikan?"
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Input Lokasi */}
                    <input
                        type="text"
                        value={lokasi}
                        onChange={(e) => setLokasi(e.target.value)}
                        placeholder="Tambahkan lokasi..."
                        className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                onClick={handleRemoveImage}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <button className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-150">
                        Posting
                    </button>
                </div>
            </div>
        </div>
    )
}