
"use client";

import { useState, type ChangeEvent } from "react";

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
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          
const reader = page.streamTextContent().getReader();

const textParts: string[] = [];

try {
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    for (const item of value.items) {
      
if ("str" in item) {
  textParts.push(item.str);
  textParts.push(item.hasEOL ? "\n" : " ");
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
      setError(
        err instanceof Error
          ? err.message
          : "Unable to read PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  const query = search.trim().toLowerCase();

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

        return [{
          pageNumber: page.pageNumber,
          snippet: page.text.slice(start, end),
        }];
      })
    : [];

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-2 text-3xl font-bold">
          Merchandising PDF Search
        </h1>

        <p className="mb-6 text-gray-600">
          Upload a merchandising document and
          search its contents.
        </p>

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

            <input
              type="text"
              placeholder="Search item number or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-white p-4"
            />

            <h2 className="mb-4 mt-6 text-xl font-bold">
              Matching Pages: {results.length}
            </h2>

            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.pageNumber}
                  className="rounded-lg bg-white p-5 shadow"
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
              <p className="text-gray-500">
                No matches found in this PDF.
              </p>
            )}

            {!query && (
              <p className="text-gray-500">
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
