import { useEffect, useState } from "react";
import dummyData from "../../data/Dummy_data.json";

export default function Most_Polling() {
  const [isdark, setIsdark] = useState(false);
  const pollingList = dummyData.polling || [];

  // Sinkronisasi status mode gelap dari elemen <html>
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
    <aside className="w-full bg-white dark:bg-black rounded-2xl shadow-md border border-gray-200 dark:border-2 dark:border-[#f1ece1] flex flex-col transition-colors">
      
      {/* Header Most Polling */}
      <div className="bg-[#a50034] dark:bg-[#1e1e1e] py-3 px-4 flex items-center justify-center rounded-t-2xl transition-colors">
        <h1 className="text-white dark:text-[#f1ece1] text-xl font-bold tracking-wide">
          Most Polling
        </h1>
      </div>

      {/* List Item Polling (SCROLLBAR HIDDEN) */}
      <div className="p-3 flex flex-col gap-3 max-h-[420px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pollingList.map((item, index) => (
          <div key={index} className="flex flex-row items-center gap-2 w-full">
            
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
            <div className="group bg-gray-50 dark:bg-[#1e1e1e] hover:bg-red-50/50 border border-gray-200 hover:border-[#a50034]/40 dark:hover:border-[#f1ece1] p-3 rounded-xl transition duration-200 flex flex-col gap-2 cursor-pointer flex-1 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={item.avatar} 
                    alt="avatar" 
                    className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-[#f1ece1] flex-shrink-0"
                  />
                  <span className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                    {item.username}
                  </span>
                </div>
              </div>
              <p className="text-[#a50034] dark:text-white font-bold text-sm leading-snug break-words pl-1">
                {item.topic}
              </p>
              <span className="text-xs font-bold text-[#a50034] text-center bg-red-100/80 dark:bg-[#f1ece1] dark:text-black px-2 py-0.5 rounded-full flex-shrink-0">
                {item.polling} Polling
              </span>
            </div>

          </div>
        ))}
      </div>
    </aside>
  );
}