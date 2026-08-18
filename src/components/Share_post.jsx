import { useState } from "react";

export default function Share_post() {
  const [search, setSearch] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="min-w-xl h-auto flex flex-col justify-center bg-[#ffffff] border-2 border-[#a50034] p-2 rounded-xl">
        <h1 className="text-2xl text-[#a50034] text-center">Share this post to</h1>
      </div>
    </div>
  );  
}