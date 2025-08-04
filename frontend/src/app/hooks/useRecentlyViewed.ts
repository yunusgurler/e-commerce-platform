// hooks/useRecentlyViewed.ts
export function addRecentlyViewed(product: {
  _id: string;
  name: string;
  images: string[];
}) {
  const key = "recently_viewed";
  try {
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as any[];
    // dedupe & keep latest first, cap at 10
    const filtered = [
      product,
      ...existing.filter((p) => p._id !== product._id),
    ].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {}
}

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem("recently_viewed") || "[]");
  } catch {
    return [];
  }
}
