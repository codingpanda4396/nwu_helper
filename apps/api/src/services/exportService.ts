import { getExportRows, type AnalyticsScope } from "./analyticsService.js";

const header = ["date", "merchant", "coupon", "source", "channel", "exposures", "clicks", "claims", "clickRate"];

export function escapeCsvCell(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(rows: Array<Record<string, unknown>>) {
  return [header.join(","), ...rows.map((row) => header.map((field) => escapeCsvCell(row[field])).join(","))].join("\n");
}

export async function buildAnalyticsCsv(scope: AnalyticsScope) {
  return toCsv(await getExportRows(scope));
}
