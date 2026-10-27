
import { createClient } from "@supabase/supabase-js";

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
  ).trim();

  if (search.length > 100) {
    return Response.json(
      { error: "Search must be 100 characters or less" },
      { status: 400 }
    );
  }

  // PostgreSQL now handles the search
  const { data, error } = await supabase.rpc(
    "search_products",
    {
      search_term: search,
      max_results: 20,
    }
  );

  if (error) {
    console.error("Search error:", error.message);

    return Response.json(
      { error: "Unable to search products" },
      { status: 500 }
    );
  }

  return Response.json({
    count: data?.length ?? 0,
    products: data ?? [],
  });
}
