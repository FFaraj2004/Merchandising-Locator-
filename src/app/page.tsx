
"use client";

import { useState } from "react";

// Our sample products (fictional data)
const products = [
  { id: "1001", name: "Cordless Drill", aisle: "12", bay: "3", shelf: "2" },
  { id: "1002", name: "Hex Bolts M12", aisle: "8", bay: "4", shelf: "1" },
  { id: "1003", name: "Hammer", aisle: "10", bay: "2", shelf: "3" },
  { id: "1004", name: "Screwdriver Set", aisle: "11", bay: "1", shelf: "2" },
  { id: "1005", name: "Timber Screws", aisle: "8", bay: "5", shelf: "4" },
  { id: "1006", name: "Impact Drill", aisle: "12", bay: "3", shelf: "1" },
];

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
            <div
              key={product.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-bold">
                {product.name}
              </h3>

              <p className="text-sm text-gray-500">
                Item Number: {product.id}
              </p>

              <div className="mt-3 flex gap-6 text-sm">
                <span>Aisle: {product.aisle}</span>
                <span>Bay: {product.bay}</span>
                <span>Shelf: {product.shelf}</span>
              </div>
            </div>
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
