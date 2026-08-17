import { useState } from "react";
export default function Sidebar_kiri(){
  const [search, setSearch] = useState("");
  
  return (
    <aside className="w-64 flex flex-col justify-between h-[calc(100vh-100px)]">
      <div className="flex flex-col gap-6">
        <button className="flex items-center gap-4 text-[#a50034]">
          <svg className = "w-7 h-7 fill-[#a50034]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"/>
          </svg> Home
        </button>
        <button className="flex items-center gap-4 text-[#a50034]">
          <svg className="w-7 h-7 fill-[#a50034]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"/>
          </svg> Post
        </button>
        <button className="flex items-center gap-4 text-[#a50034]">
          <svg className = "w-5 h-5 fill-[#951B32] flex-shrink-0 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
          </svg> History
        </button>
      </div>

      <div>
        <button className="flex items-center gap-4 text-[#a50034]">
          <svg className = "w-5 h-5 fill-[#951B32] flex-shrink-0 cursor-pointer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
          </svg> Setting
        </button>
      </div>  
    </aside>
  );  
}