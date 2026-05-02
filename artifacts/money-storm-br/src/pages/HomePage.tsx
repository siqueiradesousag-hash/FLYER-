import { useState } from "react";
import { useLocation } from "wouter";
import TopBar from "@/components/TopBar";
import BannerCarousel from "@/components/BannerCarousel";
import WatchButton from "@/components/WatchButton";
import BottomNav from "@/components/BottomNav";
import { useCategories, useContents } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { formatCurrency } from "@/lib/utils";

const STATIC_MISSIONS = [
  { id: "instalar_app", name: "CONVIDAR AMIGOS\nE GANHAR", emoji: "📲", bg: "bg-[#1a1a2e]", iconBg: "bg-blue-900" },
  { id: "video_curto", name: "ASSISTIR E\nGANHAR 📷", emoji: "▶️", bg: "bg-[#1a2a1a]", iconBg: "bg-blue-700" },
  { id: "cursos", name: "CURSO DE\nECONOMIA 💰", emoji: "🎓", bg: "bg-[#1a1a2e]", iconBg: "bg-indigo-800" },
  { id: "noticias", name: "NOTÍCIAS", emoji: "📰", bg: "bg-[#2a1a1a]", iconBg: "bg-red-800" },
  { id: "checkin_noticias", name: "CHECK-IN DE\nNOTÍCIAS 🗞️", emoji: "✅", bg: "bg-[#1a1a2e]", iconBg: "bg-red-900" },
  { id: "video_premiado", name: "VIDEO\nPREMIADO", emoji: "🎬", bg: "bg-[#2a1a1a]", iconBg: "bg-red-700" },
];

const ICON_IMAGES: Record<string, string> = {
  instalar_app: "https://img.icons8.com/fluency/96/group.png",
  video_curto: "https://img.icons8.com/fluency/96/play-button-circled.png",
  cursos: "https://img.icons8.com/fluency/96/graduation-cap.png",
  noticias: "https://img.icons8.com/fluency/96/news.png",
  checkin_noticias: "https://img.icons8.com/fluency/96/news.png",
  video_premiado: "https://img.icons8.com/fluency/96/youtube-play.png",
};

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth(); // Pega os dados do usuário logado
  const { config } = useAppConfig();
  const categories = useCategories();
  const allContents = useContents();

  const tasksToday = userData?.tasksToday ?? 0;
  const taskLimit = config.limiteTarefasDia ?? 30;
  const pct = Math.min((tasksToday / taskLimit) * 100, 100);

  // FUNÇÃO DE CONVITE DINÂMICO
  const handleInvite = () => {
    // Pega o código único do usuário logado
    const refCode = userData?.referralCode || "U8W2RKP6";

    // Link original que você solicitou
    const appUrl = `https://money-storm-build--moneystormbr1.replit.app/register?ref=${refCode}`;

    const message = `🤑 Ganhe bônus no MONEY STORM BR!\n\nUse meu código: ${refCode}\n\nComece a lucrar agora mesmo! 💰\n👉 ${appUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Money Storm BR',
        text: message,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(message);
      alert("Link de convite copiado com sucesso!");
    }
  };

  const goToCategory = (id: string) => setLocation(`/category/${id}`);

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
      <TopBar />
      <BannerCarousel />

      {/* Barra de Progresso de Tarefas */}
      <div className="mx-4 mt-3">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <span className="text-gray-800 text-sm font-semibold">Tarefas hoje</span>
          <span className="text-gray-800 text-sm font-bold">{tasksToday}/{taskLimit}</span>
        </div>
        <div className="mt-1 mx-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <WatchButton />
      <p className="text-center text-green-400 text-sm font-semibold -mt-2 mb-3">Assistir e Ganhar</p>

      <div className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <div className="flex items-center gap-1.5">
            <span className="text-red-500">🎯</span>
            <span className="text-[#FFD700] font-bold text-xs tracking-wide">MISSÕES PARA GANHAR DINHEIRO</span>
          </div>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
        </div>

        {/* Grid de Missões */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {STATIC_MISSIONS.map((m) => (
            <button 
              key={m.id} 
              onClick={() => m.id === "instalar_app" ? handleInvite() : goToCategory(m.id)} 
              className="flex flex-col items-center bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-3 gap-2 hover:border-[#FFD700]/30 active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-[#2a2a2a]">
                <img src={ICON_IMAGES[m.id]} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-white text-[10px] font-semibold text-center leading-tight whitespace-pre-line">{m.name}</p>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}