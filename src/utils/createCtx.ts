import { createContext, useContext } from 'react';

/**
 * Creates a typed React context with a named consumer hook that provides
 * descriptive error messages when used outside the corresponding provider.
 *
 * @example
 * ```ts
 * const [useMyCtx, MyCtxProvider] = createCtxWithName<MyType>('MyContext');
 * // useMyCtx() — throws with "MyContext must be used within a MyContextProvider"
 * // MyCtxProvider — provider component with displayName set
 * ```
 */
export function createCtxWithName<T>(name: string) {
  const Ctx = createContext<T | null>(null);
  Ctx.displayName = name;

  function useCtx(): T {
    const ctx = useContext(Ctx);
    if (ctx === null) {
      throw new Error(`${name} must be used within a ${name}Provider`);
    }
    return ctx;
  }

  return [useCtx, Ctx.Provider] as const;
}
