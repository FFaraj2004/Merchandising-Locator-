
import { products } from "@/data/products";

export function GET(request: Request) {
  const url = new URL(request.url);

  const search = (
    url.searchParams.get("search") ?? ""
  ).trim().toLowerCase();

  const results = products.filter((product) =>
    product.name.toLowerCase().includes(search) ||
    product.id.includes(search)
  );

  return Response.json({
    count: results.length,
    products: results,
  });
}
