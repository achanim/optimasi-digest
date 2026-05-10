import type { GeneratePDFOptions, ProcessedReport } from "./types";
import { DiggestProcessor } from "./processor";
import { createDocDefinition } from "./pdf-builder";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loadPdfMake() {
  const pdfMake = ((await import("pdfmake/build/pdfmake")) as any).default;
  const vfs = (await import("pdfmake/build/vfs_fonts")) as any;

  pdfMake.vfs = vfs.default;

  return pdfMake as {
    createPdf: (def: any) => {
      download: (name: string) => void;
      getBlob: (cb: (blob: Blob) => void) => void;
    };
  };
}

async function fetchLogoAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function parseData(data: string | ProcessedReport): ProcessedReport {
  if (typeof data === "string") {
    const raw = JSON.parse(data);
    return DiggestProcessor.processLLMData(raw);
  }
  return data;
}

// ── Main Export ───────────────────────────────────────────────────────────────

/**
 * Generate dan download PDF digest laporan.
 * Berjalan di browser (Next.js client-side / Vue).
 */
export async function generateDigestPDF(
  options: GeneratePDFOptions,
): Promise<void> {
  const { data, logoUrl, fileName = "Laporan_Digest.pdf" } = options;

  const reportData = parseData(data);
  const validation = DiggestProcessor.validateData(reportData);
  if (!validation.valid) {
    throw new Error(`Data tidak valid:\n${validation.errors.join("\n")}`);
  }

  const logoBase64 = logoUrl ? await fetchLogoAsBase64(logoUrl) : undefined;
  const pdfMake = await loadPdfMake(); // ← pakai helper

  const docDefinition = createDocDefinition(reportData, logoBase64);
  pdfMake.createPdf(docDefinition).download(fileName);
}

/**
 * Ambil blob PDF — berguna kalau mau upload ke server, bukan download langsung.
 */

export async function getDigestPDFBlob(
  options: Omit<GeneratePDFOptions, "fileName">,
): Promise<Blob> {
  const { data, logoUrl } = options;

  const reportData = parseData(data);
  const validation = DiggestProcessor.validateData(reportData);
  if (!validation.valid) {
    throw new Error(`Data tidak valid:\n${validation.errors.join("\n")}`);
  }

  const logoBase64 = logoUrl ? await fetchLogoAsBase64(logoUrl) : undefined;
  const pdfMake = await loadPdfMake(); // ← pakai helper

  const docDefinition = createDocDefinition(reportData, logoBase64);

  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob(resolve);
  });
}

// Re-export semua yang mungkin berguna
export { DiggestProcessor } from "./processor";
export { createDocDefinition } from "./pdf-builder";
export type * from "./types";
