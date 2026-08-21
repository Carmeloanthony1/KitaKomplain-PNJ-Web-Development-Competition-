import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar_Kiri from "../components/Sidebar_Kiri";


export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("Ken");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setName(trimmed);
    } else {
      setTempName(name); // kalo dikosongin, balikin ke nama lama
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") {
      setTempName(name);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar_Kiri />

      <main className="flex-1">
        <Navbar />

        <div className="mt-4 w-full">
          {/* Container Profile */}
          <div className="ml-5 flex items-center gap-3">
            <img
              src="/assets/Dummy_photo.png"
              alt="Foto profil"
              className="w-14 h-14 rounded-full object-cover"
            />

            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="text-3xl font-bold mt-2 border-b-2 border-blue-400 outline-none bg-transparent"
                />
              ) : (
                <h1 className="text-3xl font-bold mt-2">{name}</h1>
              )}
              <p className="text-sm text-blue-500 mb-4">Verify your account?</p>
            </div>

            <div>
              <img
                src="/assets/config-icon.png"
                alt="Config"
                onClick={() => setIsEditing((prev) => !prev)}
                className="w-6 h-6 cursor-pointer rounded-full object-cover hover:scale-105 active:scale-120"
              />
            </div>
          </div>

          <h1 className="ml-5 font-bold">Deskripsi</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Melo adalah seorang gay Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Eius possimus provident voluptatem similique
              quo inventore, perferendis quam tempore vitae ullam? Voluptate
              ea quas dolorum dignissimos minus eligendi quod quisquam in.
            </p>
          </div>

          {/* Container Bawah */}
          <div className="ml-5 mt-10 flex item-center gap-3">
            <p className="text-sm text-blue-800">your post</p>
            <p className="text-sm text-blue-800">your comment</p>
            <p className="text-sm text-blue-800">your polling</p>
          </div>

          <div className="ml-5 mt-2 flex item-center gap-3">
            <div className="bg-white rounded-lg shadow p-6 h-50 w-50">
              <img
                src="/assets/Dummy_photo.jpeg"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="flex flex-column">
                <img
                  src="/assets/upvote(current).png"
                  className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.1] active:scale-[1.3]"
                />
                <img
                  src="/assets/upvote(current).png"
                  className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.1] active:scale-[1.3] rotate-180"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 h-50 w-50">
              <img
                src="/assets/Dummy_photo.jpeg"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="flex flex-column">
                <img
                  src="/assets/upvote(current).png"
                  className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.1] active:scale-[1.3]"
                />
                <img
                  src="/assets/upvote(current).png"
                  className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.1] active:scale-[1.3] rotate-180"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 h-50 w-50">
              <img
                src="/assets/Dummy_photo.jpeg"
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="flex flex-column">
                <img
                  src="/assets/upvote(current).png"
                  className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.1] active:scale-[1.3]"
                />
                <img
                  src="/assets/upvote(current).png"
                  className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.1] active:scale-[1.3] rotate-180"
                />
              </div>
            </div>
          </div>

          <p onClick={() => navigate('/report')}
           className="w-full mt-50 text-center text-sm text-blue-700 cursor-pointer hover:underline hover:scale-110 transition-transform duration-150">
            Report any problem?
          </p>
        </div>
      </main>
    </div>
  );
}