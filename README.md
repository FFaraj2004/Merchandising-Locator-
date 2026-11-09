# Merchandising Locator

**A document-search workspace for retail merchandising, built with Next.js, TypeScript and PDF.js.**

[Live demo](https://merchandising-locator.vercel.app) · [Source code](https://github.com/FFaraj2004/Merchandising-Locator-)

> **Portfolio project — actively developed.** Built to explore a real workflow problem: finding products and their locations across merchandising documents. All examples use fictional data. This is not affiliated with CROSSMARK, Bunnings or any other employer.

## The problem

Merchandisers often work from planograms, product lists and layout PDFs. Looking up a single item can mean opening a document, searching for its SKU, checking its bay and position, and repeating that process for the next item.

I built Merchandising Locator to make this information faster to find, while retaining a link back to the source document so locations can be checked.

## Current features

### PDF workspace

- Upload **one PDF at a time** (up to 20 MB).
- Extract selectable text in the browser using **PDF.js**.
- Parse product records containing an **item number, description, bay, position and source page**.
- Recognise simple pipe-separated, tab-separated and space-separated product rows.
- Filter extracted products by item number or description.
- Fall back to searching the original extracted PDF text when no structured product matches.
- Select a result to navigate to its **source page**, with a side-by-side document preview and Previous/Next controls.

The current repository homepage (`/`) presents the PDF workspace. A separate PDF route (`/pdf-search`) also exists in the repository.

### Product search API and database

- A Next.js `GET /api/products?search=...` endpoint backed by **Supabase PostgreSQL**.
- Database-side, case-insensitive search through a `search_products` RPC function, returning up to 20 records.
- Input validation and error handling.
- A fictional demo product dataset, with Row Level Security configured for read-only access.

The API and PDF extraction are currently **separate workflows**; extracted PDF products are not automatically written into Supabase.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| PDF processing | PDF.js (`pdfjs-dist`), browser Canvas |
| Backend | Next.js Route Handlers, REST/JSON |
| Database | Supabase PostgreSQL, SQL, Row Level Security, RPC |
| Quality | Vitest, ESLint, TypeScript |
| Deployment | Vercel, GitHub |

## How the PDF feature works

```text
PDF file (user's browser)
       |
       v
PDF.js extracts page text
       |
       v
parseProductRows(text, pageNumber)
       |
       v
Searchable records: SKU / description / bay / position / page
       |
       v
Select result --> Render source PDF page using Canvas
```

For the current PDF workspace, processing happens on the client side; PDFs are not uploaded to the application's Supabase database.

The database-backed product search uses a different path:

```text
GET /api/products?search=drill
       |
       v
Next.js API route --> Supabase RPC --> PostgreSQL products table
       |
       v
JSON response
```

## Run locally

**Requirements:** Node.js 22 and npm.

```bash
git clone https://github.com/FFaraj2004/Merchandising-Locator-.git
cd Merchandising-Locator-
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The PDF workspace can be used without Supabase credentials. To use the database-backed API, create `.env.local`:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

The backend expects a `public.products` table and a `public.search_products(search_term TEXT, max_results INTEGER)` function. Database setup scripts have not yet been committed, so a fresh installation of the database API needs manual Supabase configuration. Never commit service-role keys, passwords or `.env.local`.

## Tests and quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The test suite contains **19 tests**: 8 API-handler tests with mocked Supabase behaviour, and 11 parser tests covering validation and the supported text row formats. These are unit-level tests; they do not prove that every real-world planogram layout can be parsed.

## Current limitations

- **Single PDF:** uploading another file replaces the previous document.
- PDFs must contain extractable text; image-only scans need OCR, which is not implemented.
- Extraction is line-based and may miss complex PDF tables or columns whose text is output in an unexpected order.
- Clicking a product navigates to the source **page**, but does not highlight its exact position on the page.
- Uploaded PDF data is held in the current browser session, not saved for later retrieval.
- Real customer/employer documents should not be uploaded without permission.

## Roadmap

- [x] Full-stack product search API backed by PostgreSQL
- [x] Automated API and parser tests
- [x] PDF text extraction and basic structured parsing
- [x] Side-by-side product results and source PDF viewer
- [ ] **Search across multiple uploaded PDFs in one workspace**, with filenames shown beside results
- [ ] Remove individual PDFs and export consolidated results to CSV
- [ ] Improve table extraction, source verification and false-positive handling
- [ ] Add tests for multi-document state, navigation and large PDFs
- [ ] Add a version-controlled Supabase database schema/migration
- [ ] Add a GitHub Actions CI workflow and deployment verification
- [ ] Add screenshots, a short demo and performance/accessibility polish
- [ ] Consider OCR for scans and optional AI-assisted search after core reliability improves

## Project scope and privacy

The project is a learning and portfolio application, not a production inventory management system. Location results should be verified against the source PDF. The current features do not perform AI-assisted search. The live deployment may lag behind the latest local code until Vercel finishes deploying the corresponding Git commit.

## Author

**Fouad Faraj** · [GitHub](https://github.com/FFaraj2004)

Built from firsthand retail merchandising experience and developed as a software engineering portfolio project.
