import { useState, useEffect } from "react";
import Share_post from "./Share_post";
import CommentSection from "./Comment";
import { supabase } from "../supabaseClient";
import Edit_post from "./edit_post";
import { useNavigate } from "react-router-dom";

export default function Post({ post }) {
  const navigate = useNavigate();
  // Likes
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isPop, setIsPop] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  // Comment
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Share
  const [isshare_open, setIsshare_open] = useState(false);

  // Menu (...)
  const [ismenu_open, setIsmenu_open] = useState(false);


  //edit menu (...)
  const [isedit_open, setIsedit_open] = useState(false);
  const currentUserId = localStorage.getItem("user_id");

  if (!post) return null;

  const ismypost = post.user_id === currentUserId;
  const username = post.users?.username || "Unknown";
  const avatar = post.users?.avatar_url || "/default-avatar.png";

  const tag_mentah = post.tags || (post.title ? [post.title] : []);
  const tag_list = tag_mentah.map((t) => t.replace(/\s+/g, "").toLowerCase());


  const fetchLikes = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select(`id, user_id, users (id, username, avatar_url)`)
      .eq("post_id", post.id);

    if (!error && data) {
      setLikes(data);
      const userHasLiked = data.some((like) => like.user_id === currentUserId);
      setIsLiked(userHasLiked);
    }
  };

  const fetch_comment = async () => {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    if (!error && count !== null) {
      setCommentCount(count);
    }
  };

  useEffect(() => {
    fetchLikes();
    fetch_comment();
  }, [post.id, currentUserId]);

  // Pemicu animasi pop-up
  const triggerPop = () => {
    setIsPop(true);
    setTimeout(() => {
      setIsPop(false);
    }, 200);
  };

  const toggleLike = async () => {
    if (!currentUserId) {
      alert("Silakan login untuk memberikan like!");
      return;
    }

    triggerPop();
    if (isLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);

      if (!error) {
        setIsLiked(false);
        fetchLikes();
      }
    } else {
      const { error } = await supabase.from("likes").insert([
        {
          post_id: post.id,
          user_id: currentUserId,
        },
      ]);

      if (!error) {
        setIsLiked(true);
        fetchLikes();
      }
    }
  };

  const handleToggleComment = () => setIsCommentOpen((prev) => !prev);
  const handle_share = () => setIsshare_open(true);

  // Delete (fitur menu ...)
  const handle_delete = async () => {
    const confirm_delete = window.confirm(
      "Apakah anda yakin ingin menghapus postingan ini?"
    );
    if (!confirm_delete) return;

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (error) {
      alert("Gagal menghapus postingan: " + error.message);
    } else {
      alert("Postingan berhasil dihapus!");
      window.location.reload();
    }
  };

  return (
    <div className="min-w-2xl w-full bg-slate-50/70 p-4 rounded-2xl flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 border-4 border-[#a50034]/50 rounded-lg bg-white shadow-xs">
        <div className="flex items-start gap-3">
          <img
            src={avatar}
            alt={username}
            className="w-10 h-10 mt-1 rounded-full object-cover flex-shrink-0"
          />

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{username}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tag_list.map((tag, idx) => (
                    <span key={idx}
                      onClick={() => navigate(`/search?tag=${tag}`)}
                      className="text-[#a50034] bg-[#a50034]/10 hover:bg-[#a50034] hover:text-white px-2 py-0.5 rounded-md font-bold text-xs transition-colors cursor-pointer">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="relative">
                {/* Tombol Titik Tiga */}
                <button
                  onClick={() => setIsmenu_open((prev) => !prev)}
                  className="text-xl font-bold px-2 py-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  •••
                </button>

                {/* Dropdown Menu */}
                {ismenu_open && (
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5 text-sm">
                    {ismypost ? (
                      <>
                        <button
                          onClick={() => {
                            setIsmenu_open(false);
                            setIsedit_open(true);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2 cursor-pointer"
                        >
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"/>
                          </svg> Edit
                        </button>
                        <button
                          onClick={() => {
                            setIsmenu_open(false);
                            handle_delete();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 fill-[#a50034]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
                          </svg>
                          Hapus
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsmenu_open(false);
                            navigator.clipboard.writeText(window.location.href);
                            alert("Tautan berhasil disalin!");
                          }}
                          className="w-full text-left font-bold px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path d="M451.5 160C434.9 160 418.8 164.5 404.7 172.7C388.9 156.7 370.5 143.3 350.2 133.2C378.4 109.2 414.3 96 451.5 96C537.9 96 608 166 608 252.5C608 294 591.5 333.8 562.2 363.1L491.1 434.2C461.8 463.5 422 480 380.5 480C294.1 480 224 410 224 323.5C224 322 224 320.5 224.1 319C224.6 301.3 239.3 287.4 257 287.9C274.7 288.4 288.6 303.1 288.1 320.8C288.1 321.7 288.1 322.6 288.1 323.4C288.1 374.5 329.5 415.9 380.6 415.9C405.1 415.9 428.6 406.2 446 388.8L517.1 317.7C534.4 300.4 544.2 276.8 544.2 252.3C544.2 201.2 502.8 159.8 451.7 159.8zM307.2 237.3C305.3 236.5 303.4 235.4 301.7 234.2C289.1 227.7 274.7 224 259.6 224C235.1 224 211.6 233.7 194.2 251.1L123.1 322.2C105.8 339.5 96 363.1 96 387.6C96 438.7 137.4 480.1 188.5 480.1C205 480.1 221.1 475.7 235.2 467.5C251 483.5 269.4 496.9 289.8 507C261.6 530.9 225.8 544.2 188.5 544.2C102.1 544.2 32 474.2 32 387.7C32 346.2 48.5 306.4 77.8 277.1L148.9 206C178.2 176.7 218 160.2 259.5 160.2C346.1 160.2 416 230.8 416 317.1C416 318.4 416 319.7 416 321C415.6 338.7 400.9 352.6 383.2 352.2C365.5 351.8 351.6 337.1 352 319.4C352 318.6 352 317.9 352 317.1C352 283.4 334 253.8 307.2 237.5z" />
                          </svg>
                          Salin Tautan
                        </button>
                        <button
                          onClick={() => {
                            setIsmenu_open(false);
                            // TODO: panggil fungsi report
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4 fill-[#a50034]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                          >
                            <path d="M144 88C144 74.7 133.3 64 120 64C106.7 64 96 74.7 96 88L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 452L224.3 431.9C265.4 421.6 308.9 426.4 346.8 445.3C391 467.4 442.3 470.1 488.5 452.7L523.2 439.7C535.7 435 544 423.1 544 409.7L544 130C544 107 519.8 92 499.2 102.3L489.6 107.1C443.3 130.3 388.8 130.3 342.5 107.1C307.4 89.5 267.1 85.1 229 94.6L144 116L144 88zM144 165.5L240.6 141.3C267.6 134.6 296.1 137.7 321 150.1C375.9 177.5 439.7 179.8 496 156.9L496 398.7L471.6 407.8C437.9 420.4 400.4 418.5 368.2 402.4C320 378.3 264.9 372.3 212.6 385.3L144 402.5L144 165.5z" />
                          </svg>
                          Laporkan
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-900 text-sm leading-relaxed break-words">
              {post.description}
            </p>

            {post.image_url && (
              <img
                src={post.image_url}
                alt="post"
                className="max-h-96 rounded-lg object-cover mt-2"
              />
            )}

            <div className="flex justify-between gap-2 mt-2 items-center">
              <div className="flex flex-row gap-3 items-center">
                {/* LIKE BUTTON + TOTAL LIKES */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleLike}
                    className="focus:outline-none cursor-pointer"
                  >
                    <svg
                      style={{
                        transform: isPop ? "scale(1.3)" : "scale(1)",
                        transition:
                          "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      }}
                      className={`w-9 h-9 ${
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

                  {/* JUMLAH LIKE */}
                  {likes.length > 0 && (
                    <span
                      onClick={() => setShowLikers(true)}
                      style={{
                        transform: isPop ? "scale(1.6)" : "scale(1)",
                        transition:
                          "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        display: "inline-block",
                      }}
                      className="font-bold text-sm text-[#a50034] cursor-pointer hover:underline"
                    >
                      {likes.length}
                    </span>
                  )}
                </div>

                {/* COMMENT */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleComment}
                    className="focus:outline-none cursor-pointer"
                  >
                    <svg
                      className="w-9 h-9 fill-[#a50034] hover:scale-110 transition-transform cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 640"
                    >
                      <path d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z" />
                    </svg>
                  </button>

                  {commentCount > 0 && (
                    <span className="font-bold text-sm text-[#a50034]">
                      {commentCount}
                    </span>
                  )}
                </div>

                {/* SHARE */}
                <div className="flex items-center">
                  <button
                    onClick={handle_share}
                    className="focus:outline-none cursor-pointer"
                  >
                    <svg
                      className="w-9 h-9 stroke-[#a50034] fill-none hover:scale-110 transition-transform cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="m5 12l-.604-5.437C4.223 5.007 5.825 3.864 7.24 4.535l11.944 5.658c1.525.722 1.525 2.892 0 3.614L7.24 19.466c-1.415.67-3.017-.472-2.844-2.028zm0 0h7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <button className="bg-red-50 p-2 leading-relaxed rounded-lg border-2 border-[#a50034] font-semibold cursor-pointer">
                Polling
              </button>
            </div>

            {isCommentOpen && (
              <CommentSection
                postId={post.id}
                onCommentAdded={fetch_comment}
              />
            )}
          </div>
        </div>
      </div>

      {isshare_open && (
        <Share_post post={post} onclose={() => setIsshare_open(false)} />
      )}

      {isedit_open && (
        <Edit_post
          post={post}
          onclose={() => setIsedit_open(false)}
          onpost_update={() => window.location.reload()}
        />
      )}

      {/* POPUP DAFTAR PENYUKA */}
      {showLikers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg max-w-sm w-full shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg text-gray-800">
                Menyukai postingan ini
              </h3>
              <button
                onClick={() => setShowLikers(false)}
                className="text-gray-500 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-3">
              {likes.map((likeItem) => (
                <div key={likeItem.id} className="flex items-center gap-3">
                  <img
                    src={likeItem.users?.avatar_url || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-semibold text-sm text-gray-800">
                    {likeItem.users?.username || "Pengguna"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}