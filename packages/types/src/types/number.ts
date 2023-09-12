import { JsonCompatible, SendMethod, TypeInformation } from "../types";

/**
 * Type for defining a specific number to be sent. Will not accept any other number.
 *
 * @typeParam T - The number to be sent
 */
export class NumberTypeInformation<
  T extends number
> extends TypeInformation<T> {
  constructor(public readonly value: T) {
    super();
  }

  check(value: any): value is T {
    return typeof value === "number" && value === this.value;
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["param", "body", "query"];
  }
  get type(): T {
    return this.value;
  }
  get identifier(): string {
    return "number";
  }
  exportToString(value: T): string {
    return value.toString();
  }
  importFromString(value: string): T {
    return Number(value) as T;
  }
  exportToJson(value: T): JsonCompatible {
    return value;
  }
  importFromJson(value: JsonCompatible): T {
    return value as T;
  }

  toString() {
    return `NumberTypeInformation{${this.value}}`;
  }

  json() {
    return {
      type: "number",
      value: this.value,
    };
  }
}

/**
 * Type for defining a range of numbers to be sent. Will not accept any other number.
 *
 * @typeParam MIN - Minimum number
 * @typeParam MAX - Maximum number
 */
export class NumberRangeTypeInformation<
  MIN extends number,
  MAX extends number
> extends TypeInformation<IntRange<MIN, MAX>> {
  constructor(public readonly min: MIN, public readonly max: MAX) {
    super();
  }

  check(value: any): value is IntRange<MIN, MAX> {
    return typeof value === "number" && this.includes(value);
  }

  includes(value: number) {
    return value >= this.min && value <= this.max;
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["param", "body", "query"];
  }

  get type(): IntRange<MIN, MAX> {
    return this.min as any;
  }

  get identifier(): string {
    return "number";
  }

  exportToString(value: IntRange<MIN, MAX>): string {
    return (value as number).toString();
  }

  importFromString(value: string): IntRange<MIN, MAX> {
    return Number(value) as IntRange<MIN, MAX>;
  }

  exportToJson(value: IntRange<MIN, MAX>): JsonCompatible {
    return value;
  }

  importFromJson(value: JsonCompatible): IntRange<MIN, MAX> {
    return value as IntRange<MIN, MAX>;
  }

  toString() {
    return `NumberRangeTypeInformation{${this.min}, ${this.max}}`;
  }

  json() {
    return {
      type: "number",
      min: this.min,
      max: this.max,
    };
  }
}

/**
 * Type for defining any number
 */
export class AnyNumberTypeInformation extends TypeInformation<number> {
  static readonly instance = new AnyNumberTypeInformation();

  constructor() {
    super();
  }

  check(value: any): value is number {
    return typeof value === "number";
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["param", "body", "query"];
  }

  get type(): number {
    return 0;
  }

  get identifier(): string {
    return "number";
  }

  exportToString(value: number): string {
    return value.toString();
  }

  importFromString(value: string): number {
    return Number(value);
  }

  exportToJson(value: number): JsonCompatible {
    return value;
  }

  importFromJson(value: any): number {
    return value;
  }

  toString() {
    return "AnyNumberTypeInformation{}";
  }

  json() {
    return {
      type: "number",
    };
  }
}

/**
 * Type for all the different number-ish type information
 */
export type NumberType =
  | NumberTypeInformation<number>
  | AnyNumberTypeInformation
  | NumberRangeTypeInformation<number, number>;

/**
 * Create a type information for any number
 * @returns A type information for any number
 */
export function number(): AnyNumberTypeInformation;

/**
 * Create a type information for a specific number
 * @param value - The number that is allowed
 * @returns A type information for a specific number
 */
export function number<T extends number>(value: T): NumberTypeInformation<T>;

/**
 * Create a type information for a range of numbers
 * @param min - The minimum number that is allowed
 * @param max - The maximum number that is allowed
 * @returns A type information for a range of numbers
 */
export function number<MIN extends number, MAX extends number>(
  min: MIN,
  max: MAX
): NumberRangeTypeInformation<MIN, MAX>;

export function number(
  value?: number,
  max?: number
): AnyNumberTypeInformation | NumberTypeInformation<any> {
  if (value || value === 0) {
    if (max || max === 0) {
      return new NumberRangeTypeInformation(value, max);
    }
    return new NumberTypeInformation(value);
  }
  return AnyNumberTypeInformation.instance;
}

/**
 * Create a type information for a range of numbers
 * @param min - The minimum number that is allowed
 * @param max - The maximum number that is allowed
 * @returns A type information for a range of numbers
 */
export function numberRange<MIN extends number, MAX extends number>(
  min: MIN,
  max: MAX
): NumberRangeTypeInformation<MIN, MAX> {
  return new NumberRangeTypeInformation(min, max);
}

/**
 * Type for enumerating numbers (used to create a range of numbers)
 *
 * @typeParam N - Number of elements to enumerate
 * @typeParam Acc - Accumulator (used internally)
 */
export type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

/**
 * Type for creating a range of numbers (from MIN to MAX)
 *
 * @typeParam MIN - Minimum number
 * @typeParam MAX - Maximum number
 */
export type IntRange<MIN extends number, MAX extends number> = Exclude<
  Enumerate<MAX>,
  Enumerate<MIN>
>;
