import { useAuth } from "@/contexts/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { History, Bell, Wallet, ChevronRight } from "lucide-react";

export default function PerfilPage() {
  const { userData, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!userData) return null;

  const initials = userData.email.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      <TopBar />

      <div className="px-4 py-4 space-y-3">
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-[#2a2a2a] flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#FFD700] flex items-center justify-center mb-2">
            <span className="text-black text-2xl font-bold">{initials}</span>
          </div>
          <p className="text-white text-sm font-medium">{userData.email}</p>
          <div className="flex gap-2 mt-2">
            {userData.isAdmin && (
              <span className="bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            )}
            {userData.isVip && (
              <span className="bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                VIP
              </span>
            )}
            {userData.isSuspect && (
              <span className="bg-orange-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                SUSPEITO
              </span>
            )}
            {userData.isBanned && (
              <span className="bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                BANIDO
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Saldo</p>
            <p className="text-white text-lg font-bold">{formatCurrency(userData.balance)}</p>
          </div>
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Total Ganho</p>
            <p className="text-white text-lg font-bold">{formatCurrency(userData.totalEarned)}</p>
          </div>
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Membro desde</p>
            <p className="text-white text-sm font-bold">
              {formatDate(userData.createdAt).split(" ")[0]}
            </p>
          </div>
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Tarefas Total</p>
            <p className="text-white text-lg font-bold">{userData.tasksTotal || 0}</p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <Link href="/carteira">
            <button
              data-testid="link-historico"
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                <History size={16} className="text-[#FFD700]" />
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">Meu Histórico</span>
              <span className="bg-[#2a2a2a] text-gray-400 text-[10px] px-2 py-0.5 rounded-full mr-1">Tudo</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </Link>
          <button
            data-testid="link-notificacoes"
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#2a2a2a] transition-colors border-b border-[#2a2a2a]"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
              <Bell size={16} className="text-[#FFD700]" />
            </div>
            <span className="text-white text-sm font-medium flex-1 text-left">Notificações</span>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
          <Link href="/carteira">
            <button
              data-testid="link-carteira"
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                <Wallet size={16} className="text-[#FFD700]" />
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">Carteira & Saques</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </Link>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 flex justify-between border-b border-[#2a2a2a]">
            <span className="text-gray-400 text-sm">Email</span>
            <span className="text-white text-sm truncate max-w-[180px]">{userData.email}</span>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <span className="text-gray-400 text-sm">Tarefas hoje</span>
            <span className="text-white text-sm">{userData.tasksToday || 0}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          data-testid="button-logout"
          className="w-full bg-red-900/30 border border-red-500/30 text-red-400 font-semibold py-3 rounded-2xl text-sm hover:bg-red-900/50 transition-colors"
        >
          Sair da conta
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
