/**
 * Type augmentation for vitest-axe matchers on the imported `expect` function.
 *
 * vitest-axe/extend-expect augments Vi.Assertion (global namespace), but this
 * doesn't flow through to `expect` imported explicitly from `vitest` in non-test
 * helper files. This declaration adds the matcher directly.
 */
import 'vitest';

/* Augment vitest's Assertion interface with the toHaveNoViolations matcher. */
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<_T> {
    toHaveNoViolations(): void;
  }
}
