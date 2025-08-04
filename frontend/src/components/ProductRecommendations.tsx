// components/ProductRecommendations.tsx (client)
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Spin } from "antd";
import { usePathname } from "next/navigation";
import {
  addRecentlyViewed,
  getRecentlyViewed,
  MiniProduct,
} from "../../utils/recentlyViewed";

type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  averageRating?: number;
  reviewCount?: number;
  category: { _id: string; name: string };
};

type Props = {
  product: Product;
  accessToken?: string;
};

export default function ProductRecommendations({
  product,
  accessToken,
}: Props) {
  const [related, setRelated] = useState<Product[]>([]);
  const [recent, setRecent] = useState<MiniProduct[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    // add current to recently viewed
    addRecentlyViewed({
      _id: product._id,
      name: product.name,
      images: product.images,
      price: product.price,
    });
    setRecent(getRecentlyViewed().filter((p) => p._id !== product._id)); // exclude itself

    // fetch related
    (async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"
          }/api/products/${product._id}/related-by-embedding`,
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
          }
        );
        if (!res.ok) throw new Error("Failed to load related");
        const data = await res.json();
        setRelated(data.related || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingRelated(false);
      }
    })();
  }, [product]);

  return (
    <div className="space-y-10">
      {/* Related */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Related Products</h2>
        {loadingRelated ? (
          <Spin />
        ) : related.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p._id}
                href={`/products/${p._id}`}
                className="border rounded overflow-hidden hover:shadow"
              >
                <Card
                  size="small"
                  bodyStyle={{ padding: 8 }}
                  cover={
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-32 object-cover"
                    />
                  }
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm">${p.price.toFixed(2)}</div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            No related products found.
          </div>
        )}
      </div>

      {/* Recently Viewed */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Recently Viewed</h2>
        {recent.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recent.map((p) => (
              <Link
                key={p._id}
                href={`/products/${p._id}`}
                className="border rounded overflow-hidden hover:shadow"
              >
                <Card
                  size="small"
                  bodyStyle={{ padding: 8 }}
                  cover={
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-32 object-cover"
                    />
                  }
                >
                  <div className="font-medium">{p.name}</div>
                  {p.price != null && (
                    <div className="text-sm">${p.price.toFixed(2)}</div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            You haven't viewed any other products yet.
          </div>
        )}
      </div>
    </div>
  );
}
