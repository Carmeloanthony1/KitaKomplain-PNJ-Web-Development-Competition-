import { useState } from "react";
import dummyData from "../../data/Dummy_data.json";
import Share_post from "./Share_post";
import CommentSection from "./Comment";

export default function Post() {
  const pollingList = dummyData.post || [];
  
  // Menggunakan object state supaya like per post tidak saling tumpuk
  const [likedPosts, setLikedPosts] = useState({});
  const [isshare_open, setIsshare_open] = useState(false);
  const [selectedpost, setSelectedpost] = useState(null);

  const [activeCommentIndex, setActiveCommentIndex] = useState(null);

  const toggleLike = (index) => {
    setLikedPosts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleToggleComment = (index) => {
    // Kalau diklik lagi di post yang sama -> tutup, kalau beda -> pindah buka ke post tsb
    setActiveCommentIndex(activeCommentIndex === index ? null : index);
  };

  const handle_share = (item) => {
    setSelectedpost(item);
    setIsshare_open(true);
  };

  return (
    <div className="min-w-2xl w-full bg-slate-50/70 p-4 rounded-2xl flex flex-col gap-4">
      {pollingList.map((item, index) => {
        const isLiked = !!likedPosts[index];
        // 1. Disesuaikan penamaannya jadi isCommentOpen
        const isCommentOpen = activeCommentIndex === index;

        return (
          <div key={index} className="flex flex-col gap-3 p-4 border-4 border-[#a50034]/50 rounded-lg bg-white shadow-xs">
            
            <div className="flex items-start gap-3">
              <img 
                src={item.avatar} 
                alt={item.username}
                className="w-10 h-10 mt-1 rounded-full object-cover flex-shrink-0"
              />
              
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{item.username}</span>
                    <span className="text-[#a50034] font-bold text-xs">#{item.title}</span>
                  </div>
                  <button className="text-2xl mb-1 cursor-pointer">...</button>
                </div>

                <p className="text-gray-900 text-sm leading-relaxed break-words">{item.content}</p>

                <div className="flex justify-between gap-2 mt-1">
                  <div className="flex flex-row gap-3 items-center">
                    
                    {/* LIKE */}
                    <button 
                      onClick={() => toggleLike(index)} 
                      className="focus:outline-none cursor-pointer"
                    >
                      <svg 
                        className={`w-10 h-10 transition-transform hover:scale-110 ${
                          isLiked 
                            ? "fill-[#a50034] stroke-[#a50034]" 
                            : "fill-none stroke-[#a50034]"
                        }`} 
                        viewBox="0 0 24 24" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* COMMENT */}
                    <button onClick={() => handleToggleComment(index)} className="focus:outline-none cursor-pointer">
                      <svg className="w-10 h-10 fill-[#a50034] hover:scale-110 transition-transform cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <path d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"/>
                      </svg>
                    </button>

                    {/* SHARE */}
                    <button onClick={() => handle_share(item)} className="focus:outline-none cursor-pointer">
                      <svg 
                        className="w-10 h-10 stroke-[#a50034] fill-none hover:scale-110 transition-transform cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" 
                          d="m5 12l-.604-5.437C4.223 5.007 5.825 3.864 7.24 4.535l11.944 5.658c1.525.722 1.525 2.892 0 3.614L7.24 19.466c-1.415.67-3.017-.472-2.844-2.028zm0 0h7"
                        />
                      </svg>
                    </button>
                  </div>
                  <button className="bg-red-50 p-2 leading-relaxed rounded-lg border-2 border-[#a50034] font-semibold cursor-pointer">Polling</button>
                </div>

                {/* 2. Komentar dipindah ke dalam div "flex-1 min-w-0" agar sejajar dengan teks post */}
                {isCommentOpen && (
                  <CommentSection comments={item.comments} />
                )}

              </div>
            </div>

          </div>
        );
      })}

      {isshare_open && (
        <Share_post post={selectedpost}
          onclose={() => setIsshare_open(false)}
        />  
      )}
    </div>
  );
}