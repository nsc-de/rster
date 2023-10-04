import { Extends } from "@rster/util";
import { JsonCompatible, SendMethod, TypeInformation } from "../types";

/**
 * Type for defining a boolean value
 *
 * @typeParam T - The boolean value
 */
export class BooleanTypeInformation<
  T extends true | false
> extends TypeInformation<T> {
  static readonly TRUE = new BooleanTypeInformation(true);
  static readonly FALSE = new BooleanTypeInformation(false);

  constructor(public readonly value: T) {
    super();
  }

  check<U>(value: U) {
    return (typeof value === "boolean" &&
      (value as unknown) === this.value) as Extends<U, T>;
  }

  checkError(value: unknown): string | undefined {
    if (typeof value !== "boolean") {
      return `Not a boolean, but a ${typeof value}`;
    }
    if (value !== this.value) {
      return `Not the boolean ${this.value}, but ${value}`;
    }
    return undefined;
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["body"];
  }

  get identifier(): string {
    return "boolean";
  }

  exportToString(value: T): string {
    return value.toString();
  }

  importFromString(value: string): T {
    return (value === "true" ? true : false) as T;
  }

  exportToJson(value: T): JsonCompatible {
    return value;
  }

  importFromJson(value: JsonCompatible): T {
    return value as T;
  }

  toString() {
    return `BooleanTypeInformation{${this.value}}`;
  }

  json() {
    return {
      type: "boolean",
      value: this.value,
    };
  }
}

/**
 * Type for defining any boolean
 */
export class AnyBooleanTypeInformation extends TypeInformation<boolean> {
  static readonly instance = new AnyBooleanTypeInformation();

  constructor() {
    super();
  }

  check<T>(value: T) {
    return (typeof value === "boolean") as Extends<T, boolean>;
  }

  checkError(value: unknown): string | undefined {
    if (typeof value !== "boolean") {
      return `Not a boolean, but a ${typeof value}`;
    }
    return undefined;
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["param", "body", "query"];
  }

  get identifier(): string {
    return "boolean";
  }

  exportToString(value: boolean): string {
    return value.toString();
  }

  importFromString(value: string): boolean {
    return value === "true";
  }

  exportToJson(value: boolean): JsonCompatible {
    return value;
  }

  importFromJson(value: any): boolean {
    return value;
  }

  toString() {
    return "AnyBooleanTypeInformation{}";
  }

  json() {
    return {
      type: "boolean",
    };
  }
}

/**
 * Type for all the different boolean-ish type information
 */
export type BooleanType =
  | BooleanTypeInformation<true>
  | BooleanTypeInformation<false>
  | AnyBooleanTypeInformation;

/**
 * Create a type information for a specific boolean value
 * @param value - The boolean value
 * @returns A type information for a boolean value
 */
export function boolean<T extends true | false>(
  value: boolean
): BooleanTypeInformation<T>;

/**
 * Create a type information for any boolean value
 * @returns A type information for any boolean value
 */
export function boolean(): AnyBooleanTypeInformation;
export function boolean(
  value?: boolean
): AnyBooleanTypeInformation | BooleanTypeInformation<any> {
  if (value || value === false) {
    return new BooleanTypeInformation(value);
  }
  return AnyBooleanTypeInformation.instance;
}

/**
 * Create a type information true value
 * @returns A type information for a true value
 */
export function trueType(): BooleanTypeInformation<true> {
  return BooleanTypeInformation.TRUE;
}

/**
 * Create a type information false value
 * @returns A type information for a false value
 */
export function falseType(): BooleanTypeInformation<false> {
  return BooleanTypeInformation.FALSE;
}
