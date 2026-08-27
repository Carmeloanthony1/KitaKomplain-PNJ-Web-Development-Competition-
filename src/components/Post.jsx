import { useState, useEffect } from "react";
import Share_post from "./Share_post";
import CommentSection from "./Comment";
import { supabase } from "../supabaseClient";
import Edit_post from "./edit_post";
import { useNavigate } from "react-router-dom";

// Helper function untuk menyusun struktur Pohon (Tree) Komentar & Balasan
const buildCommentTree = (comments = []) => {
  const commentMap = {};
  const tree = [];

  // Inisialisasi map dan siapkan array replies
  comments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: [] };
  });

  // Hubungkan anak (reply) ke induk (parent_id)
  comments.forEach((c) => {
    if (c.parent_id) {
      if (commentMap[c.parent_id]) {
        commentMap[c.parent_id].replies.push(commentMap[c.id]);
      }
    } else {
      tree.push(commentMap[c.id]);
    }
  });

  return tree;
};

export default function Post({ post, onUserClick }) {
  const navigate = useNavigate();

  // Likes State
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isPop, setIsPop] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  // Comment State
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [commentsList, setCommentsList] = useState([]); // State array komentar

  // Share & Menu State
  const [isshare_open, setIsshare_open] = useState(false);
  const [ismenu_open, setIsmenu_open] = useState(false);
  const [isedit_open, setIsedit_open] = useState(false);

  const currentUserId = localStorage.getItem("user_id");

  if (!post) return null;

  const ismypost = post.user_id === currentUserId;
  const username = post.users?.username || "Unknown";
  const avatar = post.users?.avatar_url || "/default-avatar.png";

  // LOGIKA PARSING TAG
  const tag_mentah = post.tag || post.tags || "";
  let tag_list = [];

  if (Array.isArray(tag_mentah)) {
    tag_list = tag_mentah;
  } else if (typeof tag_mentah === "string" && tag_mentah.trim() !== "") {
    try {
      const parsed = JSON.parse(tag_mentah);
      tag_list = Array.isArray(parsed) ? parsed : tag_mentah.split(",");
    } catch {
      tag_list = tag_mentah.split(",");
    }
  }

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
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id, 
        content, 
        created_at, 
        user_id, 
        post_id, 
        parent_id, 
        users (username, avatar_url)
      `)
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Gagal ambil komentar:", error.message);
      return;
    }

    if (data) {
      // Pisahkan komentar utama (parent_id null) dan semua balasan
      const mainComments = data.filter((c) => !c.parent_id);
      const replies = data.filter((c) => c.parent_id);

      // Masukkan SEMUA balasan ke komentar utama tempat ia bernaung (Max 1 level)
      const structured = mainComments.map((main) => {
        // Cari semua balasan yang berelasi langsung maupun turunan
        const findReplies = (parentId) => {
          let direct = replies.filter((r) => r.parent_id === parentId);
          let nested = direct.flatMap((r) => findReplies(r.id));
          return [...direct, ...nested];
        };

        const allReplies = findReplies(main.id).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        return {
          ...main,
          replies: allReplies,
        };
      });

      setCommentsList(structured);
      setCommentCount(data.length);
    }
  };

  useEffect(() => {
    if (post?.id) {
      fetchLikes();
      fetch_comment();
    }
  }, [post.id, currentUserId]);

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

        await supabase
          .from("notifications")
          .delete()
          .eq("post_id", post.id)
          .eq("actor_id", currentUserId)
          .eq("type", "like");
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

        if (post.user_id !== currentUserId) {
          try {
            await supabase.from("notifications").insert([
              {
                user_id: post.user_id,
                actor_id: currentUserId,
                post_id: post.id,
                type: "like",
                is_read: false,
              },
            ]);
          } catch (err) {
            console.error("Notifikasi gagal dikirim:", err);
          }
        }
      }
    }
  };

  const handleToggleComment = () => setIsCommentOpen((prev) => !prev);
  const handle_share = () => setIsshare_open(true);

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
    <div className="max-w-2xl w-full bg-slate-50/70 p-4 rounded-2xl flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 border-4 border-[#a50034]/50 rounded-lg bg-white shadow-xs">
        <div className="flex items-start gap-3">
          {/* AVATAR */}
          <img
            src={avatar}
            alt={username}
            onClick={() => onUserClick && onUserClick(post.user_id)}
            className="w-10 h-10 mt-1 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          />

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap justify-between">
              {/* HEADER NAMA USER + LIST TAGS */}
              <div className="flex flex-col">
                <span
                  onClick={() => onUserClick && onUserClick(post.user_id)}
                  className="font-bold text-gray-800 cursor-pointer hover:underline hover:text-[#a50034] transition-colors w-fit"
                >
                  {username}
                </span>

                {tag_list.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {tag_list.map((tagItem, idx) => {
                      const cleanTag = String(tagItem)
                        .replace(/[^a-zA-Z0-9_]/g, "")
                        .toLowerCase()
                        .trim();
                      if (!cleanTag) return null;
                      return (
                        <span
                          key={idx}
                          onClick={() =>
                            navigate(`/search?tag=${encodeURIComponent(cleanTag)}`)
                          }
                          className="text-[#a50034] bg-[#a50034]/10 hover:bg-[#a50034] hover:text-white px-2 py-0.5 rounded-md font-bold text-xs transition-colors cursor-pointer"
                        >
                          #{cleanTag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DROPDOWN MENU */}
              <div className="relative">
                <button
                  onClick={() => setIsmenu_open((prev) => !prev)}
                  className="text-xl font-bold px-2 py-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  •••
                </button>

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
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setIsmenu_open(false);
                            handle_delete();
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 cursor-pointer"
                        >
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
                          Salin Tautan
                        </button>
                        <button
                          onClick={() => setIsmenu_open(false)}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          Laporkan
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DESKRIPSI POST */}
            <p className="text-gray-900 text-sm leading-relaxed break-words">
              {post.description}
            </p>

            {/* GAMBAR POST */}
            {post.image_url && (
              <img
                src={post.image_url}
                alt="post"
                className="max-h-96 rounded-lg object-cover mt-2"
              />
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-between gap-2 mt-2 items-center">
              <div className="flex flex-row gap-3 items-center">
                <div className="flex items-center gap-2">
                  <button onClick={toggleLike} className="focus:outline-none cursor-pointer">
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

                  {likes.length > 0 && (
                    <span
                      onClick={() => setShowLikers(true)}
                      className="font-bold text-sm text-[#a50034] cursor-pointer hover:underline"
                    >
                      {likes.length}
                    </span>
                  )}
                </div>

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

                <div className="flex items-center">
                  <button onClick={handle_share} className="focus:outline-none cursor-pointer">
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

            {/* COMMENT SECTION */}
            {isCommentOpen && (
              <CommentSection
                comments={commentsList}
                postId={post.id}
                postOwnerId={post.user_id}
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

      {/* MODAL LIST LIKE */}
      {showLikers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg max-w-sm w-full shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg text-gray-800">
                Menyukai postingan ini
              </h3>
              <button
                onClick={() => setShowLikers(false)}
                className="text-gray-500 hover:text-black font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-3">
              {likes.map((likeItem) => (
                <div
                  key={likeItem.id}
                  onClick={() => {
                    setShowLikers(false);
                    if (onUserClick) onUserClick(likeItem.user_id);
                  }}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                >
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