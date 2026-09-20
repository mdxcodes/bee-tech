import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "../services/auth.js";

function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowDropdown(false);
    navigate("/login");
  };

  const getPageTitle = () => {
    const titles = {
      "/dashboard": "KIRANA STORE AI OPERATOR | Dashboard",
      "/orders": "KIRANA STORE AI OPERATOR | Orders",
      "/products": "KIRANA STORE AI OPERATOR | Products",
      "/customers": "KIRANA STORE AI OPERATOR | Customers",
      "/analytics": "KIRANA STORE AI OPERATOR | Analytics",
      "/ai-logs": "KIRANA STORE AI OPERATOR | AI Logs",
      "/settings": "KIRANA STORE AI OPERATOR | Settings",
    };
    return titles[location.pathname] || "KIRANA STORE AI OPERATOR | Dashboard";
  };

  return (
    <header className="h-14 bg-white border-b border-sand-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm text-black">
      <h2 className="text-sm font-bold text-black tracking-wide uppercase">{getPageTitle()}</h2>
      <div className="flex items-center gap-3">
        <button className="p-2 text-black hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors">
          <Bell size={18} />
        </button>
        <button className="p-2 text-black hover:bg-ocean-50 rounded-lg transition-colors">
          <Settings size={18} />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-3 border-l border-sand-200 hover:bg-sand-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="w-8 h-8 bg-ocean-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-black leading-tight">{user?.name || "User"}</p>
              <p className="text-xs text-gray-800 capitalize">{user?.role || "Guest"}</p>
            </div>
          </button>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand-200 rounded-lg shadow-lg z-20 py-1">
                <div className="px-3 py-2 border-b border-sand-100">
                  <p className="text-sm font-semibold text-black">{user?.name}</p>
                  <p className="text-xs text-gray-800">{user?.phone || user?.id}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
