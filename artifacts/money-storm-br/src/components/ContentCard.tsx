import { Content } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/utils";

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  const handleClick = () => {
    if (!content.url) return;
    if (content.openType === "new_tab" || content.type === "LINK" || content.type === "DOWNLOAD") {
      window.open(content.url, "_blank");
    } else {
      window.location.href = content.url;
    }
  };

  return (
    <div
      className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-[#2a2a2a] flex flex-col"
      data-testid={`card-content-${content.id}`}
    >
      {content.coverImage && (
        <div className="relative">
          <img
            src={content.coverImage}
            alt={content.title}
            className="w-full h-28 object-cover"
          />
          {content.badge && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              {content.badge}
            </div>
          )}
          {content.featured && (
            <div className="absolute top-2 right-2 bg-[#FFD700] text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
              ★ DEST
            </div>
          )}
        </div>
      )}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start gap-2">
          {content.iconUrl && (
            <img src={content.iconUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{content.title}</p>
            {content.description && (
              <p className="text-gray-400 text-[10px] mt-0.5 line-clamp-2">{content.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <span className="text-[#FFD700] text-xs font-bold">+{formatCurrency(content.reward)}</span>
            <span className="text-gray-500 text-[10px]">• {content.type}</span>
          </div>
          <button
            onClick={handleClick}
            data-testid={`button-content-${content.id}`}
            className="bg-[#FFD700] text-black text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-[#e6c200] transition-colors"
          >
            {content.buttonText || "Ver Mais"}
          </button>
        </div>
      </div>
    </div>
  );
}
