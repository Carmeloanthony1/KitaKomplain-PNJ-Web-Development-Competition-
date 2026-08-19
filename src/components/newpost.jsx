export function NewPost() {
    return ( 
        <div className="bg-blue-700 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Buat Postingan Baru</h2>
            <textarea 
                placeholder="Apa yang ingin kamu bagikan?"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-150">
                Posting
            </button>
        </div>
    )
}