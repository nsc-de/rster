import { ConversionRegister } from "../conversion";
import {
  AllowAnyTypeInformation,
  JsonCompatible,
  PrimitiveType,
  SendMethod,
  TypeInformation,
} from "../types";

/**
 * Type for defining an array of specific types
 *
 * @typeParam T - The array type
 */
export class ArrayTypeInformation<
  T extends AllowAnyTypeInformation
> extends TypeInformation<PrimitiveType<T>[]> {
  minItems?: number;
  maxItems?: number;
  constructor(
    public readonly values: T,
    {
      minItems,
      maxItems,
    }: {
      minItems?: number;
      maxItems?: number;
    } = {}
  ) {
    super();
    this.minItems = minItems;
    this.maxItems = maxItems;
  }

  check(value: any): value is PrimitiveType<T>[] {
    return (
      Array.isArray(value) &&
      value.length >= (this.minItems ?? 0) &&
      value.length <= (this.maxItems ?? Infinity) &&
      value.every((v) => this.values.check(v))
    );
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
    return "array";
  }

  exportToString(value: PrimitiveType<T>[]): string {
    return JSON.stringify(
      value.map((v) =>
        v !== null &&
        typeof v !== "number" &&
        typeof v !== "string" &&
        typeof v !== "boolean"
          ? ConversionRegister.instance.exportToString(v)
          : v
      )
    );
  }

  importFromString(value: string): PrimitiveType<T>[] {
    return JSON.parse(value).map((v: any) =>
      typeof v === "string"
        ? ConversionRegister.instance.importFromString(v)
        : v
    );
  }

  exportToJson(value: PrimitiveType<T>[]): JsonCompatible {
    return value.map((v) => this.values.exportToJson(v));
  }

  importFromJson(value: JsonCompatible): PrimitiveType<T>[] {
    if (!Array.isArray(value)) {
      throw new Error(`Expected array, got ${typeof value}`);
    }

    return value.map((v: JsonCompatible) => this.values.importFromJson(v));
  }

  toString() {
    return `ArrayTypeInformation{${this.values}}`;
  }

  json() {
    return {
      type: "array",
      values: this.values.json(),
      minItems: this.minItems,
      maxItems: this.maxItems,
    };
  }
}

/**
 * Create a type information for an array of specific types
 * @param values the types that are allowed in the array
 * @param param1 - The minimum and maximum number of items in the array
 * @returns A type information for an array of specific types
 */
export function array<T extends AllowAnyTypeInformation>(
  values: T,
  {
    minItems,
    maxItems,
  }: {
    minItems?: number;
    maxItems?: number;
  } = {}
): ArrayTypeInformation<T> {
  return new ArrayTypeInformation(values, { minItems, maxItems });
}
