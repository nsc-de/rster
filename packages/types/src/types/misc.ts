import { JsonCompatible, SendMethod, TypeInformation } from "../types";

/**
 * Type for defining a null value
 */
export class NullTypeInformation extends TypeInformation<null> {
  static readonly instance = new NullTypeInformation();
  static readonly NULL = NullTypeInformation.instance;

  constructor() {
    super();
  }

  check(value: any): value is null {
    return value === null;
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
    return "null";
  }

  exportToString(): string {
    return "null";
  }

  importFromString(): null {
    return null;
  }

  importFromJson(): null {
    return null;
  }

  exportToJson(): null {
    return null;
  }

  toString() {
    return "NullTypeInformation{}";
  }

  json() {
    return {
      type: "null",
    };
  }
}

/**
 * Type for defining an undefined value
 */
export class UndefinedTypeInformation extends TypeInformation<undefined> {
  static readonly instance = new UndefinedTypeInformation();
  static readonly UNDEFINED = UndefinedTypeInformation.instance;

  constructor() {
    super();
  }

  check(value: any): value is undefined {
    return value === undefined;
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
    return "undefined";
  }

  exportToString(): string {
    return "undefined";
  }

  importFromString(): undefined {
    return undefined;
  }

  exportToJson(): null {
    return null;
  }

  importFromJson(): undefined {
    return undefined;
  }

  toString() {
    return "UndefinedTypeInformation{}";
  }

  json() {
    return {
      type: "undefined",
    };
  }
}

/**
 * Type for defining any value
 */
export class AnyTypeInformation<T = any> extends TypeInformation<T> {
  static readonly instance = new AnyTypeInformation();

  constructor() {
    super();
  }

  check(value: T): value is T {
    return true;
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
    return "any";
  }

  exportToString(_value: T): string {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  importFromString(_value: string): T {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  exportToJson(value: T): JsonCompatible {
    return value as JsonCompatible; // TODO: Possible to implement?
  }

  importFromJson(value: JsonCompatible): T {
    return value as T; // TODO: Possible to implement?
  }

  toString() {
    return "AnyTypeInformation{}";
  }

  json() {
    return {
      type: "any",
    };
  }
}

/**
 * Create a type information for a null value
 * @returns A type information for a null value
 */
export function nullType(): NullTypeInformation {
  return NullTypeInformation.instance;
}

/**
 * Create a type information for an undefined value
 * @returns A type information for an undefined value
 */
export function undefinedType(): UndefinedTypeInformation {
  return UndefinedTypeInformation.instance;
}

/**
 * Create a type information for any value
 * @returns A type information for any value
 */
export function any(): AnyTypeInformation {
  return AnyTypeInformation.instance;
}
