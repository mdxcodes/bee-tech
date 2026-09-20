import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Bot,
  Settings,
  Info,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/orders", label: "Orders", icon: ShoppingCart },
  { path: "/products", label: "Products", icon: Package },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/ai-logs", label: "AI Logs", icon: Bot },
  { path: "/whatsapp", label: "WhatsApp", icon: MessageSquare },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/competition", label: "Competition Info", icon: Info },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-ocean-800 text-white flex flex-col fixed left-0 top-0 z-20">
      <div className="p-5 border-b border-ocean-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏖️</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Kirana Store</h1>
            <p className="text-ocean-200 text-xs">AI Operator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-ocean-600 text-white"
                  : "text-ocean-100 hover:bg-ocean-700 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-ocean-700 text-xs text-ocean-300">
        <p>HACK IT BROS &apos;26</p>
        <p>Track 1: Autonomous AI</p>
      </div>
    </aside>
  );
}

export default Sidebar;
