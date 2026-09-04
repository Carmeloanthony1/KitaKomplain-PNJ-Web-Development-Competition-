import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Share_post from "./Share_post";
import CommentSection from "./Comment";
import { supabase } from "../supabaseClient";
import Edit_post from "./edit_post";
import { useNavigate } from "react-router-dom";
import VoteModal from "./Vote";
import { useConfirm } from "./ConfirmContext";
import { useStatus } from "./StatusContext";

const buildCommentTree = (comments = []) => {
  const commentMap = {};
  const tree = [];

  comments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: [] };
  });

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

export default function Post({
  post,
  onUserClick,
  hideaction = false,
  hideVoteButton = false,
  focused_comment = null,
  onClose = null,
  onDelete = null,
  onUpdate = null,
}) {
  const navigate = useNavigate();
  const focused_comment_ref = useRef(null);
  const { showStatus } = useStatus();

  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isPop, setIsPop] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [commentsList, setCommentsList] = useState([]);

  const [isshare_open, setIsshare_open] = useState(false);
  const [ismenu_open, setIsmenu_open] = useState(false);
  const [isedit_open, setIsedit_open] = useState(false);

  const [isVote_open, setIsVote_open] = useState(false);
  const { showConfirm } = useConfirm();
  const currentUserId = localStorage.getItem("user_id");

  // === FITUR READ MORE (PER KELIPATAN KATA) ===
  const CHUNK_SIZE = 100; // Jumlah kata awal & penambahan per klik
  const [visibleWordCount, setVisibleWordCount] = useState(CHUNK_SIZE);

  if (!post) return null;

  const ismypost = post.user_id === currentUserId;
  const username = post.users?.username || "Unknown";
  const avatar = post.users?.avatar_url || "/default-avatar.png";

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

  const [isdark, setIsdark] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setIsdark(true);
    }
  }, []);

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
      const mainComments = data.filter((c) => !c.parent_id);
      const replies = data.filter((c) => c.parent_id);

      const structured = mainComments.map((main) => {
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

  useEffect(() => {
    if (focused_comment && focused_comment_ref.current) {
      const timer = setTimeout(() => {
        focused_comment_ref.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [focused_comment]);

  const triggerPop = () => {
    setIsPop(true);
    setTimeout(() => {
      setIsPop(false);
    }, 200);
  };

  const toggleLike = async () => {
    if (hideaction) return;

    if (!currentUserId) {
      showStatus("Silakan login untuk memberikan like!", "error");
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

  const handleToggleComment = () => {
    setIsCommentOpen((prev) => !prev);
  };

  const handle_share = () => setIsshare_open(true);

  const handle_delete = async () => {
    const confirmed = await showConfirm("Apakah anda yakin ingin menghapus postingan ini?");
    if (!confirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", post.id);

    if (error) {
      showStatus("Gagal menghapus postingan: " + error.message, "error");
    } else {
      showStatus("Postingan berhasil dihapus!", "success");
      if (onDelete) onDelete(post.id);
    }
  };

  // === RENDER DESKRIPSI DENGAN READ MORE PER KATA ===
  const renderDescription = () => {
    const rawText = post.description || "";
    const words = rawText.trim().split(/\s+/);
    const totalWords = words.length;

    if (totalWords <= CHUNK_SIZE) {
      return (
        <p className="text-gray-900 dark:text-white text-sm sm:text-base leading-relaxed break-words px-0.5">
          {rawText}
        </p>
      );
    }

    const hasMore = visibleWordCount < totalWords;
    const displayedWords = words.slice(0, visibleWordCount).join(" ");
    const remainingWords = totalWords - visibleWordCount;
    const nextChunk = Math.min(CHUNK_SIZE, remainingWords);

    return (
      <div className="flex flex-col items-start px-0.5">
        <p className="text-gray-900 dark:text-white text-sm sm:text-base leading-relaxed break-words">
          {displayedWords}
          {hasMore && "..."}
        </p>
        
        {hasMore ? (
          <button
            onClick={() => setVisibleWordCount((prev) => prev + CHUNK_SIZE)}
            className="mt-1 text-xs sm:text-sm font-bold text-[#a50034] dark:text-[#f1ece1] hover:underline cursor-pointer focus:outline-none"
          >
            Lihat Selengkapnya
          </button>
        ) : (
          <button
            onClick={() => setVisibleWordCount(CHUNK_SIZE)}
            className="mt-1 text-xs sm:text-sm font-bold text-gray-500 hover:text-[#a50034] dark:text-gray-400 dark:hover:text-[#f1ece1] hover:underline cursor-pointer focus:outline-none"
          >
            Sembunyikan
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={`w-full ${
        hideaction ? "bg-transparent p-0" : "bg-transparent px-1 py-2 sm:py-3"
      } flex flex-col items-center justify-center`}
    >
      <div className="flex flex-col w-full p-2.5 sm:p-3.5 border-2 sm:border-4 border-[#a50034]/50 dark:border-[#f1ece1] rounded-xl sm:rounded-2xl bg-white dark:bg-[#1e1e1e] shadow-xs">
        <div className="flex items-center justify-between gap-3 w-full pb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.users?.avatar_url ? (
              <img
                src={avatar}
                alt={username}
                onClick={() => !hideaction && onUserClick && onUserClick(post.user_id)}
                className={`w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#a50034] dark:border-[#f1ece1] ${
                  hideaction ? "cursor-default" : "cursor-pointer hover:opacity-80 transition-opacity"
                }`}
              />
            ) : (
              <div
                onClick={() => !hideaction && onUserClick && onUserClick(post.user_id)}
                className={`w-10 h-10 rounded-full flex justify-center bg-white text-[#a50034] border-2 border-[#a50034] dark:border-[#f1ece1] font-bold text-base items-center object-cover flex-shrink-0 ${
                  hideaction ? "cursor-default" : "cursor-pointer hover:opacity-80 transition-opacity"
                }`}
              >
                {(username || "U")[0].toLowerCase()}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <span
                onClick={() => !hideaction && onUserClick && onUserClick(post.user_id)}
                className={`font-bold text-sm sm:text-base text-gray-800 dark:text-[#f1ece1] truncate ${
                  hideaction ? "cursor-default" : "cursor-pointer hover:text-[#a50034] dark:hover:text-[#a50034]/60 transition-colors"
                }`}
              >
                {username}
              </span>

              {tag_list.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
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
                          !hideaction && navigate(`/search?tag=${encodeURIComponent(cleanTag)}`)
                        }
                        className={`text-[#a50034] dark:text-[#f1ece1] bg-[#a50034]/10 dark:bg-transparent dark:border dark:border-[#f1ece1] px-1.5 py-0.2 rounded font-bold text-[11px] sm:text-xs transition-colors ${
                          hideaction ? "cursor-default" : "hover:bg-[#a50034] dark:hover:bg-transparent hover:text-white cursor-pointer"
                        }`}
                      >
                        #{cleanTag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {hideaction ? (
            onClose && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-neutral-200 font-bold transition-all cursor-pointer text-sm flex-shrink-0"
                title="Tutup Modal"
              >
                ✕
              </button>
            )
          ) : (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsmenu_open((prev) => !prev)}
                className="text-xl font-bold px-2 py-0.5 text-gray-500 dark:text-[#f1ece1] dark:hover:bg-transparent dark:hover:text-white dark:hover:scale-105 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                •••
              </button>

              {ismenu_open && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 text-sm">
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
                          showStatus("Tautan berhasil disalin!", "success");
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
          )}
        </div>

        <div className="w-full flex flex-col gap-2 mt-1">
          {/* 1. GAMBAR SEKARANG DI ATAS */}
          {post.image_url && (
            <div className="w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 my-1">
              <img
                src={post.image_url}
                alt="post"
                className="w-full h-auto max-h-[450px] object-contain rounded-lg block"
              />
            </div>
          )}

          {/* 2. DESKRIPSI DI BAWAH GAMBAR */}
          {renderDescription()}

          <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleLike}
                  disabled={hideaction}
                  className={`focus:outline-none p-1 -m-1 ${hideaction ? "cursor-default" : "cursor-pointer"}`}
                >
                  <svg
                    style={{
                      transform: isPop ? "scale(1.25)" : "scale(1)",
                      transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      isLiked
                        ? "fill-[#a50034] stroke-[#a50034] dark:fill-[#a50034] dark:stroke-[#a50034]"
                        : "fill-none stroke-[#a50034] dark:stroke-white"
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
                    onClick={() => !hideaction && setShowLikers(true)}
                    className={`font-bold text-xs sm:text-sm ${
                      hideaction
                        ? "cursor-default text-[#a50034] dark:text-[#f1ece1]"
                        : "cursor-pointer hover:underline transition-colors " +
                          (isLiked ? "text-[#a50034] dark:text-[#a50034]" : "text-[#a50034] dark:text-[#f1ece1]")
                    }`}
                  >
                    {likes.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleToggleComment}
                  className="focus:outline-none cursor-pointer p-1 -m-1"
                >
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 fill-[#a50034] dark:fill-white transition-transform hover:scale-105 cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                  >
                    <path d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z" />
                  </svg>
                </button>

                {commentCount > 0 && (
                  <span className="font-bold text-xs sm:text-sm text-[#a50034] dark:text-white">
                    {commentCount}
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <button
                  onClick={handle_share}
                  className="focus:outline-none cursor-pointer p-1 -m-1"
                >
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 stroke-[#a50034] dark:stroke-white fill-none hover:scale-105 transition-transform cursor-pointer"
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

            {!hideaction && !hideVoteButton && (
              <>
                <button
                  onClick={() => setIsVote_open(true)}
                  className="bg-red-50 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg text-black border-2 border-[#a50034] dark:border-[#f1ece1] font-semibold cursor-pointer active:scale-95 transition-transform"
                >
                  Vote
                </button>

                {isVote_open && (
                  <VoteModal
                    post={post}
                    onClose={() => setIsVote_open(false)}
                  />
                )}
              </>
            )}
          </div>

          {focused_comment && (
            <div
              ref={focused_comment_ref}
              className="mt-2 bg-rose-50 border-2 border-[#a50034] rounded-xl p-3 shadow-xs scroll-mt-10"
            >
              <span className="text-[10px] font-bold text-[#a50034] uppercase tracking-wider block mb-0.5">
                Komentar Pilihan Anda
              </span>
              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                "{focused_comment.content}"
              </p>
            </div>
          )}

          {isCommentOpen && (
            <div className="mt-2">
              <CommentSection
                comments={commentsList}
                postId={post.id}
                postOwnerId={post.user_id}
                onCommentAdded={fetch_comment}
                hideaction={hideaction}
              />
            </div>
          )}
        </div>
      </div>

      {isshare_open && (
        <Share_post post={post} onclose={() => setIsshare_open(false)} />
      )}

      {!hideaction && isedit_open && (
        <Edit_post
          post={post}
          onclose={() => setIsedit_open(false)}
          onpost_update={(updatedPost) => {
            if (onUpdate) onUpdate(updatedPost);
          }}
        />
      )}

      {!hideaction &&
        showLikers &&
        createPortal(
          <div
            onClick={() => setShowLikers(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-4 sm:p-5 rounded-t-2xl sm:rounded-2xl max-w-sm w-full shadow-2xl border sm:border-2 border-[#a50034]/30 animate-fadeIn"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-base sm:text-lg text-gray-800">
                  Menyukai postingan ini
                </h3>
                <button
                  onClick={() => setShowLikers(false)}
                  className="text-gray-400 hover:text-[#a50034] font-bold text-lg sm:text-xl cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 sm:gap-2">
                {likes.map((likeItem) => (
                  <div
                    key={likeItem.id}
                    onClick={() => {
                      setShowLikers(false);
                      if (onUserClick) onUserClick(likeItem.user_id);
                    }}
                    className="flex items-center gap-2.5 sm:gap-3 cursor-pointer hover:bg-rose-50/60 p-1.5 sm:p-2 rounded-xl transition-colors"
                  >
                    <img
                      src={likeItem.users?.avatar_url || "/default-avatar.png"}
                      alt="avatar"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#a50034]"
                    />
                    <span className="font-semibold text-xs sm:text-sm text-gray-800">
                      {likeItem.users?.username || "Pengguna"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}