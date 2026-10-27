# Merchandising Locator

**A full-stack product-location search app inspired by real retail merchandising workflows.**

[**Live demo**](https://merchandising-locator.vercel.app) · [**GitHub profile**](https://github.com/FFaraj2004)

> **Status: Work in progress.** The current demo uses **fictional product data**. This is a personal portfolio project, not an official CROSSMARK or Bunnings system. AI-powered search is an idea for a later iteration, **not a feature of the current release**.

## Why I built this

While working in retail merchandising, I noticed how much time can be spent looking through planograms and item-number lists to find the correct product location. I started Merchandising Locator as a way to explore a faster, searchable workflow for finding an item by name or SKU and displaying its aisle, bay and shelf.

## What works today

- Search products by **name or item number** with case-insensitive matching.
- View each matching product's **aisle, bay and shelf**.
- Responsive React UI built with **reusable, typed components**.
- **Next.js REST API** that passes search requests to **Supabase PostgreSQL**.
- Database-side filtering through a PostgreSQL **`search_products` RPC function**, with up to **20 results per request**.
- Basic request validation, error handling, loading states and cancellation of outdated frontend requests.
- **8 Vitest API-handler tests**, using mocks for successful requests, empty results, invalid input and database/configuration failures.
- Live production deployment on **Vercel**.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers, REST/JSON, Supabase JavaScript client |
| Database | PostgreSQL (Supabase), SQL, Row Level Security, RPC |
| Testing | Vitest, mocked Supabase calls |
| Deployment | Vercel, Git, GitHub |

## Architecture

```text
Browser / React UI
       |
       | GET /api/products?search=drill
       v
Next.js API route
       |
       | Supabase RPC: search_products(search_term, max_results)
       v
PostgreSQL products table
       |
       v
JSON response -> ProductCard components
```

The database applies case-insensitive matching and limits the result set. The frontend does not connect directly to PostgreSQL. Read access for the fictional demo data is controlled with Supabase Row Level Security.

## API example

```http
GET /api/products?search=drill
```

Example response (using the demo dataset):

```json
{
  "count": 2,
  "products": [
    {"id": "1001", "name": "Cordless Drill", "aisle": "12", "bay": "3", "shelf": "2"},
    {"id": "1006", "name": "Impact Drill", "aisle": "12", "bay": "3", "shelf": "1"}
  ]
}
```

The API trims whitespace, rejects search terms longer than 100 characters, and returns at most 20 products. The `count` property is the number of **returned** products, not the total number of matches in the database.

## Run locally

**Requirements:** Node.js (version 22 recommended), npm and a Supabase project with the database described below.

```bash
git clone https://github.com/FFaraj2004/Merchandising-Locator-.git
cd Merchandising-Locator-
npm ci
```

Create a `.env.local` file in the project root:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Create a `public.products` table in Supabase with text columns `id` (primary key), `name`, `aisle`, `bay` and `shelf`, then add fictional product records. The API also expects a PostgreSQL function named `public.search_products(search_term TEXT, max_results INTEGER)`, which returns those five columns and searches name or ID case-insensitively. Configure suitable read-only RLS policies; the database schema and migrations are planned to be added to the repository in a later iteration.

**Never commit database passwords or service-role/secret keys.** The project uses a publishable Supabase key subject to database access policies.

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## Testing and checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The 8 current tests mock Supabase and verify the **API handler's behaviour**. They do not yet test the live PostgreSQL function end to end.

## Project roadmap

- [x] Search interface with product location cards
- [x] Typed, reusable React components
- [x] Next.js backend API
- [x] Supabase PostgreSQL integration and database-side search
- [x] Automated API-handler tests
- [x] Public deployment on Vercel
- [ ] Version-controlled database schema and setup scripts
- [ ] Improved mobile interface and user experience
- [ ] Search pagination and larger-dataset performance evaluation
- [ ] Integration tests against a dedicated test database
- [ ] Optional natural-language / AI-assisted product lookup

## Author

**Fouad Faraj** · [GitHub: FFaraj2004](https://github.com/FFaraj2004)

Built as an ongoing software engineering portfolio project using **synthetic data only**.
