import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Most_Polling() {
  const [votelist, setVotelist] = useState([]);
  const [isdark, setIsdark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Parameter isSilent = true biar gak nampilin indikator loading pas background refetch
  const fetch_mypolling = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, 
          tag, 
          description, 
          users (username, avatar_url), 
          votes (id, vote_type)
        `);
      
      if (error) throw error;

      if (data) {
        const formattedData = data
          .map((post) => {
            const votesArr = post.votes || [];

            // Hitung vote_type === 'up' atau 'setuju'
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
  };

  // Setup Initial Fetch & Realtime WebSocket
  useEffect(() => {
    fetch_mypolling();

    // Gunakan 1 channel bersih untuk mendengarkan tabel votes & posts
    const channel = supabase
      .channel('most-polling-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('⚡ Realtime Vote Change:', payload);
          fetch_mypolling(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('⚡ Realtime Post Change:', payload);
          fetch_mypolling(true);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('🟢 WebSocket Supabase Realtime Active!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('🔴 Gagal Connect Realtime WebSocket:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Theme observer
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
      
      {/* Header Most Polling */}
      <div className="bg-[#a50034] dark:bg-[#1e1e1e] py-3 px-4 flex items-center justify-center rounded-t-2xl transition-colors">
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
            const avatar = item.users?.avatar_url || "/default-avatar.png";
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
                <div className="group bg-gray-50 dark:bg-[#1e1e1e] hover:bg-red-50/50 border border-gray-200 hover:border-[#a50034]/40 dark:hover:border-[#f1ece1] p-3 rounded-xl transition duration-200 flex flex-col gap-2 cursor-pointer flex-1 w-full min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={avatar} 
                        alt="avatar" 
                        className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-[#f1ece1] flex-shrink-0"
                      />
                      <span className="font-semibold text-sm text-gray-800 dark:text-white truncate">
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