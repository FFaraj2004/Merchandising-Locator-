
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
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
  const [previewError, setPreviewError] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);

  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Read an uploaded PDF
  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setPreviewError("");
    setPages([]);
    setSearch("");
    setFileName(file.name);
    setSelectedPage(1);

    try {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Please select a PDF file.");
      }

      if (file.size > 20 * 1024 * 1024) {
        throw new Error("Maximum file size is 20 MB.");
      }

      // Release the previous document
      if (pdfRef.current) {
        await pdfRef.current.loadingTask.destroy();
        pdfRef.current = null;
      }

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

      try {
        const extractedPages: PDFPage[] = [];

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

          extractedPages.push({
            pageNumber: i,
            text: textParts.join(""),
          });
        }

        pdfRef.current = pdf;
        setPages(extractedPages);
      } catch (err) {
        await loadingTask.destroy();
        throw err;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  // Extract all structured products
  const products = useMemo(
    () =>
      pages.flatMap((page) =>
        parseProductRows(page.text, page.pageNumber)
      ),
    [pages]
  );

  const query = search.trim().toLowerCase();

  // Search products by item number or description
  const matchingProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.itemNumber.includes(query) ||
          product.description.toLowerCase().includes(query)
      ),
    [products, query]
  );

  // Fallback: search the original PDF text
  const textMatches = useMemo(
    () =>
      query
        ? pages.flatMap((page) => {
            const index = page.text.toLowerCase().indexOf(query);

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
        : [],
    [pages, query]
  );

  // Render the selected PDF page into a canvas
  useEffect(() => {
    let active = true;
    let cancelRender: (() => void) | undefined;

    async function renderPage() {
      const pdf = pdfRef.current;

      if (!pdf || pages.length === 0) return;

      try {
        const page = await pdf.getPage(selectedPage);

        if (!active) return;

        const viewport = page.getViewport({
          scale: 1.5,
        });

        // Render offscreen to avoid overlapping canvas renders
        const offscreen = document.createElement("canvas");

        offscreen.width = Math.ceil(viewport.width);
        offscreen.height = Math.ceil(viewport.height);

        const task = page.render({
          canvas: offscreen,
          viewport,
        });

        cancelRender = () => task.cancel();

        await task.promise;

        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.width = offscreen.width;
        canvas.height = offscreen.height;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas is unavailable.");
        }

        context.drawImage(offscreen, 0, 0);
      } catch (err) {
        if (active) {
          console.error("PDF preview error:", err);
          setPreviewError("Unable to display this PDF page.");
        }
      }
    }

    void renderPage();

    return () => {
      active = false;
      cancelRender?.();
    };
  }, [selectedPage, pages]);

  function goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > pages.length) return;

    setPreviewError("");
    setSelectedPage(pageNumber);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 lg:h-screen lg:overflow-hidden">
      {/* HEADER */}
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">
              Merchandising Locator
            </h1>

            <p className="text-xs text-slate-500">
              PDF product search workspace
            </p>
          </div>

          <label className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            {loading ? "Processing..." : "Upload PDF"}

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleUpload}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>

        {(fileName || error) && (
          <div className="mx-auto mt-2 max-w-7xl text-xs">
            {fileName && (
              <span className="text-slate-600">
                {fileName} · {pages.length} pages
              </span>
            )}

            {error && (
              <p className="mt-1 text-red-600">{error}</p>
            )}
          </div>
        )}
      </header>

      {/* TWO-PANEL WORKSPACE */}
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-3 overflow-y-auto p-3 lg:min-h-0 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] lg:overflow-hidden">

        {/* LEFT PANEL: SEARCH RESULTS */}
        <section className="flex min-h-[320px] max-h-[480px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:max-h-none lg:min-h-0">

          <div className="shrink-0 border-b border-slate-200 p-4">
            <h2 className="mb-3 text-sm font-semibold">
              Product Search
            </h2>

            <input
              type="search"
              placeholder="Search item number or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={pages.length === 0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              {matchingProducts.length} products shown
              {" · "}
              {products.length} extracted
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {pages.length === 0 && (
              <p className="p-4 text-center text-sm text-slate-500">
                Upload a PDF to get started.
              </p>
            )}

            {pages.length > 0 &&
              matchingProducts.map((product, index) => (
                <button
                  type="button"
                  key={`${product.sourcePage}-${product.itemNumber}-${index}`}
                  onClick={() => goToPage(product.sourcePage)}
                  className={`w-full rounded-lg border p-3 text-left transition hover:border-blue-400 ${
                    selectedPage === product.sourcePage
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold">
                        {product.description}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Item #{product.itemNumber}
                      </p>
                    </div>

                    <span className="rounded bg-slate-100 px-2 py-1 text-xs">
                      Page {product.sourcePage}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-4 text-xs">
                    <span>Bay: <b>{product.bay}</b></span>
                    <span>Position: <b>{product.position}</b></span>
                  </div>
                </button>
              ))}

            {pages.length > 0 &&
              query &&
              matchingProducts.length === 0 && (
                <div>
                  <p className="mb-2 text-sm text-slate-500">
                    No structured product matches.
                  </p>

                  {textMatches.length > 0 && (
                    <h3 className="mb-2 text-sm font-semibold">
                      PDF text matches
                    </h3>
                  )}

                  {textMatches.map((match) => (
                    <button
                      type="button"
                      key={match.pageNumber}
                      onClick={() => goToPage(match.pageNumber)}
                      className="mb-2 w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
                    >
                      <p className="mb-1 text-sm font-semibold">
                        Page {match.pageNumber}
                      </p>

                      <p className="break-words text-xs text-slate-600">
                        ...{match.snippet}...
                      </p>
                    </button>
                  ))}

                  {textMatches.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No matching text found.
                    </p>
                  )}
                </div>
              )}

            {pages.length > 0 &&
              !query &&
              products.length === 0 && (
                <p className="text-sm text-slate-500">
                  No structured products detected.
                  Try searching the original PDF text.
                </p>
              )}
          </div>
        </section>

        {/* RIGHT PANEL: ORIGINAL PDF */}
        <section className="flex min-h-[450px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:min-h-0">

          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 p-3">
            <h2 className="text-sm font-semibold">
              Source PDF
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedPage <= 1 || pages.length === 0}
                onClick={() => goToPage(selectedPage - 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-30"
              >
                Prev
              </button>

              <span className="text-xs text-slate-600">
                {pages.length > 0 ? selectedPage : 0}
                {" / "}
                {pages.length}
              </span>

              <button
                type="button"
                disabled={
                  pages.length === 0 ||
                  selectedPage >= pages.length
                }
                onClick={() => goToPage(selectedPage + 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto bg-slate-200 p-3">
            {pages.length === 0 ? (
              <div className="flex h-full min-h-60 items-center justify-center text-sm text-slate-500">
                Upload a PDF to see its pages here.
              </div>
            ) : (
              <div className="mx-auto w-fit bg-white shadow-md">
                <canvas
                  ref={canvasRef}
                  className="block h-auto max-w-full"
                />
              </div>
            )}

            {previewError && (
              <p className="mt-3 text-center text-sm text-red-600">
                {previewError}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
