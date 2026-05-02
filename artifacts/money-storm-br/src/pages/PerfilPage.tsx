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

  // Link Base do seu App
  const APP_URL = "https://money-storm-build--moneystormbr1.replit.app";

  const handleCopy = () => {
    if (!userData.referralCode) return;
    const linkCompleto = `${APP_URL}/register?ref=${userData.referralCode}`;

    navigator.clipboard.writeText(linkCompleto).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
      <TopBar />

      <div className="px-4 py-4 space-y-3">
        {/* Avatar Card */}
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-[#2a2a2a] flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#FFD700] flex items-center justify-center mb-2">
            <span className="text-black text-2xl font-bold">{initials}</span>
          </div>
          <p className="text-white text-sm font-medium">{userData.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {userData.isAdmin && <span className="bg-blue-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>}
            {userData.isVip && <span className="bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">VIP</span>}
            {userData.isBanned && <span className="bg-red-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BANIDO</span>}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Saldo</p>
            <p className="text-white text-lg font-bold">{formatCurrency(userData.balance)}</p>
          </div>
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Total Ganho</p>
            <p className="text-white text-lg font-bold">{formatCurrency(userData.totalEarned)}</p>
          </div>
        </div>

        {/* Seção Indique e Ganhe */}
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/30 rounded-2xl border border-green-500/30 overflow-hidden">
          <button onClick={() => setShowInvite(!showInvite)} className="w-full flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Gift size={20} className="text-green-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-bold">Indique e Ganhe</p>
              <p className="text-green-400 text-xs">Ganhe R$ 0,10 por indicação</p>
            </div>
            <ChevronRight size={16} className={`text-gray-500 transition-transform ${showInvite ? "rotate-90" : ""}`} />
          </button>

          {showInvite && (
            <div className="px-4 pb-4 space-y-3 border-t border-green-500/20 pt-3">
              <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-[10px] mb-1">Seu código</p>
                  <p className="text-[#FFD700] text-xl font-bold tracking-widest">{userData.referralCode}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                    copied ? "bg-green-500 text-white" : "bg-[#FFD700] text-black"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar Link"}
                </button>
              </div>

              <button
                onClick={async () => {
                  const inviteUrl = `${APP_URL}/register?ref=${userData.referralCode}`;
                  const shareText = `🤑 Ganhe bônus no MONEY STORM BR! Use meu código ${userData.referralCode} e comece a lucrar agora mesmo! 💰\n👉 ${inviteUrl}`;

                  try {
                    if (navigator.share) {
                      await navigator.share({ title: "Money Storm BR", text: shareText, url: inviteUrl });
                    } else {
                      await navigator.clipboard.writeText(shareText);
                      alert("Convite copiado!");
                    }
                  } catch (err) {
                    // Evita o erro de "Share Canceled" na tela
                    console.log("Compartilhamento fechado.");
                  }
                }}
                className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                📤 Compartilhar Convite
              </button>
            </div>
          )}
        </div>

        {/* Links de Navegação */}
        <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] overflow-hidden">
          <Link href="/carteira">
            <button className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#2a2a2a]">
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                <History size={16} className="text-[#FFD700]" />
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">Meu Histórico</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </Link>
          <Link href="/carteira">
            <button className="w-full flex items-center gap-3 px-4 py-4">
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                <Wallet size={16} className="text-[#FFD700]" />
              </div>
              <span className="text-white text-sm font-medium flex-1 text-left">Carteira & Saques</span>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-900/30 border border-red-500/30 text-red-400 font-semibold py-3 rounded-2xl text-sm mt-4"
        >
          Sair da conta
        </button>
      </div>

      <BottomNav />
    </div>
  );
}