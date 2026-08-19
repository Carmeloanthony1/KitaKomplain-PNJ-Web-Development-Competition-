export default function Profile() {
  return (
    <div className="mt-4 w-full">
      
      {/* Container Profile */}
      <div className="flex items-center gap-3">
        <img
            src="/assets/Dummy_photo.png"
            alt="Foto profil"
            className="w-14 h-14 rounded-full object-cover"
        />
            <div>
                <h1 className="text-3xl font-bold mt-2">Nama</h1>
                <p className="text-sm text-blue-500 mb-4">Verify your account?</p>
            </div>
       </div>
    
      <h1 className="font-bold">Deskripsi</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Melo adalah seorang gay Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius possimus provident voluptatem similique quo inventore, perferendis quam tempore vitae ullam? Voluptate ea quas dolorum dignissimos minus eligendi quod quisquam in.</p>
      </div>

      {/* Container Bawah */}
      <div className="mt-10 flex item-center gap-3">
        <p className="text-sm text-blue-800"> your post </p>
                <p className="text-sm text-blue-800"> your comment </p>
                        <p className="text-sm text-blue-800"> your polling </p>

      </div>

      <div className="mt-2 flex item-center gap-3"> 
            <div className="bg-white rounded-lg shadow p-6 h-50 w-50">
                <img
                src="/assets/Dummy_photo.jpeg"
                className="w-full h-full object-cover rounded-lg"
                />

                <div className="flex flex-column">
                     <img
                        src="/assets/upvote(current).png"
                        className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.3] active:scale-150"
                    />
                    
                    <img 
                        src="/assets/upvote(current).png"
                        className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.3] active:scale-150 rotate-180"
                    />
                </div>
               
            </div>

            <div className="bg-white rounded-lg shadow p-6 h-50 w-50">
                <img
                src="/assets/Dummy_photo.jpeg"
                className="w-full h-full object-cover rounded-lg"
                />

                <div className="flex flex-column">
                    <img 
                        src="/assets/upvote(current).png"
                        className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.3] active:scale-150"
                    />
                    <img 
                        src="/assets/upvote(current).png"
                        className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.3] active:scale-150 rotate-180"
                    />
                </div>

            </div>

            <div className="bg-white rounded-lg shadow p-6 h-50 w-50">
                <img
                src="/assets/Dummy_photo.jpeg"
                className="w-full h-full object-cover rounded-lg"
                />

                <div className="flex flex-column">
                    <img 
                        src="/assets/upvote(current).png"
                        className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.3] active:scale-150"
                    />
                    <img 
                        src="/assets/upvote(current).png"
                        className="w-5 cursor-pointer transition-transform duration-150 hover:scale-[1.3] active:scale-150 rotate-180"
                    />
                </div>
            </div>

      </div>
      

      
    </div>
 
  );
}
