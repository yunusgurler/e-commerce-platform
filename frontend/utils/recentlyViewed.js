"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRecentlyViewed = addRecentlyViewed;
exports.getRecentlyViewed = getRecentlyViewed;
// utils/recentlyViewed.ts
const STORAGE_KEY = "recently_viewed";
function addRecentlyViewed(p) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        let list = raw ? JSON.parse(raw) : [];
        // dedupe and move to front
        list = [p, ...list.filter((x) => x._id !== p._id)];
        // limit to last 10
        list = list.slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
    catch { }
}
function getRecentlyViewed() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        return JSON.parse(raw);
    }
    catch {
        return [];
    }
}
