import { useRoute, useLocation } from "wouter";
import { useContents } from "@/hooks/useCategories";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { Zap } from "lucide-react";

const CATEGORY_TITLES: Record<string, string> = {
  instalar_app:     "INSTALE UM APP E GANHE",
  video_curto:      "ASSISTIR E GANHAR",
  cursos:           "CURSO DE ECONOMIA",
  noticias:         "NOTÍCIAS",
  checkin_noticias: "CHECK-IN DE NOTÍCIAS",
  video_premiado:   "VIDEO PREMIADO",
};

export default function CategoryPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/category/:id");
  const categoryId = match ? params!.id : "";

  const contents = useContents(categoryId);

  const title = CATEGORY_TITLES[categoryId] || categoryId.toUpperCase();

  const handleContent = (url: string, openType?: string) => {
    if (!url) return;
    if (openType === "same_tab") {
      window.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
      {/* Custom header with back */}
      <header className="sticky top-0 z-40 bg-[#121212] border-b border-[#2a2a2a] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setLocation("/")}
          className="text-gray-300 hover:text-white transition-colors p-1"
          data-testid="back-button"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>
        <div>
          <p className="text-white font-bold text-base">{title}</p>
          <p className="text-gray-400 text-xs">
            {contents.length > 0
              ? `${contents.length} ${contents.length === 1 ? "oferta disponível" : "ofertas disponíveis"}`
              : "Carregando..."}
          </p>
        </div>
      </header>

      <div className="px-3 py-3">
        {contents.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <span className="text-5xl">📭</span>
            <p className="text-gray-400 text-sm text-center">
              Nenhuma oferta disponível nessa categoria ainda.
            </p>
            <p className="text-gray-600 text-xs text-center">
              O administrador pode adicionar conteúdos no painel ADM.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {contents.map((content) => (
              <div
                key={content.id}
                className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-[#2a2a2a] flex flex-col"
                data-testid={`content-${content.id}`}
              >
                {/* Cover Image */}
                <div className="relative">
                  {content.coverImage ? (
                    <img
                      src={content.coverImage}
                      alt={content.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-[#2a2a2a] flex items-center justify-center">
                      {content.iconUrl ? (
                        <img src={content.iconUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>
                  )}
                  {/* Badge */}
                  {content.badge && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {content.badge}
                    </div>
                  )}
                  {content.featured && (
                    <div className="absolute top-2 left-2 bg-[#FFD700] text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                      NOVO
                    </div>
                  )}
                </div>

                {/* Content body */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                    {content.title}
                  </p>
                  {content.description && (
                    <p className="text-gray-400 text-[10px] line-clamp-2">
                      {content.description}
                    </p>
                  )}
                  <p className="text-green-400 text-sm font-bold mt-auto">
                    {formatCurrency(content.reward)}
                  </p>
                  <button
                    onClick={() => handleContent(content.url, content.openType)}
                    data-testid={`btn-content-${content.id}`}
                    className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-400 active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    <Zap size={12} />
                    {content.buttonText || "BAIXAR AGORA"} 💰
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
