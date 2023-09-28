import {
  AllowAnyTypeInformation,
  Extends,
  JsonCompatible,
  PrimitiveType,
  SendMethod,
  TypeInformation,
} from "../types";

/**
 * Type for defining a union of two types
 *
 * @typeParam T0 - First type
 * @typeParam T1 - Second type
 */
export class Or<
  T0 extends AllowAnyTypeInformation,
  T1 extends AllowAnyTypeInformation
> extends TypeInformation<T0 | T1> {
  constructor(public readonly value0: T0, public readonly value1: T1) {
    super();
  }

  check<T>(value: T): Extends<T, T0 | T1> {
    return this.value0.check(value) || this.value1.check(value);
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return this.value0.sendableVia().filter((v) => this.value1.sendableVia(v));
  }

  get identifier(): string {
    return "or";
  }

  exportToString(_value: PrimitiveType<T0> | PrimitiveType<T1>): string {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  importFromString(_value: string): PrimitiveType<T0> | PrimitiveType<T1> {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  exportToJson(_value: PrimitiveType<T0> | PrimitiveType<T1>): JsonCompatible {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  importFromJson(
    _value: JsonCompatible
  ): PrimitiveType<T0> | PrimitiveType<T1> {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  toString() {
    return `Or{${this.value0}, ${this.value1}}`;
  }

  json() {
    return {
      type: "or",
      value0: this.value0.json(),
      value1: this.value1.json(),
    };
  }
}

/**
 * Union two type information's
 * @param value0 - The first type information
 * @param value1 - The second type information
 */
export function or<
  T0 extends AllowAnyTypeInformation,
  T1 extends AllowAnyTypeInformation
>(value0: T0, value1: T1): Or<T0, T1>;

/**
 * Union three type information's
 * @param value0 - The first type information
 * @param value1 - The second type information
 * @param value2 - The third type information
 * @returns A type information that is the union of the three type information's
 */
export function or<
  T0 extends AllowAnyTypeInformation,
  T1 extends AllowAnyTypeInformation,
  T2 extends AllowAnyTypeInformation
>(value0: T0, value1: T1, value2: T2): Or<Or<T0, T1>, T2>;

/**
 * Union four type information's
 * @param value0 - The first type information
 * @param value1 - The second type information
 * @param value2 - The third type information
 * @param value3 - The fourth type information
 * @returns A type information that is the union of the four type information's
 */
export function or<
  T0 extends AllowAnyTypeInformation,
  T1 extends AllowAnyTypeInformation,
  T2 extends AllowAnyTypeInformation,
  T3 extends AllowAnyTypeInformation
>(value0: T0, value1: T1, value2: T2, value3: T3): Or<Or<Or<T0, T1>, T2>, T3>;

/**
 * Union five or more type information's
 * @param value0 - The first type information
 * @param values - The rest of the type information's
 * @returns A type information that is the union of the type information's
 */
export function or<
  T0 extends AllowAnyTypeInformation,
  T extends AllowAnyTypeInformation
>(value0: T0, ...values: T[]): Or<any, T0>;
export function or<T0 extends AllowAnyTypeInformation>(
  value0: T0,
  ...values: AllowAnyTypeInformation[]
): Or<any, T0> {
  return values.reduce((acc, value) => new Or(acc, value), value0) as any;
}
