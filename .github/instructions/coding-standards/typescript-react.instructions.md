---
description: "Project-specific TypeScript and React coding conventions for the caffeine-calculator codebase"
applyTo: "**/*.{ts,tsx}"
---

# TypeScript & React Conventions

Project-specific conventions for TypeScript and React development in the caffeine calculator codebase. These extend the general C# and TypeScript guidelines with patterns unique to this project.

## TypeScript Configuration

The project uses strict TypeScript with bundler module resolution:

* `strict: true` — all strict checks enabled
* `noUnusedLocals: true`, `noUnusedParameters: true` — no dead code
* `noFallthroughCasesInSwitch: true` — explicit fallthrough only
* `isolatedModules: true` — compatible with Vite/esbuild
* `moduleResolution: "bundler"` — modern resolution for Vite
* Path alias `@/` maps to `src/` via both `tsconfig.json` and `vite.config.ts`

## Import Convention

All source imports must use the `@/` path alias. No relative imports above the immediate parent directory.

```typescript
// Correct
import { BrewMethod } from '@/types';
import { calculateCaffeine } from '@/engine/caffeineCalculator';
import SegmentedControl from '@/components/SegmentedControl';

// Avoid
import { BrewMethod } from '../../types';
import { calculateCaffeine } from '../engine/caffeineCalculator';
```

Relative imports are acceptable only for sibling files in the same directory.

## Component Patterns

### Functional Components

All components are functional components with explicit TypeScript prop interfaces:

```typescript
export interface ComponentNameProps {
  value: string;
  onChange: (v: string) => void;
  size?: 'sm' | 'md';
}

export default function ComponentName({ value, onChange, size = 'md' }: ComponentNameProps) {
  // ...
}
```

### Props Interfaces

* Props interfaces are exported and suffixed with `Props` (e.g., `CoffeeInputsProps`)
* Optional props use the `?` modifier with sensible defaults via destructuring
* Event handler props follow the `onXxx` naming convention

### Generic Components

Reusable generic components use the `<T extends string>` pattern:

```typescript
export interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}
```

### Class Components

Class components are used only when necessary (e.g., `ErrorBoundary` requires `componentDidCatch`). All other components are functional.

## Hook Patterns

### Naming

All hooks follow the `useXxx` naming convention:
* `useCalculatorState` — state management
* `useUnits` — unit system toggle
* `useTheme` — theme management
* `useHashTab` — URL hash routing
* `useCaffeineLog` — caffeine log persistence

### Context Provider Pattern

Context providers use the `createCtxWithName` utility pattern:

```typescript
const [useMyCtx, MyCtxProvider] = createCtxWithName<MyType>('MyContext');

export function MyProvider({ children }: { children: React.ReactNode }) {
  // state management
  return <MyCtxProvider value={...}>{children}</MyCtxProvider>;
}

export const useMyHook = useMyCtx;
```

### Hook Return Types

* Hooks that are context consumers use the `createCtxWithName` pattern and inherit the context type
* Hook test files use `renderHook` + `act` + `waitFor` from `@testing-library/react`

## Testing Patterns

### File Convention

