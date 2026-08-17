import Sidebar_Kiri from "./components/Sidebar_Kiri";
import Navbar from "./components/Navbar";
import Most_Polling from "./components/Most_Polling";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex">
      <Sidebar_Kiri />

      <div className="flex-1 flex flex-col items-center px-6">
        <Navbar />
        <main className="w-full max-w-2xl mt-20">
        </main>
      </div>

      <div className="p-6">
        <Most_Polling />
      </div>
    </div>
  );
}