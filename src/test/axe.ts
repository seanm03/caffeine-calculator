/**
 * axe — Shared accessibility test helpers powered by vitest-axe.
 *
 * Exports a pre-configured `axe` instance and a convenience function
 * for scanning a rendered container with sensible defaults.
 *
 * Usage:
 *
 * ```typescript
 * import { render } from '@testing-library/react';
 * import { assertA11y } from '@/test/axe';
 *
 * it('has no violations', async () => {
 *   const { container } = render(<MyComponent />);
 *   await assertA11y(container);
 * });
 * ```
 */

import { expect } from 'vitest';
import { axe } from 'vitest-axe';

/**
 * Assert that the given container has no axe-core accessibility violations.
 *
 * @param container - DOM element (usually `container` from render()) or a
 *   CSS selector string. Pass the rendered `container` to run checks on the
 *   entire output, or a specific element to scope the audit.
 */
export async function assertA11y(container: HTMLElement): Promise<void> {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

/**
 * Assert that the given container has no violations, scoped to specific
 * axe rules. Use this to exclude known, intentional issues.
 *
 * @param container - DOM element to test
 * @param rules - axe rule IDs to exclude (e.g., ['color-contrast'])
 */
export async function assertA11yWithRules(
  container: HTMLElement,
  rules: string[],
): Promise<void> {
  const results = await axe(container, {
    rules: Object.fromEntries(rules.map((id) => [id, { enabled: false }])),
  });
  expect(results).toHaveNoViolations();
}
