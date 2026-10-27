
import type { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold">
        {product.name}
      </h3>

      <p className="text-sm text-gray-500">
        Item Number: {product.id}
      </p>

      <div className="mt-3 flex flex-wrap gap-6 text-sm">
        <span>Aisle: {product.aisle}</span>
        <span>Bay: {product.bay}</span>
        <span>Shelf: {product.shelf}</span>
      </div>
    </div>
  );
}
