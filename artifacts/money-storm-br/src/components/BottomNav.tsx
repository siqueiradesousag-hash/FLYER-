import { useLocation, Link } from "wouter";
import { Home, Wallet, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNav() {
  const [location] = useLocation();
  const { userData } = useAuth();

  const isAdmin = userData?.isAdmin || userData?.role === "admin";

  const baseItems = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/carteira", label: "Carteira", icon: Wallet },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  const adminItem = { path: "/admin", label: "ADM", icon: Shield };

  const items = isAdmin
    ? [baseItems[0], baseItems[1], adminItem, baseItems[2]]
    : baseItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {items.map(({ path, label, icon: Icon }) => {
          const active = location === path || (path !== "/" && location.startsWith(path));
          const isAdmTab = path === "/admin";
          return (
            <Link key={path} href={path}>
              <button
                data-testid={`nav-${label.toLowerCase()}`}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                  active
                    ? isAdmTab
                      ? "text-[#FFD700]"
                      : "text-[#FFD700]"
                    : isAdmTab
                    ? "text-emerald-400"
                    : "text-gray-500"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
