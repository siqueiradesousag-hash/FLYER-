import { useEffect, useState, useCallback } from "react";
import { useBanners } from "@/hooks/useCategories";
import { ChevronRight } from "lucide-react";

export default function BannerCarousel() {
  const banners = useBanners();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [banners.length, next]);

  // Reset index when banners length changes
  useEffect(() => {
    setCurrent(0);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="mx-4 mt-3 h-40 rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center border border-[#2a2a2a]">
        <p className="text-gray-500 text-sm">Nenhum banner ativo</p>
      </div>
    );
  }

  const banner = banners[Math.min(current, banners.length - 1)];

  const handleClick = () => {
    if (!banner?.destUrl) return;
    window.open(banner.destUrl, "_blank");
  };

  return (
    <div className="mx-4 mt-3">
      <div
        className="relative h-40 rounded-2xl overflow-hidden cursor-pointer select-none"
        data-testid="banner-carousel"
        onClick={handleClick}
      >
        {/* slide transition */}
        {banners.map((b, i) => (
          <div
            key={b.id ?? i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={b.imageUrl}
              alt={b.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* "VER MAIS" button — green tarja */}
            {b.destUrl && (
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  {b.title && (
                    <p className="text-white text-xs font-semibold drop-shadow mb-1">{b.title}</p>
                  )}
                  <button
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleClick(); }}
                  >
                    VER MAIS <ChevronRight size={12} />
                  </button>
                </div>
                {b.featured && (
                  <div className="self-start bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    DESTAQUE
                  </div>
                )}
              </div>
            )}

            {/* featured badge when no destUrl */}
            {!b.destUrl && b.featured && (
              <div className="absolute top-2 right-2 bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                DESTAQUE
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              data-testid={`banner-dot-${i}`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-5 h-1.5 bg-[#FFD700]" : "w-1.5 h-1.5 bg-[#3a3a3a]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
