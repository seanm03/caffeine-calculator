import { useState, useMemo, useEffect, useCallback } from 'react';
import brandData from '@/data/brandData';
import { DAILY_SAFE_LIMIT_MG } from '@/engine/constants';
import { useCaffeineLog } from '@/hooks/useCaffeineLog';
import { CaffeineMg } from '@/types/branded';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'brand' | 'name' | 'caffeineMg' | 'volumeMl';
type SortDir = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pctDaily(caffeineMg: number): number {
  return Math.round((caffeineMg / DAILY_SAFE_LIMIT_MG) * 100);
}

// ---------------------------------------------------------------------------
// Column header sub-component (declared at module level per lint rules)
// ---------------------------------------------------------------------------

interface SortableThProps {
  sort: SortKey;
  label: string;
  currentSort: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortableTh({ sort, label, currentSort, sortDir, onSort }: SortableThProps) {
  const getSortAria = (): 'none' | 'ascending' | 'descending' => {
    if (currentSort !== sort) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  const indicator = currentSort === sort ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort(sort);
    }
  };

  return (
    <th
      scope="col"
      className="px-4 py-3 text-left text-xs font-semibold text-coffee-600 dark:text-coffee-200
                 uppercase tracking-wider cursor-pointer select-none
                 hover:text-coffee-800 dark:hover:text-coffee-100 transition-colors"
      aria-sort={getSortAria()}
      onClick={() => onSort(sort)}
      tabIndex={0}
      onKeyDown={handleKey}
    >
      {label}
      <span className="text-coffee-400" aria-hidden="true">
        {indicator}
      </span>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BrandReference() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('caffeineMg');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [quickLogFeedback, setQuickLogFeedback] = useState<string | null>(null);

  const { addEntry } = useCaffeineLog();

  const handleQuickLog = useCallback(
    (drinkName: string, caffeineMg: number, brand: string) => {
      addEntry({
        timestamp: new Date().toISOString(),
        caffeineMg: CaffeineMg(caffeineMg),
        drinkName: `${brand} ${drinkName}`,
      });
      setQuickLogFeedback(`${brand} ${drinkName}`);
      setTimeout(() => setQuickLogFeedback(null), 2000);
    },
    [addEntry],
  );

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter and sort
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();

    const results = q
      ? brandData.filter(
          (d) =>
            d.brand.toLowerCase().includes(q) ||
            d.name.toLowerCase().includes(q) ||
            d.size.toLowerCase().includes(q),
        )
      : [...brandData];

    results.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'brand') {
        cmp = a.brand.localeCompare(b.brand);
      } else if (sortKey === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = a[sortKey] - b[sortKey];
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return results;
  }, [debouncedSearch, sortKey, sortDir]);

  // Sort toggle
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
    },
    [sortKey],
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="brand-search" className="sr-only">
          Search drinks
        </label>
        <input
          id="brand-search"
          type="text"
          placeholder="Search by brand, drink name, or size..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-coffee dark:bg-coffee-800 dark:border-coffee-700 dark:text-coffee-100
                     dark:placeholder-coffee-500 w-full min-h-[44px] text-base"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-coffee-400 dark:text-coffee-400 text-lg">
            No drinks match your search
          </p>
        </div>
      )}

      {/* Quick-log feedback */}
      {quickLogFeedback && (
        <div className="text-center text-xs text-green-600 dark:text-green-400 animate-fadeIn">
          ✓ Logged: {quickLogFeedback}
        </div>
      )}

      {/* Desktop table (md+) */}
      {filtered.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-coffee-200 dark:border-coffee-700">
            <table className="w-full text-sm" aria-label="Brand caffeine reference">
              <thead className="bg-coffee-50 dark:bg-coffee-900/70">
                <tr>
                  <SortableTh sort="brand" label="Brand" currentSort={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableTh sort="name" label="Drink" currentSort={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-coffee-600
                               dark:text-coffee-200 uppercase tracking-wider"
                  >
                    Size
                  </th>
                  <SortableTh sort="caffeineMg" label="Caffeine (mg)" currentSort={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortableTh sort="volumeMl" label="Volume (mL)" currentSort={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-coffee-600
                               dark:text-coffee-200 uppercase tracking-wider"
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-coffee-600
                               dark:text-coffee-200 uppercase tracking-wider"
                  >
                    % Daily
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-semibold text-coffee-600
                               dark:text-coffee-200 uppercase tracking-wider"
                  >
                    Log
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100 dark:divide-coffee-800">
                {filtered.map((d) => (
                  <tr
                    key={`${d.brand}-${d.name}-${d.size}`}
                    className={`
                      hover:bg-coffee-50 dark:hover:bg-coffee-900/40 transition-colors
                      ${d.caffeineMg > DAILY_SAFE_LIMIT_MG ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-white dark:bg-coffee-800/50'}
                    `}
                  >
                    <td className="px-4 py-3 font-medium text-coffee-800 dark:text-coffee-100">
                      {d.brand}
                    </td>
                    <td className="px-4 py-3 text-coffee-700 dark:text-coffee-200">
                      {d.name}
                    </td>
                    <td className="px-4 py-3 text-coffee-600 dark:text-coffee-200">
                      {d.size}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-coffee-800 dark:text-coffee-100">
                      {d.caffeineMg}
                    </td>
                    <td className="px-4 py-3 text-coffee-600 dark:text-coffee-200">
                      {d.volumeMl}
                    </td>
                    <td className="px-4 py-3 text-xs text-coffee-500 dark:text-coffee-200 max-w-[140px] truncate" title={d.source}>
                      {d.source}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`
                          inline-block px-2 py-0.5 rounded-full text-xs font-medium
                          ${d.caffeineMg > DAILY_SAFE_LIMIT_MG ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-coffee-100 text-coffee-700 dark:bg-coffee-800 dark:text-coffee-200'}
                        `}
                      >
                        {pctDaily(d.caffeineMg)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleQuickLog(d.name, d.caffeineMg, d.brand)}
                        className="text-xs px-2 py-1 rounded bg-coffee-100 dark:bg-coffee-800
                                   text-coffee-600 dark:text-coffee-300
                                   hover:bg-coffee-200 dark:hover:bg-coffee-700
                                   transition-colors"
                        title={`Log ${d.brand} ${d.name} (${d.size})`}
                      >
                        + Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list (< md) */}
          <div className="md:hidden space-y-3">
            {filtered.map((d) => (
              <div
                key={`${d.brand}-${d.name}-${d.size}`}
                className={`
                  card p-4 space-y-2
                  ${d.caffeineMg > DAILY_SAFE_LIMIT_MG ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-coffee-800 dark:text-coffee-100">
                      {d.brand}
                    </p>
                    <p className="text-sm text-coffee-600 dark:text-coffee-200">
                      {d.name} &middot; {d.size}
                    </p>
                  </div>
                  <span
                    className={`
                      inline-block px-2 py-0.5 rounded-full text-xs font-medium
                      ${d.caffeineMg > DAILY_SAFE_LIMIT_MG ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-coffee-100 text-coffee-700 dark:bg-coffee-800 dark:text-coffee-200'}
                    `}
                  >
                    {pctDaily(d.caffeineMg)}%
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="tabular-nums font-bold text-coffee-800 dark:text-coffee-100">
                    {d.caffeineMg} mg
                  </span>
                  <span className="text-coffee-500 dark:text-coffee-200">
                    {d.volumeMl} mL
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-coffee-400 dark:text-coffee-300">
                    Source: {d.source}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleQuickLog(d.name, d.caffeineMg, d.brand)}
                    className="text-xs px-2 py-1 rounded bg-coffee-100 dark:bg-coffee-800
                               text-coffee-600 dark:text-coffee-300
                               hover:bg-coffee-200 dark:hover:bg-coffee-700
                               transition-colors"
                    title={`Log ${d.brand} ${d.name} (${d.size})`}
                  >
                    + Log
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Result count */}
          <p className="text-xs text-coffee-400 dark:text-coffee-400 text-center">
            Showing {filtered.length} of {brandData.length} drinks
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </p>
        </>
      )}
    </div>
  );
}
