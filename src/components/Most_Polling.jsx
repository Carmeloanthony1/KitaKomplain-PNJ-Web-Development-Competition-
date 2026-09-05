import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function Most_Polling({ onUserClick, onPostClick }) {
  const [votelist, setVotelist] = useState([]);
  const [isdark, setIsdark] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch_mypolling = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, 
          user_id,
          tag, 
          description, 
          image_url,
          created_at,
          users (username, avatar_url), 
          votes (id, vote_type)
        `);
      
      if (error) throw error;

      if (data) {
        const formattedData = data
          .map((post) => {
            const votesArr = post.votes || [];

            const upVotesCount = votesArr.filter(
              (v) => v.vote_type === "up" || v.vote_type === "setuju"
            ).length;

            return {
              ...post,
              up_votes_count: upVotesCount,
            };
          })
          .sort((a, b) => b.up_votes_count - a.up_votes_count)
          .slice(0, 5);

        setVotelist(formattedData);
      }
    } catch (err) {
      console.error("Gagal mengambil data Most Polling:", err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_mypolling();

    const channelId = `most-polling-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelId);

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetch_mypolling(true)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => fetch_mypolling(true)
      )
      .on('broadcast', { event: 'vote-updated' }, () => {
        fetch_mypolling(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch_mypolling]);

  useEffect(() => {
    const checkTheme = () => {
      setIsdark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class"] 
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="w-full bg-white dark:bg-black rounded-2xl shadow-md border border-gray-200 dark:border-2 dark:border-[#f1ece1] flex flex-col transition-colors overflow-hidden">
      
      {/* Judul: Hilang di HP, Muncul di Desktop (hidden sm:flex) */}
      <div className="hidden sm:flex bg-[#a50034] dark:bg-[#1e1e1e] py-3 px-4 items-center justify-center rounded-t-2xl transition-colors">
        <h1 className="text-white dark:text-[#f1ece1] text-xl font-bold tracking-wide">
          Most Polling
        </h1>
      </div>

      {/* List Item Polling */}
      <div className="p-3 flex flex-col gap-3 max-h-[420px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <p className="text-center text-xs text-gray-500 dark:text-[#f1ece1]/70 py-4 font-semibold">
            Memuat polling...
          </p>
        ) : votelist.length === 0 ? (
          <p className="text-center text-xs text-gray-500 dark:text-[#f1ece1]/70 py-4 font-semibold">
            Belum ada polling.
          </p>
        ) : (
          votelist.map((item, index) => {
            const username = item.users?.username || "Unknown";
            const avatarUrl = item.users?.avatar_url;
            const topic = item.tag ? `#${item.tag}` : item.description || "Tanpa Topik";
            const totalUpVotes = item.up_votes_count;

            return (
              <div key={item.id || index} className="flex flex-row items-center gap-2 w-full">
                
                {/* Rank Badge */}
                <span 
                  className={`font-black text-xs px-2 py-1 rounded-lg text-center flex-shrink-0 min-w-[32px] ${
                    index === 0 
                      ? "bg-amber-400 text-amber-950 shadow-xs dark:bg-[#f1ece1] dark:text-black"
                      : index === 1 
                      ? "bg-slate-300 text-slate-800 dark:bg-[#f1ece1] dark:text-black"        
                      : index === 2 
                      ? "bg-amber-700 text-white dark:bg-[#f1ece1] dark:text-black"             
                      : "bg-gray-100 text-gray-500 font-bold dark:bg-[#f1ece1] dark:text-black"   
                  }`}
                >
                  #{index + 1}
                </span>

                {/* Card Polling Item */}
                <div 
                  onClick={() => onPostClick && onPostClick(item)}
                  className="group bg-gray-50 dark:bg-[#1e1e1e] hover:bg-red-50/50 border border-gray-200 hover:border-[#a50034]/40 dark:hover:border-[#f1ece1] p-3 rounded-xl transition duration-200 flex flex-col gap-2 cursor-pointer flex-1 w-full min-w-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={username}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onUserClick) onUserClick(item.user_id);
                          }}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0 cursor-pointer border border-[#a50034] dark:border-[#f1ece1] hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onUserClick) onUserClick(item.user_id);
                          }}
                          className="w-6 h-6 rounded-full flex justify-center bg-white text-[#a50034] border border-[#a50034] dark:border-[#f1ece1] text-xs font-bold items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          {(username || "U")[0].toLowerCase()}
                        </div>
                      )}

                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onUserClick) onUserClick(item.user_id);
                        }}
                        className="font-semibold text-sm text-gray-800 dark:text-white truncate hover:underline"
                      >
                        @{username}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[#a50034] dark:text-white font-bold text-sm leading-snug break-words pl-1 truncate">
                    {topic}
                  </p>
                  
                  {/* Total Upvote */}
                  <span className="text-xs font-bold text-[#a50034] text-center bg-red-100/80 dark:bg-[#f1ece1] dark:text-black px-2 py-0.5 rounded-full flex-shrink-0">
                    {totalUpVotes} Setuju
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}