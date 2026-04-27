import { useEffect, useState } from "react";
import { useBanners } from "@/hooks/useCategories";

export default function BannerCarousel() {
  const banners = useBanners();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="mx-4 mt-3 h-36 rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center border border-[#2a2a2a]">
        <p className="text-gray-500 text-sm">Nenhum banner ativo</p>
      </div>
    );
  }

  const banner = banners[current];

  const handleClick = () => {
    if (!banner.destUrl) return;
    if (banner.newTab) {
      window.open(banner.destUrl, "_blank");
    } else {
      window.location.href = banner.destUrl;
    }
  };

  return (
    <div className="mx-4 mt-3">
      <div
        className="relative h-36 rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleClick}
        data-testid="banner-carousel"
      >
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white text-xs font-semibold drop-shadow">{banner.title}</p>
        </div>
        {banner.featured && (
          <div className="absolute top-2 right-2 bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            DESTAQUE
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              data-testid={`banner-dot-${i}`}
              className={`rounded-full transition-all ${
                i === current ? "w-4 h-1.5 bg-[#FFD700]" : "w-1.5 h-1.5 bg-[#3a3a3a]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
