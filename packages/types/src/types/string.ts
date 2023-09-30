import { Extends, JsonCompatible, SendMethod, TypeInformation } from "../types";

/**
 * Type for defining a specific string to be sent. Will not accept any other string.
 *
 * @typeParam T - The string to be sent
 */
export class StringTypeInformation<
  T extends string
> extends TypeInformation<T> {
  constructor(public readonly value: T) {
    super();
  }
  check<U>(value: U) {
    return (typeof value === "string" &&
      (value as unknown) === this.value) as Extends<U, T>;
  }

  checkError(value: unknown): string | undefined {
    if (typeof value !== "string") {
      return `Not a string, but a ${typeof value}`;
    }
    if (value !== this.value) {
      return `Not the string ${this.value}, but ${value}`;
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
    return "string";
  }

  exportToString(value: T): string {
    return value;
  }

  importFromString(value: string): T {
    return value as T;
  }

  exportToJson(value: T): JsonCompatible {
    return value;
  }

  importFromJson(value: JsonCompatible): T {
    return value as T;
  }

  toString() {
    return `StringTypeInformation{${this.value}}`;
  }

  json() {
    return {
      type: "string",
      value: this.value,
    };
  }
}

/**
 * Type for defining any string
 */
export class AnyStringTypeInformation extends TypeInformation<string> {
  static readonly instance = new AnyStringTypeInformation();

  constructor() {
    super();
  }

  check<T>(value: T): Extends<T, string> {
    return (typeof value === "string") as Extends<T, string>;
  }

  checkError(value: unknown): string | undefined {
    if (typeof value !== "string") {
      return `Not a string, but a ${typeof value}`;
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
    return "string";
  }

  exportToString(value: string): string {
    return value;
  }

  importFromString(value: string): string {
    return value;
  }

  exportToJson(value: string): JsonCompatible {
    return value;
  }

  importFromJson(value: JsonCompatible): string {
    return value as string;
  }

  toString() {
    return "AnyStringTypeInformation{}";
  }

  json() {
    return {
      type: "string",
    };
  }
}

/**
 * Type for all the different string-ish type information
 */
export type StringType =
  | StringTypeInformation<string>
  | AnyStringTypeInformation;

/**
 * Create a type information for any string
 * @returns A type information for any string
 */
export function string(): AnyStringTypeInformation;

/**
 * Create a type information for a specific string
 * @param value - The string that is allowed
 * @returns A type information for a specific string
 */
export function string<T extends string>(value: T): StringTypeInformation<T>;
export function string(
  value?: string
): AnyStringTypeInformation | StringTypeInformation<string> {
  if (value || value === "") {
    return new StringTypeInformation(value);
  }
  return AnyStringTypeInformation.instance;
}
