import dummyData from "../../data/Dummy_data.json";

export default function Most_Polling() {
  const pollingList = dummyData.polling || [];

  return (
    <aside className="w-full bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col">
      <div className="bg-[#a50034] py-3 px-4 flex items-center justify-center rounded-t-2xl">
        <h1 className="text-white text-xl font-bold tracking-wide">Most Polling</h1>
      </div>

      <div className="p-3 flex flex-col gap-3 max-h-[420px] overflow-y-auto custom-scrollbar">
        {pollingList.map((item, index) => (
          <div key={index} className="flex flex-row items-center gap-2 w-full">
            
            <span 
              className={`font-black text-xs px-2 py-1 rounded-lg text-center flex-shrink-0 min-w-[32px] ${
                index === 0 
                  ? "bg-amber-400 text-amber-950 shadow-xs"
                  : index === 1 
                  ? "bg-slate-300 text-slate-800"        
                  : index === 2 
                  ? "bg-amber-700 text-white"             
                  : "bg-gray-100 text-gray-500 font-bold"   
              }`}
            >
              #{index + 1}
            </span>

            <div className="group relative bg-gray-50 hover:bg-red-50/50 border border-gray-200 hover:border-[#a50034]/40 p-3 rounded-xl transition duration-200 flex flex-col gap-2 cursor-pointer flex-1 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={item.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover border border-gray-300 flex-shrink-0"/>
                  <span className="font-semibold text-sm text-gray-800 truncate">{item.username}</span>
                </div>
              </div>
              <p className="text-[#a50034] font-bold text-sm leading-snug break-words pl-1">{item.topic}</p>
              <span className="text-xs font-bold text-[#a50034] text-center bg-red-100/80 px-2 py-0.5 rounded-full flex-shrink-0">{item.polling} Polling</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}