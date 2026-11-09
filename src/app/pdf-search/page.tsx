
"use client";

import { useState, type ChangeEvent } from "react";
import { parseProductRows } from "@/lib/parseProductRows";

type PDFPage = {
  pageNumber: number;
  text: string;
};

export default function PDFSearchPage() {
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STEP 1: Upload and process the PDF
  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setPages([]);
    setSearch("");
    setFileName(file.name);

    try {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Please upload a PDF file.");
      }

      if (file.size > 20 * 1024 * 1024) {
        throw new Error("Maximum file size is 20 MB.");
      }

      // Load PDF.js in the browser
      const pdfjs = await import(
        "pdfjs-dist/legacy/build/pdf.mjs"
      );

      pdfjs.GlobalWorkerOptions.workerSrc =
        "/pdf.worker.min.mjs";

      const fileData = new Uint8Array(
        await file.arrayBuffer()
      );

      const loadingTask = pdfjs.getDocument({
        data: fileData,
      });

      const pdf = await loadingTask.promise;
      const extractedPages: PDFPage[] = [];

      try {
        // STEP 2: Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);

          const reader = page
            .streamTextContent()
            .getReader();

          const textParts: string[] = [];

          try {
            while (true) {
              const { done, value } =
                await reader.read();

              if (done) break;

              for (const item of value.items) {
                if ("str" in item) {
                  textParts.push(item.str);
                  textParts.push(
                    item.hasEOL ? "\n" : " "
                  );
                }
              }
            }
          } finally {
            reader.releaseLock();
          }

          const text = textParts.join("");

          extractedPages.push({
            pageNumber: i,
            text,
          });
        }
      } finally {
        await loadingTask.destroy();
      }

      setPages(extractedPages);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to read PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  // STEP 3: Process the user's search
  const query = search.trim().toLowerCase();

  // Original PDF text search
  const results = query
    ? pages.flatMap((page) => {
        const index = page.text
          .toLowerCase()
          .indexOf(query);

        if (index === -1) return [];

        const start = Math.max(0, index - 60);
        const end = Math.min(
          page.text.length,
          index + query.length + 100
        );

        return [
          {
            pageNumber: page.pageNumber,
            snippet: page.text.slice(start, end),
          },
        ];
      })
    : [];

  // STEP 4: Extract structured product records
  const extractedProducts = pages.flatMap((page) =>
    parseProductRows(page.text, page.pageNumber)
  );

  // STEP 5: Search extracted products
  const matchingProducts = extractedProducts.filter(
    (product) =>
      product.itemNumber.includes(query) ||
      product.description
        .toLowerCase()
        .includes(query)
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-2 text-3xl font-bold">
          Merchandising PDF Search
        </h1>

        <p className="mb-6 text-gray-600">
          Upload a merchandising document and
          automatically find product information.
        </p>

        {/* PDF UPLOAD */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-3 text-lg font-semibold">
            Upload Document
          </h2>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleUpload}
            disabled={loading}
          />

          {loading && (
            <p className="mt-3 text-blue-600">
              Processing PDF...
            </p>
          )}

          {error && (
            <p className="mt-3 text-red-600">
              {error}
            </p>
          )}

          {pages.length > 0 && (
            <p className="mt-3 text-green-700">
              {fileName} loaded successfully!
              {" "}({pages.length} pages)
            </p>
          )}
        </div>

        {pages.length > 0 && (
          <div className="mt-6">

            {/* SEARCH BAR */}
            <input
              type="text"
              placeholder="Search item number or product..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-4"
            />

            {/* STRUCTURED PRODUCT RESULTS */}
            <h2 className="mb-4 mt-6 text-xl font-bold">
              Extracted Products ({extractedProducts.length})
            </h2>

            <div className="mb-6 space-y-3">
              {(query
                ? matchingProducts
                : extractedProducts
              ).map((product, index) => (
                <div
                  key={`${product.sourcePage}-${product.itemNumber}-${index}`}
                  className="rounded-lg bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">
                    {product.description}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Item Number: {product.itemNumber}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <span>
                      <strong>Bay:</strong>{" "}
                      {product.bay}
                    </span>

                    <span>
                      <strong>Position:</strong>{" "}
                      {product.position}
                    </span>

                    <span>
                      <strong>PDF Page:</strong>{" "}
                      {product.sourcePage}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {query && matchingProducts.length === 0 && (
              <p className="mb-6 text-gray-500">
                No matching structured products found.
              </p>
            )}

            {/* ORIGINAL PDF TEXT RESULTS */}
            <h2 className="mb-4 mt-8 text-xl font-bold">
              Matching PDF Pages ({results.length})
            </h2>

            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.pageNumber}
                  className="rounded-lg bg-white p-5 shadow-sm"
                >
                  <h3 className="font-bold">
                    Page {result.pageNumber}
                  </h3>

                  <p className="mt-2 break-words text-sm text-gray-600">
                    ...{result.snippet}...
                  </p>
                </div>
              ))}
            </div>

            {query && results.length === 0 && (
              <p className="mt-4 text-gray-500">
                No matching text found in this PDF.
              </p>
            )}

            {!query && (
              <p className="mt-4 text-gray-500">
                Enter a product name or item number
                to search the document.
              </p>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
