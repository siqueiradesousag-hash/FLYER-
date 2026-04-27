import { useState } from "react";
import { Link } from "wouter";
import TopBar from "@/components/TopBar";
import BannerCarousel from "@/components/BannerCarousel";
import WatchButton from "@/components/WatchButton";
import ContentCard from "@/components/ContentCard";
import BottomNav from "@/components/BottomNav";
import { useCategories, useContents } from "@/hooks/useCategories";
import { ChevronRight } from "lucide-react";

export default function HomePage() {
  const categories = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const contents = useContents(selectedCategory || undefined);

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      <TopBar />
      <BannerCarousel />
      <WatchButton />

      {categories.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              data-testid="cat-all"
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === null
                  ? "bg-[#FFD700] text-black"
                  : "bg-[#1e1e1e] text-gray-300 border border-[#2a2a2a]"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                data-testid={`cat-${cat.id}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#FFD700] text-black"
                    : "bg-[#1e1e1e] text-gray-300 border border-[#2a2a2a]"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 mt-3">
        {contents.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-gray-500 text-sm">Nenhuma oferta disponível.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
