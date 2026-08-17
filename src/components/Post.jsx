import { useState } from "react";
import dummyData from "../../data/Dummy_data.json";

export default function Post(){
  const pollingList = dummyData.post || [];
  
  return (
    <div className="min-w-2xl w-full border-4 border-[#a50034] rounded-xl flex flex-col gap-4 p-4">
      {pollingList.map((item, index) => (
        <div key={index} className="flex flex-col gap-3 p-4 border-4 border-[#a50034]/50 rounded-lg bg-white shadow-xs">
          
          <div className="flex items-start gap-3">
            <img 
              src={item.avatar} 
              alt={item.username}
              className="w-10 h-10 mt-1 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap justify-between">
                <div className=" flex flex-col">
                  <span className="font-bold text-gray-800">{item.username}</span>
                  <span className="text-[#a50034] font-bold text-xs">#{item.title}</span>
                </div>
                <button className="text-2xl mb-1 cursor-pointer">...</button>
              </div>
              <p className="text-gray-900 text-sm leading-relaxed break-words">{item.content}</p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}