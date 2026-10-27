
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/data/products";

export async function GET(request: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return Response.json(
      { error: "Database is not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const search = (
    new URL(request.url).searchParams.get("search") ?? ""
  ).trim().toLowerCase();

  // Get product records from PostgreSQL
  const { data, error } = await supabase
    .from("products")
    .select("id, name, aisle, bay, shelf")
    .order("id");

  if (error) {
    console.error("Database error:", error.message);

    return Response.json(
      { error: "Unable to load products" },
      { status: 500 }
    );
  }

  // Filter the database records by search query
  const results = (data ?? []).filter(
    (product: Product) =>
      product.name.toLowerCase().includes(search) ||
      product.id.includes(search)
  );

  return Response.json({
    count: results.length,
    products: results,
  });
}
