import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export interface Category {
  id: string;
  name: string;
  icon: string;
  imageUrl: string;
  order: number;
  active: boolean;
  vipOnly: boolean;
}

export interface Content {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  coverImage: string;
  iconUrl: string;
  type: string;
  openType: string;
  url: string;
  reward: number;
  order: number;
  priority: number;
  badge: string;
  buttonText: string;
  active: boolean;
  featured: boolean;
  vipOnly: boolean;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  destUrl: string;
  order: number;
  active: boolean;
  newTab: boolean;
  featured: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  imageUrl: string;
  externalUrl: string;
  reward: number;
  order: number;
  active: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const r = ref(db, "categories");
    return onValue(r, (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
      setCategories(list.filter((c) => c.active).sort((a, b) => a.order - b.order));
    });
  }, []);
  return categories;
}

export function useContents(categoryId?: string) {
  const [contents, setContents] = useState<Content[]>([]);
  useEffect(() => {
    const r = ref(db, "contents");
    return onValue(r, (snap) => {
      const data = snap.val() ?? {};
      let list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
      if (categoryId) list = list.filter((c) => c.categoryId === categoryId);
      setContents(list.filter((c) => c.active).sort((a, b) => a.order - b.order));
    });
  }, [categoryId]);
  return contents;
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  useEffect(() => {
    const r = ref(db, "banners");
    return onValue(r, (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
      setBanners(list.filter((b) => b.active).sort((a, b) => a.order - b.order));
    });
  }, []);
  return banners;
}

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  useEffect(() => {
    const r = ref(db, "news");
    return onValue(r, (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
      setNews(list.filter((n) => n.active).sort((a, b) => a.order - b.order));
    });
  }, []);
  return news;
}
