"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Input, Select, Button } from "antd";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
};

type Category = {
  _id: string;
  name: string;
  image?: string;
};

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [popular, setPopular] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/api/products/featured").then((r) => setFeatured(r));
    apiFetch("/api/products/new-arrivals").then((r) => setNewArrivals(r));
    apiFetch("/api/products/popular").then((r) => setPopular(r));
    apiFetch("/api/categories").then((r) => setCategories(r.categories || r));
  }, []);

  const submitNewsletter = () => {
    alert(`Subscribed ${newsletterEmail}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Hero */}
      <section className="flex justify-between items-start">
        <div className="flex-1 text-center py-12 bg-gradient-to-r from-black-500 to-gray-600 text-white rounded-lg">
          <h1 className="text-4xl font-bold mb-2">Shop the Best Deals</h1>
          <p className="mb-4">
            Discover featured, popular, and new arrivals tailored for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products">
              <Button type="primary">Browse Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/products?category=${c._id}`}
              className="border rounded overflow-hidden flex flex-col items-center p-4 hover:shadow"
            >
              <div className="w-full h-24 bg-gray-100 mb-2 flex items-center justify-center">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <div className="text-sm">{c.name}</div>
                )}
              </div>
              <div className="font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {featured.map((p) => (
            <Card
              key={p._id}
              title={p.name}
              extra={`$${p.price.toFixed(2)}`}
              hoverable
              cover={
                <img
                  src={p.images?.[0] || "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                />
              }
            >
              <div>Rating: {p.averageRating?.toFixed(1)}</div>
              <Link
                href={`/products/${p._id}`}
                className="text-blue-600 mt-2 block"
              >
                View
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* New Arrivals & Popular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-4">New Arrivals</h2>
          <div className="grid grid-cols-2 gap-4">
            {newArrivals.map((p) => (
              <Card
                key={p._id}
                title={p.name}
                extra={`$${p.price.toFixed(2)}`}
                hoverable
              >
                <img
                  src={p.images?.[0] || "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-32 object-cover mb-2"
                />
                <Link href={`/products/${p._id}`} className="text-blue-600">
                  View
                </Link>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Popular Products</h2>
          <div className="grid grid-cols-2 gap-4">
            {popular.map((p) => (
              <Card
                key={p._id}
                title={p.name}
                extra={`$${p.price.toFixed(2)}`}
                hoverable
              >
                <img
                  src={p.images?.[0] || "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-32 object-cover mb-2"
                />
                <Link href={`/products/${p._id}`} className="text-blue-600">
                  View
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <section className="border p-6 rounded flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <h3 className="text-xl font-medium">Stay in the loop</h3>
          <p className="text-sm text-gray-600">
            Sign up for news, deals, and updates.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="you@example.com"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
          />
          <Button type="primary" onClick={submitNewsletter}>
            Subscribe
          </Button>
        </div>
      </section>
    </div>
  );
}
