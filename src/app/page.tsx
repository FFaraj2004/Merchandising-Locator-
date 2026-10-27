
"use client";

import { useState } from "react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.id.includes(search)
  );

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
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 w-full rounded-lg border border-gray-300 bg-white p-4"
        />

        <h2 className="mb-4 text-xl font-semibold">
          Products ({filteredProducts.length})
        </h2>

        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

          {filteredProducts.length === 0 && (
            <p className="text-gray-500">
              No matching products found.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
