// app/products/[id]/page.tsx
import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { StarFilled } from "@ant-design/icons";
import ProductRecommendations from "@/components/ProductRecommendations";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  specifications?: Record<string, any>;
  averageRating?: number;
  reviewCount?: number;
  category: { _id: string; name: string };
};

async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch product: ${res.status} - ${text}`);
  }
  const data = await res.json();
  // tolerate either { product: ... } or the product object directly
  const product: Product | undefined = data.product ?? data;
  if (!product || !product._id) {
    console.error("Raw response from product endpoint:", data);
    throw new Error("Product payload missing or malformed");
  }
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const product = await fetchProduct(params?.id);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  let product: Product | null = null;
  let error: string | null = null;

  try {
    product = await fetchProduct(params?.id);
  } catch (err: any) {
    error = err.message;
    console.error("Product fetch error:", err);
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p className="text-red-600">{error}</p>
        <Link href="/products" className="text-blue-600 underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Images */}
      <div className="md:col-span-1 space-y-4">
        <div className="border rounded overflow-hidden">
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            className="w-full object-cover"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {product.images?.map((img, i) => (
            <div
              key={i}
              className="w-20 h-20 border rounded overflow-hidden flex-shrink-0"
            >
              <img
                src={img}
                alt={`${product.name} ${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="md:col-span-2 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            {product.averageRating != null && (
              <div className="flex items-center gap-1 text-yellow-500">
                <StarFilled />
                <span>{product.averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Category:{" "}
            <Link
              href={`/products?category=${product.category._id}`}
              className="underline"
            >
              {product.category.name}
            </Link>
          </div>
        </div>

        <div className="text-2xl font-semibold">
          ${product.price.toFixed(2)}
        </div>

        <div className="space-y-4">
          <p>{product.description}</p>
          {product.specifications && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <div className="font-medium">{key}</div>
                  <div>{String(val)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add to cart / quantity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <label className="sr-only">Quantity</label>
            <input
              type="number"
              defaultValue={1}
              min={1}
              className="w-20 border rounded px-2 py-1"
              aria-label="Quantity"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Add to Cart
          </button>
          <div className="text-sm text-gray-500">
            Free shipping on orders over $100
          </div>
        </div>

        <ProductRecommendations
          product={product}
        />
      </div>
    </div>
  );
  
}


