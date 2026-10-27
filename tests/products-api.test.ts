
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { GET } from "../src/app/api/products/route";

// Mock the Supabase database call
const { rpcMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: rpcMock,
  }),
}));

// Helper for creating fake API requests
function makeRequest(search?: string) {
  const query =
    search === undefined
      ? ""
      : `?search=${encodeURIComponent(search)}`;

  return new Request(
    `http://localhost:3000/api/products${query}`
  );
}

describe("GET /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv(
      "SUPABASE_URL",
      "https://example.supabase.co"
    );

    vi.stubEnv(
      "SUPABASE_PUBLISHABLE_KEY",
      "sb_publishable_test"
    );

    rpcMock.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // Test 1
  it("returns matching products", async () => {
    const drills = [
      {
        id: "1001",
        name: "Cordless Drill",
        aisle: "12",
        bay: "3",
        shelf: "2",
      },
    ];

    rpcMock.mockResolvedValue({
      data: drills,
      error: null,
    });

    const response = await GET(makeRequest("drill"));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.count).toBe(1);
    expect(result.products).toEqual(drills);
  });

  // Test 2
  it("removes spaces from search input", async () => {
    await GET(makeRequest("  drill  "));

    expect(rpcMock).toHaveBeenCalledWith(
      "search_products",
      {
        search_term: "drill",
        max_results: 20,
      }
    );
  });

  // Test 3
  it("passes uppercase searches to PostgreSQL", async () => {
    await GET(makeRequest("DRILL"));

    expect(rpcMock).toHaveBeenCalledWith(
      "search_products",
      {
        search_term: "DRILL",
        max_results: 20,
      }
    );
  });

  // Test 4
  it("handles an empty search", async () => {
    await GET(makeRequest());

    expect(rpcMock).toHaveBeenCalledWith(
      "search_products",
      {
        search_term: "",
        max_results: 20,
      }
    );
  });

  // Test 5
  it("returns an empty list when nothing matches", async () => {
    const response = await GET(makeRequest("xyz"));
    const result = await response.json();

    expect(result.count).toBe(0);
    expect(result.products).toEqual([]);
  });

  // Test 6
  it("rejects searches longer than 100 characters", async () => {
    const response = await GET(
      makeRequest("a".repeat(101))
    );

    expect(response.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  // Test 7
  it("reports missing database configuration", async () => {
    vi.stubEnv("SUPABASE_URL", "");

    const response = await GET(makeRequest("drill"));

    expect(response.status).toBe(500);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  // Test 8
  it("handles database errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "Database unavailable" },
    });

    const response = await GET(makeRequest("drill"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Unable to search products",
    });
  });
});
