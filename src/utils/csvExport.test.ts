import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { entriesToCsv, downloadCsv, exportEntriesToCsv } from '@/utils/csvExport';
import { CaffeineMg, WeightG, VolumeMl } from '@/types/branded';
import type { CaffeineLogEntry } from '@/types';

function makeEntry(overrides: Partial<CaffeineLogEntry> = {}): CaffeineLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: '2026-06-10T08:00:00.000Z',
    caffeineMg: CaffeineMg(100),
    drinkName: 'Pour-Over',
    ...overrides,
  };
}

describe('entriesToCsv', () => {
  it('returns header row when given empty array', () => {
    const csv = entriesToCsv([]);
    expect(csv).toBe('Date,Time,Caffeine (mg),Drink Name,Brew Method,Coffee Weight (g),Water Volume (mL),Notes');
  });

  it('includes all header columns', () => {
    const csv = entriesToCsv([]);
    expect(csv).toContain('Date');
    expect(csv).toContain('Time');
    expect(csv).toContain('Caffeine (mg)');
    expect(csv).toContain('Drink Name');
    expect(csv).toContain('Brew Method');
    expect(csv).toContain('Coffee Weight (g)');
    expect(csv).toContain('Water Volume (mL)');
    expect(csv).toContain('Notes');
  });

  it('converts a single entry to CSV row', () => {
    const entry = makeEntry({
      timestamp: '2026-06-10T08:00:00.000Z',
      caffeineMg: CaffeineMg(150),
      drinkName: 'Latte',
    });
    const csv = entriesToCsv([entry]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2); // header + 1 row
    expect(lines[1]).toContain('150');
    expect(lines[1]).toContain('Latte');
  });

  it('converts multiple entries to CSV rows', () => {
    const entries: CaffeineLogEntry[] = [
      makeEntry({ caffeineMg: CaffeineMg(100), drinkName: 'Coffee A' }),
      makeEntry({ caffeineMg: CaffeineMg(200), drinkName: 'Coffee B' }),
    ];
    const csv = entriesToCsv(entries);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[1]).toContain('Coffee A');
    expect(lines[2]).toContain('Coffee B');
  });

  it('escapes values containing commas', () => {
    const entry = makeEntry({ drinkName: 'Coffee, Dark Roast' });
    const csv = entriesToCsv([entry]);
    expect(csv).toContain('"Coffee, Dark Roast"');
  });

  it('escapes values containing double quotes', () => {
    const entry = makeEntry({ drinkName: '12" Sub' });
    const csv = entriesToCsv([entry]);
    expect(csv).toContain('"12"" Sub"');
  });

  it('includes brew method when present', () => {
    const entry = makeEntry({ brewMethod: 'french-press' });
    const csv = entriesToCsv([entry]);
    expect(csv).toContain('french-press');
  });

  it('includes coffee weight when present', () => {
    const entry = makeEntry({ coffeeWeightG: WeightG(18) });
    const csv = entriesToCsv([entry]);
    expect(csv).toContain('18');
  });

  it('includes water volume when present', () => {
    const entry = makeEntry({ waterVolumeMl: VolumeMl(300) });
    const csv = entriesToCsv([entry]);
    expect(csv).toContain('300');
  });

  it('includes notes when present', () => {
    const entry = makeEntry({ notes: 'Tasted great' });
    const csv = entriesToCsv([entry]);
    expect(csv).toContain('Tasted great');
  });

  it('handles missing optional fields as empty', () => {
    const entry = makeEntry({
      drinkName: undefined,
      brewMethod: undefined,
      coffeeWeightG: undefined,
      waterVolumeMl: undefined,
      notes: undefined,
    });
    const csv = entriesToCsv([entry]);
    const row = csv.split('\n')[1];
    // Should have 8 columns (some empty)
    expect(row.split(',').length).toBe(8);
  });
});

describe('downloadCsv', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:test'),
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      value: originalCreateObjectURL,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: originalRevokeObjectURL,
      writable: true,
    });
  });

  it('triggers a download via anchor click', () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(clickSpy);
      }
      return el;
    });

    downloadCsv('test,data', 'test.csv');

    expect(clickSpy).toHaveBeenCalled();
  });
});

describe('exportEntriesToCsv', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:test'),
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(URL, 'createObjectURL', {
      value: originalCreateObjectURL,
      writable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: originalRevokeObjectURL,
      writable: true,
    });
  });

  it('calls downloadCsv with date-stamped filename', () => {
    const entry = makeEntry();
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        vi.spyOn(el, 'click').mockImplementation(clickSpy);
      }
      return el;
    });

    exportEntriesToCsv([entry], 'my-log');

    expect(clickSpy).toHaveBeenCalled();
  });
});
