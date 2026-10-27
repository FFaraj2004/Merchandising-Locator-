
"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

type ApiResponse = {
  count: number;
  products: Product[];
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(search)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: ApiResponse = await response.json();

        setProducts(data.products);
        setError("");
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load products.");
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [search]);

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold">
          Merchandising Locator
        </h1>

        <p className="mb-8 text-gray-600">
          Find products and their store locations instantly.
        </p>

        <input
          type="text"
          placeholder="Search product name or item number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setLoading(true);
          }}
          className="mb-6 w-full rounded-lg border border-gray-300 bg-white p-4"
        />

        <h2 className="mb-4 text-xl font-semibold">
          Products ({products.length})
        </h2>

        {loading && <p>Loading products...</p>}

        {error && (
          <p className="text-red-600">{error}</p>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

            {products.length === 0 && (
              <p className="text-gray-500">
                No matching products found.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
