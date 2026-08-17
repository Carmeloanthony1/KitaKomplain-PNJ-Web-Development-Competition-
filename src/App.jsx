import Sidebar_kiri from "./components/Sidebar_Kiri";
import Navbar from "./components/Navbar";


export default function App() {
  return (
    <div className="bg-[#f7f7f7] min-h-screen px-8 py-4">
      <Sidebar_kiri />

      <div className="pl-72 flex flex-col gap-6">
        <Navbar />

        <div className="flex gap-8 justify-between items-start pt-4">
        </div>
      </div>
    </div>
  );
}