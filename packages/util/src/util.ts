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

/**
 * A type utility to create a substring of a string.
 */
export type SubString<
  T extends string,
  U extends string
> = T extends `${U}${infer R}` ? R : never;

/**
 * A type for a map containing all numbers as keys (as strings) and their number equivalent as values. Used for converting strings to numbers.
 */
export type MapNumberKeysToString<T extends { [key: number]: typeof key }> = {
  [key in keyof T & number as `${key}`]: T[key];
};

/**
 * A type utility to convert a string to its number equivalent
 */
export type StringToNumberHelper = MapNumberKeysToString<{
  [key: number]: typeof key;
}>;

/**
 * A type utility t oconvert a string to its number equivalent
 */
export type StringToNumber<T extends string> =
  T extends keyof StringToNumberHelper ? StringToNumberHelper[T] : never;

/**
 * A type to convert an array of objects with the key 'K' property to an object with the key 'K' property.
 * This is used to help typescript infer the type of the object when using the `ArrayFinder` function.
 *
 * @typeparam T - The type of elements in the array.
 * @typeparam K - The key of the property to be used as the key for accessing elements in the array.
 */
export type ArrayToObject<T, K extends keyof T> = {
  [P in T[K] as string]: Extract<T, Record<K, P>>;
};

/**
 * A type to Remove the `never` type from a union.
 */
export type NoNever<TYPE, ALTERNATIVE> = TYPE extends never
  ? ALTERNATIVE
  : TYPE;

/**
 * Creates a proxy object that allows accessing elements in the array using a specified property as the key.
 *
 * @typeparam T - The type of elements in the array.
 * @typeparam K - The key of the property to be used as the key for accessing elements in the array.
 * @param array - The array of elements.
 * @param property - The property to be used as the key for accessing elements in the array.
 * @returns A proxy object with keys based on the specified property and values of type `T`.
 */
export function ArrayFinder<T, K extends keyof T>(
  array: T[],
  property: K
): ArrayToObject<T, K> {
  const result: any = {};
  for (const item of array) {
    result[item[property] as string] = item;
  }
  return result;
}

/**
 * Converts an Object's type to it's value type.
 */
export type Value<T extends Record<string, any>> = T[keyof T];

/**
 * Converts an Object's type to an array of it's value types.
 */
export type Values<T extends Record<string, any>> = Value<T>[];

/**
 * Converts an Object's type to it's key type.
 */
export type AllowVoidIfUndefined<T> = T extends undefined ? void | T : T;

/**
 * Force typescript to infer a type as a specific type.
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * Type utility for converting a type to not include undefined
 */
export type NoUndefined<TYPE, ALTERNATIVE> = TYPE extends undefined
  ? ALTERNATIVE
  : TYPE;

/**
 * Type utility for converting a type to not include null
 */
export type Extends<TYPE, EXTENDS> = TYPE extends EXTENDS ? true : false;
