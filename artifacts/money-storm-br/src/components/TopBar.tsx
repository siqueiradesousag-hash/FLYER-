import { Bell } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { formatCurrency } from "@/lib/utils";

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  onBack?: () => void;
}

export default function TopBar({ showBack, title, onBack }: TopBarProps) {
  const { userData } = useAuth();
  const { config } = useAppConfig();

  return (
    <header className="sticky top-0 z-40 bg-[#121212] border-b border-[#2a2a2a] px-4 py-3 flex items-center gap-3">
      {showBack ? (
        <button
          onClick={onBack}
          data-testid="button-back"
          className="text-[#FFD700] flex items-center gap-1 text-sm font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          {title || "Admin Panel"}
        </button>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <img
            src={config.logoUrl}
            alt="Logo"
            className="w-10 h-10 rounded-lg object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div>
            <p className="text-[#FFD700] text-sm font-bold leading-none">{config.appName}</p>
            <p className="text-gray-400 text-[10px]">Ganhe assistindo • Receba via Pix</p>
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {userData && (
          <>
            <div className="text-right">
              <p className="text-gray-400 text-[10px]">Saldo</p>
              <p className="text-white text-sm font-bold">{formatCurrency(userData.balance)}</p>
            </div>
            <Link href="/carteira">
              <button
                data-testid="button-sacar"
                className="bg-[#FFD700] text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#e6c200] transition-colors"
              >
                Sacar
              </button>
            </Link>
          </>
        )}
        <button data-testid="button-bell" className="text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
