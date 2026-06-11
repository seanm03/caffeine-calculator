/**
 * CSV Export Utility — Converts caffeine log entries to downloadable CSV.
 */

import type { CaffeineLogEntry } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CSV_HEADERS = [
  'Date',
  'Time',
  'Caffeine (mg)',
  'Drink Name',
  'Brew Method',
  'Coffee Weight (g)',
  'Water Volume (mL)',
  'Notes',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function entryToRow(entry: CaffeineLogEntry): string {
  return [
    formatDate(entry.timestamp),
    formatTime(entry.timestamp),
    String(entry.caffeineMg),
    entry.drinkName ?? '',
    entry.brewMethod ?? '',
    entry.coffeeWeightG != null ? String(entry.coffeeWeightG) : '',
    entry.waterVolumeMl != null ? String(entry.waterVolumeMl) : '',
    entry.notes ?? '',
  ].map(escapeCsv).join(',');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert caffeine log entries to a CSV string.
 *
 * @param entries - Caffeine log entries to export
 * @returns CSV string with headers
 */
export function entriesToCsv(entries: readonly CaffeineLogEntry[]): string {
  const header = CSV_HEADERS.join(',');
  const rows = entries.map(entryToRow);
  return [header, ...rows].join('\n');
}

/**
 * Trigger a file download of the given CSV content.
 *
 * @param csvContent - CSV string to download
 * @param filename - Suggested filename for the download
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export caffeine log entries as a CSV file download.
 *
 * @param entries - Entries to export
 * @param filenamePrefix - Prefix for the filename (default: 'caffeine-log')
 */
export function exportEntriesToCsv(
  entries: readonly CaffeineLogEntry[],
  filenamePrefix: string = 'caffeine-log',
): void {
  const csv = entriesToCsv(entries);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `${filenamePrefix}-${dateStr}.csv`);
}
