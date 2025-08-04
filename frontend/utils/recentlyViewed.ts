// utils/recentlyViewed.ts
const STORAGE_KEY = "recently_viewed";

export type MiniProduct = {
  _id: string;
  name: string;
  images?: string[];
  price?: number;
};

export function addRecentlyViewed(p: MiniProduct) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: MiniProduct[] = raw ? JSON.parse(raw) : [];
    // dedupe and move to front
    list = [p, ...list.filter((x) => x._id !== p._id)];
    // limit to last 10
    list = list.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function getRecentlyViewed(): MiniProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
