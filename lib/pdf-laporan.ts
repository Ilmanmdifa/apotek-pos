import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";

export interface LaporanPdfRow {
  notaNo: string;
  tanggal: string;
  itemCount: number;
  payMethod: string;
  total: number;
  isReturned: boolean;
}

export interface LaporanPdfData {
  kop: string;
  nomor: string;
  periode: string;
  omzet: number;
  struk: number;
  laba: number;
  retur: number;
  rows: LaporanPdfRow[];
}

const W = 842;
const H = 595;
const MARGIN = 40;
const CONTENT_W = W - MARGIN * 2;

const INK = rgb(0.09, 0.11, 0.15);
const GRAY = rgb(0.4, 0.44, 0.5);
const ZEBRA = rgb(0.965, 0.976, 0.988);
const HEAD_FILL = rgb(0.898, 0.925, 0.957);
const RULE = rgb(0.79, 0.83, 0.89);

const idr = (n: number): string =>
  "Rp" + new Intl.NumberFormat("id-ID").format(Math.round(n));

function safe(text: string): string {
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

function right(
  page: PDFPage,
  font: PDFFont,
  text: string,
  rightX: number,
  y: number,
  size: number,
  extra?: { font?: PDFFont; color?: RGB },
): void {
  const w = font.widthOfTextAtSize(safe(text), size);
  page.drawText(safe(text), {
    x: rightX - w,
    y,
    size,
    font: extra?.font ?? font,
    color: extra?.color ?? INK,
  });
}

export async function buildLaporanPdf(data: LaporanPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const printedAt = new Date();
  const printedLabel = `Dicetak ${printedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} ${printedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;

  let page = doc.addPage([W, H]);
  let y = H - MARGIN;

  const rule = () => {
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: W - MARGIN, y },
      thickness: 0.75,
      color: RULE,
    });
    y -= 12;
  };

  // Kop
  page.drawText(safe(data.kop), { x: MARGIN, y, size: 17, font: bold, color: INK });
  right(page, font, `No. ${data.nomor}`, W - MARGIN, y + 2, 9, { color: GRAY });
  y -= 16;
  page.drawText(safe(`Laporan Penjualan — ${data.periode}`), {
    x: MARGIN, y, size: 11, font, color: GRAY,
  });
  y -= 8;
  rule();

  // Ringkasan: 4 kotak
  const cards = [
    { label: "Omzet", value: idr(data.omzet) },
    { label: "Struk", value: String(data.struk) },
    { label: "Laba kotor", value: idr(data.laba) },
    { label: "Retur", value: String(data.retur) },
  ];
  const gap = 10;
  const cardW = (CONTENT_W - gap * 3) / 4;
  const cardH = 40;
  cards.forEach((c, i) => {
    const x = MARGIN + i * (cardW + gap);
    page.drawRectangle({
      x, y: y - cardH + 12, width: cardW, height: cardH,
      borderColor: RULE, borderWidth: 0.75,
    });
    page.drawText(safe(c.label.toUpperCase()), {
      x: x + 8, y: y - 6, size: 7.5, font: bold, color: GRAY,
    });
    page.drawText(safe(c.value), {
      x: x + 8, y: y - 22, size: 12, font: bold, color: INK,
    });
  });
  y -= cardH + 8;

  // Tabel
  const cols: { x: number; label: string; align?: "right"; rightX: number }[] = [
    { x: MARGIN, label: "Nota", rightX: 0 },
    { x: 200, label: "Tanggal", rightX: 0 },
    { x: 330, label: "Item", align: "right", rightX: 360 },
    { x: 380, label: "Bayar", rightX: 0 },
    { x: 480, label: "Status", rightX: 0 },
    { x: 0, label: "Total", align: "right", rightX: W - MARGIN },
  ];

  const drawHead = () => {
    page.drawRectangle({
      x: MARGIN, y: y - 4, width: CONTENT_W, height: 18,
      color: HEAD_FILL,
    });
    cols.forEach((c) => {
      if (c.align === "right") {
        right(page, bold, c.label, c.rightX, y, 9);
      } else {
        page.drawText(c.label, { x: c.x, y, size: 9, font: bold, color: INK });
      }
    });
    y -= 18;
  };

  const newPage = () => {
    page = doc.addPage([W, H]);
    y = H - MARGIN;
  };

  drawHead();
  const rows = data.rows.slice(0, 500);
  rows.forEach((r, idx) => {
    if (y < MARGIN + 60) {
      newPage();
      drawHead();
    }
    if (idx % 2 === 1) {
      page.drawRectangle({
        x: MARGIN, y: y - 3, width: CONTENT_W, height: 14, color: ZEBRA,
      });
    }
    page.drawText(safe(r.notaNo).slice(0, 24), { x: cols[0].x, y, size: 9, font });
    page.drawText(safe(r.tanggal).slice(0, 20), { x: cols[1].x, y, size: 9, font });
    right(page, font, String(r.itemCount), cols[2].rightX, y, 9);
    page.drawText(safe(r.payMethod).slice(0, 12), { x: cols[3].x, y, size: 9, font });
    page.drawText(r.isReturned ? "Retur" : "OK", { x: cols[4].x, y, size: 9, font });
    right(page, font, idr(r.total), cols[5].rightX, y, 9);
    y -= 14;
  });

  // Baris total
  if (y < MARGIN + 60) newPage();
  page.drawLine({
    start: { x: MARGIN, y: y + 6 }, end: { x: W - MARGIN, y: y + 6 },
    thickness: 1, color: INK,
  });
  page.drawText(`TOTAL (${data.struk} struk)`, { x: cols[0].x, y: y - 8, size: 10, font: bold });
  right(page, bold, idr(data.omzet), W - MARGIN, y - 8, 10);
  y -= 30;

  // Tanda tangan
  if (y < MARGIN + 70) newPage();
  const sigX = W - MARGIN - 220;
  page.drawText(printedLabel, { x: sigX, y, size: 9, font, color: GRAY });
  y -= 14;
  page.drawText("Mengetahui,", { x: sigX, y, size: 9, font });
  y -= 12;
  page.drawText("Apoteker", { x: sigX, y, size: 9, font });
  y -= 42;
  page.drawText("( .................................... )", { x: sigX, y, size: 9, font });

  // Nomor halaman
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const label = `Halaman ${i + 1} dari ${pages.length}`;
    const w = font.widthOfTextAtSize(label, 8);
    p.drawText(label, {
      x: W / 2 - w / 2, y: 22, size: 8, font, color: GRAY,
    });
  });

  return doc.save();
}