* Test files live alongside source code: `ComponentName.test.tsx`, `hookName.test.ts`
* Test files use the `.test.ts` or `.test.tsx` extension
* Vitest is the test runner with jsdom environment

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  it('renders expected content', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

### Testing Library Queries

* Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
* Use `screen` methods rather than destructuring from `render()`
* For user interactions, import `fireEvent` or `userEvent` from `@testing-library/react`

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(expectedValue);
  });
});
```

### Provider Wrapping

When testing components that consume context, wrap with the required providers:

```typescript
function renderWithProviders() {
  return render(
    <ThemeProvider>
      <UnitProvider>
        <ComponentUnderTest />
      </UnitProvider>
    </ThemeProvider>
  );
}
```

### Mocking

* Mock browser APIs in `src/test/setup.ts` (matchMedia, localStorage, scrollIntoView)
* Use `vi.fn()` for function mocks
* Use `vi.mock()` for module-level mocking
* localStorage is cleared automatically in `afterEach` via test setup

## Naming Conventions

| Category     | Convention    | Example                          |
|-------------|---------------|----------------------------------|
| Files        | PascalCase    | `CoffeeInputs.tsx`               |
| Hooks        | camelCase     | `useCalculatorState.tsx`         |
| Utilities    | camelCase     | `createCtx.ts`                   |
| Types        | PascalCase    | `BrewMethod`, `CaffeineResult`   |
| Interfaces   | PascalCase    | `BrewingParameters`              |
| Union types  | PascalCase    | `Species`, `RoastLevel`         |
| Constants    | UPPER_SNAKE   | `DAILY_SAFE_LIMIT_MG`           |
| Functions    | camelCase     | `calculateCaffeine`              |
| CSS classes  | Tailwind only | `btn-coffee`, `input-coffee`    |
| localStorage | kebab-case    | `coffee-calc-state`             |

## Styling

* Tailwind CSS exclusively — no separate CSS modules or styled-components
* Custom component classes (`.btn-coffee`, `.input-coffee`, `.card`) defined in `styles/index.css`
* Dark mode via `class` strategy (`.dark` class on `<html>`)
* Custom `coffee` color palette (50–950 scale) with CSS custom properties
* Responsive design: mobile-first with `sm:`, `md:`, `lg:` breakpoints
* Font stack: 'Segoe UI', system-ui, -apple-system, sans-serif

## State Management

* `useCalculatorState` — Context + `useState` pattern, persisted to localStorage with versioning
* `useUnits` — Context for metric/imperial toggle, persisted to localStorage
* `useTheme` — Context for light/dark/auto with OS preference detection
* `useCaffeineLog` — Context for caffeine log entries with localStorage persistence
* `useHashTab` — URL hash-based tab routing (zero-dependency)
* localStorage keys use the `coffee-calc-` prefix

### localStorage Pattern

```typescript
const STORAGE_KEY = 'coffee-calc-state';
const STORAGE_VERSION = 1;

interface PersistedPayload {
  version: number;
  state: MyState;
}

// Read with version check and error handling
function getInitialState(): MyState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const payload = JSON.parse(saved) as PersistedPayload;
      if (payload.version !== STORAGE_VERSION) return getDefaults();
      return { ...getDefaults(), ...payload.state };
    }
  } catch {
    // Ignore parse errors
  }
  return getDefaults();
}

// Write silently on error
function persistState(state: MyState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }));
  } catch {
    // Silently fail on QuotaExceededError
  }
}
```

## Engine Architecture

### Pure Functions

The calculation engine (`src/engine/`) uses pure functions with no side effects:

```typescript
export function calculateCaffeine(params: BrewingParameters): CaffeineResult {
  // Deterministic computation, no mutations, no I/O
}
```

### Scientific Constants

* All constants are documented with inline JSDoc citations
* Source papers referenced with `@see` tags
* Values derived from peer-reviewed literature
* Constants are grouped by domain (species, brew, metabolism)

### Utility Functions

Shared validation helpers in `src/engine/utils.ts`:
* `isValidNumber` — finite number check
* `isValidDate` — valid Date check
* `isValidArray` — non-null array check
* `clampNumber` — range-bounded number with fallback

## File Organization

* Components: `src/components/` — one file per component with co-located tests
* Engine: `src/engine/` — pure calculation functions and constants
* Hooks: `src/hooks/` — React hooks and context providers
* Types: `src/types/` — shared TypeScript interfaces and type aliases
* Utilities: `src/utils/` — generic helpers (context creation, storage detection)
* Data: `src/data/` — static data (brand database)
* Styles: `src/styles/` — Tailwind directives and custom CSS classes
* Test setup: `src/test/setup.ts` — global test configuration
