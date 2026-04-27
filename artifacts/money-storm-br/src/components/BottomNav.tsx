import { useLocation, Link } from "wouter";
import { Home, Wallet, Trophy, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/carteira", label: "Carteira", icon: Wallet },
  { path: "/ranking", label: "Ranking", icon: Trophy },
  { path: "/admin", label: "ADM", icon: Shield },
  { path: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();
  const { userData } = useAuth();

  const items = userData?.isAdmin
    ? navItems
    : navItems.filter((n) => n.path !== "/admin");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] z-50">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {items.map(({ path, label, icon: Icon }) => {
          const active = location === path || (path !== "/" && location.startsWith(path));
          return (
            <Link key={path} href={path}>
              <button
                data-testid={`nav-${label.toLowerCase()}`}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                  active ? "text-[#FFD700]" : "text-gray-500"
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
