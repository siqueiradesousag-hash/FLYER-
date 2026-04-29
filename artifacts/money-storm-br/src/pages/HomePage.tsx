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

// IDs fixos de categorias — sincronizados com Firebase, ADM e CategoryPage
const STATIC_MISSIONS = [
  {
    id: "instalar_app",
    name: "INSTALE UM APP\nE GANHE",
    emoji: "📲",
    bg: "bg-[#1a1a2e]",
    iconBg: "bg-blue-900",
  },
  {
    id: "video_curto",
    name: "ASSISTIR E\nGANHAR 📷",
    emoji: "▶️",
    bg: "bg-[#1a2a1a]",
    iconBg: "bg-blue-700",
  },
  {
    id: "cursos",
    name: "CURSO DE\nECONOMIA 💰",
    emoji: "🎓",
    bg: "bg-[#1a1a2e]",
    iconBg: "bg-indigo-800",
  },
  {
    id: "noticias",
    name: "NOTÍCIAS",
    emoji: "📰",
    bg: "bg-[#2a1a1a]",
    iconBg: "bg-red-800",
  },
  {
    id: "checkin_noticias",
    name: "CHECK-IN DE\nNOTÍCIAS 🗞️",
    emoji: "✅",
    bg: "bg-[#1a1a2e]",
    iconBg: "bg-red-900",
  },
  {
    id: "video_premiado",
    name: "VIDEO\nPREMIADO",
    emoji: "🎬",
    bg: "bg-[#2a1a1a]",
    iconBg: "bg-red-700",
  },
];

const ICON_IMAGES: Record<string, string> = {
  instalar_app:  "https://img.icons8.com/fluency/96/download--v1.png",
  video_curto:   "https://img.icons8.com/fluency/96/play-button-circled.png",
  cursos:        "https://img.icons8.com/fluency/96/graduation-cap.png",
  noticias:      "https://img.icons8.com/fluency/96/news.png",
  checkin_noticias: "https://img.icons8.com/fluency/96/news.png",
  video_premiado:"https://img.icons8.com/fluency/96/youtube-play.png",
};

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const { config } = useAppConfig();
  const categories = useCategories();
  const allContents = useContents();

  const tasksToday = userData?.tasksToday ?? 0;
  const taskLimit = config.limiteTarefasDia ?? 30;
  const pct = Math.min((tasksToday / taskLimit) * 100, 100);

  // "Ler Notícias" featured content
  const lerNoticiaContent = allContents.find(
    (c) => c.categoryId === "noticias" || c.title?.toLowerCase().includes("notícia")
  );

  const goToCategory = (id: string) => {
    setLocation(`/category/${id}`);
  };

  // Always show the 6 fixed static missions.
  // If a Firebase category has the same fixed ID, use its imageUrl as icon override.
  const firebaseById: Record<string, { imageUrl?: string; icon?: string }> = {};
  for (const c of categories) firebaseById[c.id] = c;

  const showMissions = STATIC_MISSIONS.map((m) => ({
    ...m,
    imageUrl: firebaseById[m.id]?.imageUrl || ICON_IMAGES[m.id],
  }));

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
      <TopBar />

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Tarefas hoje */}
      <div className="mx-4 mt-3">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <span className="text-gray-800 text-sm font-semibold">Tarefas hoje</span>
          <span className="text-gray-800 text-sm font-bold">{tasksToday}/{taskLimit}</span>
        </div>
        <div className="mt-1 mx-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Botão Assistir e Ganhar */}
      <WatchButton />
      <p className="text-center text-green-400 text-sm font-semibold -mt-2 mb-3">
        Assistir e Ganhar
      </p>

      {/* MISSÕES */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-[#2a2a2a]" />
          <div className="flex items-center gap-1.5">
            <span className="text-red-500">🎯</span>
            <span className="text-[#FFD700] font-bold text-xs tracking-wide">
              MISSÕES PARA GANHAR DINHEIRO
            </span>
          </div>
          <div className="flex-1 h-px bg-[#2a2a2a]" />
        </div>

        {/* Grid 3 colunas de ícones */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {showMissions.map((mission) => (
            <button
              key={mission.id}
              onClick={() => goToCategory(mission.id)}
              data-testid={`mission-${mission.id}`}
              className="flex flex-col items-center bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-3 gap-2 hover:border-[#FFD700]/30 active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-[#2a2a2a]">
                {mission.imageUrl ? (
                  <img
                    src={mission.imageUrl}
                    alt={mission.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const el = e.currentTarget.nextElementSibling as HTMLElement;
                      if (el) el.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className="text-2xl hidden items-center justify-center w-full h-full"
                  style={{ display: mission.imageUrl ? "none" : "flex" }}
                >
                  {mission.emoji}
                </span>
              </div>
              <p className="text-white text-[10px] font-semibold text-center leading-tight whitespace-pre-line">
                {mission.name}
              </p>
            </button>
          ))}
        </div>

        {/* Featured "Ler Notícias" card */}
        {lerNoticiaContent ? (
          <button
            onClick={() => window.open(lerNoticiaContent.url, "_blank")}
            className="w-full flex items-center gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl px-4 py-3 hover:border-[#FFD700]/30 transition-colors mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📰</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-semibold">{lerNoticiaContent.title}</p>
              <p className="text-gray-400 text-xs">{lerNoticiaContent.description || "Ganhe por cada notícia lida"}</p>
            </div>
            <span className="text-green-400 text-xs font-bold">+{formatCurrency(lerNoticiaContent.reward)}</span>
          </button>
        ) : (
          <button
            onClick={() => goToCategory("lernoticias")}
            className="w-full flex items-center gap-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl px-4 py-3 hover:border-[#FFD700]/30 transition-colors mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📰</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white text-sm font-semibold">Ler Notícias</p>
              <p className="text-gray-400 text-xs">Ganhe por cada notícia lida</p>
            </div>
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
