"use client";

import React, { useEffect, useState } from "react";
import { Card, Input, Select, Pagination } from "antd";
import { apiFetch } from "../../../utils/api";
import Link from "next/link";

type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
  category: string;
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(searchParams?.search || "");
  const [category, setCategory] = useState(searchParams?.category || "");
  const [sort, setSort] = useState(searchParams?.sort || "newest");
  const [page, setPage] = useState(Number(searchParams?.page) || 1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort) {
      if (sort === "price_asc") params.set("sort", "price:asc");
      else if (sort === "price_desc") params.set("sort", "price:desc");
      else if (sort === "rating") params.set("sort", "averageRating:desc");
      else params.set("sort", "createdAt:desc");
    }
    params.set("page", String(page));
    params.set("limit", "12");
    const res = await apiFetch(`/api/products?${params.toString()}`);
    setProducts(res.products);
    setTotal(res.meta.total);
  };

  useEffect(() => {
    load();
  }, [search, category, sort, page]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div className="flex gap-2 flex-wrap">
          <Input.Search
            placeholder="Search products by name..."
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            style={{ width: 240 }}
          />

          <Select
            value={sort}
            onChange={(v) => setSort(v)}
            options={[
              { label: "Newest", value: "newest" },
              { label: "Price ↑", value: "price_asc" },
              { label: "Price ↓", value: "price_desc" },
              { label: "Rating", value: "rating" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {products.map((p) => (
          <Card
            key={p._id}
            title={p.name}
            extra={`$${p.price.toFixed(2)}`}
            hoverable
          >
            <div className="flex flex-col">
              <div className="mb-2">
                <img
                  src={p.images?.[0] || "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded"
                />
              </div>
              <div className="text-sm mb-1">
                Rating: {p.averageRating?.toFixed(1)}
              </div>
              <Link href={`/products/${p._id}`} className="text-blue-600">
                View details
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Pagination
          current={page}
          pageSize={12}
          total={total}
          onChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
}
