import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { History, Bell, Wallet, ChevronRight, Copy, Check, Gift } from "lucide-react";

export default function PerfilPage() {
  const { userData, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  if (!userData) return null;

  const initials = (userData.email ?? "?").charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleCopy = () => {
    if (!userData.referralCode) return;
    navigator.clipboard.writeText(userData.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
      <TopBar />

      <div className="px-4 py-4 space-y-3">
        {/* Avatar */}
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-[#2a2a2a] flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#FFD700] flex items-center justify-center mb-2">
            <span className="text-black text-2xl font-bold">{initials}</span>
          </div>
          <p className="text-white text-sm font-medium">{userData.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {userData.isAdmin && (
              <span className="bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>
            )}
            {userData.isVip && (
              <span className="bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">VIP</span>
            )}
            {userData.isSuspect && (
              <span className="bg-orange-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SUSPEITO</span>
            )}
            {userData.isBanned && (
              <span className="bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BANIDO</span>
            )}
          </div>
        </div>

        {/* Stats */}
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

        {/* Indique e Ganhe */}
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/30 rounded-2xl border border-green-500/30 overflow-hidden">
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="w-full flex items-center gap-3 px-4 py-4"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Gift size={20} className="text-green-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-bold">Indique e Ganhe</p>
              <p className="text-green-400 text-xs">Ganhe R$ 0,10 por cada amigo indicado</p>
            </div>
            <ChevronRight
              size={16}
              className={`text-gray-500 transition-transform ${showInvite ? "rotate-90" : ""}`}
            />
          </button>

          {showInvite && (
            <div className="px-4 pb-4 space-y-3 border-t border-green-500/20 pt-3">
              <p className="text-gray-300 text-xs">
                Compartilhe seu código de convite. Quando um amigo se cadastrar com ele, você ganha{" "}
                <span className="text-green-400 font-bold">R$ 0,10</span> e ele também recebe um bônus!
              </p>

              <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-[10px] mb-1">Seu código de convite</p>
                  <p className="text-[#FFD700] text-xl font-bold tracking-widest">
                    {userData.referralCode || "Carregando..."}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                    copied ? "bg-green-500 text-white" : "bg-[#FFD700] text-black hover:bg-[#e6c200]"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2">
                <span className="text-green-400 text-lg">👥</span>
                <div>
                  <p className="text-white text-xs font-semibold">
                    {userData.referralCount ?? 0} amigo{(userData.referralCount ?? 0) !== 1 ? "s" : ""} indicado{(userData.referralCount ?? 0) !== 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-400 text-[10px]">
                    Total ganho: {formatCurrency((userData.referralCount ?? 0) * 0.10)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const text = `🤑 Use meu código ${userData.referralCode} no MONEY STORM BR e ganhe bônus grátis! Baixe agora e comece a ganhar dinheiro assistindo vídeos! 💰`;
                  if (navigator.share) {
                    navigator.share({ title: "Money Storm BR", text });
                  } else {
                    navigator.clipboard.writeText(text);
                    alert("Texto copiado! Cole e compartilhe com seus amigos.");
                  }
                }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                📤 Compartilhar Convite
              </button>
            </div>
          )}
        </div>

        {/* Links rápidos */}
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

        {/* Info */}
        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <div className="px-4 py-3 flex justify-between border-b border-[#2a2a2a]">
            <span className="text-gray-400 text-sm">Email</span>
            <span className="text-white text-sm truncate max-w-[180px]">{userData.email}</span>
          </div>
          <div className="px-4 py-3 flex justify-between">
            <span className="text-gray-400 text-sm">Tarefas hoje</span>
            <span className="text-[#FFD700] text-sm font-bold">{userData.tasksToday || 0}</span>
          </div>
        </div>

        {/* Logout */}
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
