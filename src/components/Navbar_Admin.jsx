import { useNavigate } from "react-router-dom";

export default function NavbarAdmin({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  // Hanya 4 menu (Dashboard dihilangkan)
  const menuItems = [
    { id: "moderation", label: "Moderation" },
    { id: "users", label: "Users" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#1e1e1e] text-[#f1ece1] border-r-4 border-[#a50034] p-6 flex flex-col justify-between select-none shrink-0">
      <div>
        {/* Tombol Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 text-xl font-bold hover:opacity-80 transition-all cursor-pointer mb-10 group"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">
            <svg className = "w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path d="M73.4 297.4C60.9 309.9 60.9 330.2 73.4 342.7L233.4 502.7C245.9 515.2 266.2 515.2 278.7 502.7C291.2 490.2 291.2 469.9 278.7 457.4L173.3 352L544 352C561.7 352 576 337.7 576 320C576 302.3 561.7 288 544 288L173.3 288L278.7 182.6C291.2 170.1 291.2 149.8 278.7 137.3C266.2 124.8 245.9 124.8 233.4 137.3L73.4 297.3z"/>
            </svg>
          </span>
          <span>Back</span>
        </button>

        {/* Menu Navigasi (4 Menu) */}
        <nav className="flex flex-col gap-6">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-left text-3xl font-extrabold transition-colors cursor-pointer ${
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}