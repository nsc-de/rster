/**
 * @fileoverview Utility types for TypeScript
 */

/**
 * Utility type to deep map all object properties to a given type.
 *
 * @example
 * ```ts
 * type Foo = {
 *   a: {
 *     b: {
 *       c: string;
 *     };
 *     d: number;
 *   };
 * };
 *
 * type Bar = DeepMap<Foo, number>;
 *
 * // Bar = {
 * //   a: {
 * //     b: {
 * //       c: number;
 * //     };
 * //     d: number;
 * //   };
 * // };
 * ```
 */
export type DeepMap<T, U> = {
  [P in keyof T]: T[P] extends object ? DeepMap<T[P], U> : U;
};

/**
 * Utility type to deep map all object properties to a given type, but
 * optionally.
 * @example
 * ```ts
 * type Foo = {
 *   a: {
 *     b: {
 *       c: string;
 *     };
 *     d: number;
 *   };
 * };
 *
 * type Bar = DeepMap<Foo, number>;
 *
 * // Bar = {
 * //   a?: {
 * //     b?: {
 * //       c?: number;
 * //     };
 * //     d?: number;
 * //   };
 * // };
 * ```
 */
export type DeepMapOptional<T, U> = {
  [P in keyof T]?: T[P] extends object ? DeepMap<T[P], U> : U;
};

/**
 * Utility type shifting the first parameter of a function.
 * @example
 * ```ts
 * type Foo = (a: string, b: number) => void;
 * type Bar = Shift<Foo>;
 * // Bar = (b: number) => void;
 * ```
 */
export type Shift<T extends any[]> = ((...args: T) => void) extends (
  arg: any,
  ...rest: infer U
) => void
  ? U
  : never;

/**
 * Utility type shifting the first this parameter of a function.
 * @example
 * ```ts
 * type Foo = (this: string, a: string, b: number) => void;
 * type Bar = ShiftThis<Foo>;
 * // Bar = (this: string, a: string, b: number) => void;
 * ```
 */
export type RemoveThisParam<T> = T extends (
  this: any,
  ...args: infer Args
) => infer R
  ? (...args: Args) => R
  : T;

/**
 * Utility type to make all properties of an object optional.
 *
 * @example
 * ```ts
 * type Foo = {
 *   a: string;
 *   b: number;
 * };
 *
 * type Bar = AllOptional<Foo>;
 * // Bar = {
 * //   a?: string;
 * //   b?: number;
 * // };
 * ```
 */
export type AllOptional<TYPE extends object> = {
  [key in keyof TYPE]?: TYPE[key];
};
