/**
 * Shortcut for AllowAnyTypeInformation
 */
export type AllowAnyTypeInformation = TypeInformation<any>;

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

export type ConversionRegisterEntry<T extends AllowAnyTypeInformation> = {
  type: T;
  identifier: string;
  exportToString: (value: T["type"]) => string;
  importFromString: (value: string) => T["type"];
};

export class ConversionRegister {
  static readonly instance = new ConversionRegister([]);

  constructor(
    public readonly entries: ConversionRegisterEntry<AllowAnyTypeInformation>[]
  ) {}

  register<T extends AllowAnyTypeInformation>(
    type: T,
    identifier: string,
    exportToString: (value: T["type"]) => string,
    importFromString: (value: string) => T["type"]
  ) {
    // Check if the identifier is already registered
    if (this.entries.some((e) => e.identifier === identifier)) {
      return;
    }
    this.entries.push({
      type,
      identifier,
      exportToString,
      importFromString,
    });
  }

  exportToString(value: AllowAnyTypeInformation["type"]): string {
    const entry = this.entries.find((e) => e.type.check(value));
    if (!entry) {
      throw new Error("Unsupported type");
    }
    return `${entry.identifier}:${entry.exportToString(value)}`;
  }

  importFromString(value: string): AllowAnyTypeInformation["type"] {
    const [identifier, stringValue] = value.split(":");
    const entry = this.entries.find((e) => e.identifier === identifier);
    if (!entry) {
      throw new Error("Unsupported type");
    }
    return entry.importFromString(stringValue);
  }

  exportObjectToString(
    value: Record<string, unknown>,
    supportsValue: (it: unknown) => boolean = () => false
  ): Record<string, any> {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        supportsValue(value) ? value : this.exportToString(value),
      ])
    );
  }

  importObjectFromString(
    value: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        typeof value === "string" ? this.importFromString(value) : value,
      ])
    );
  }

  exportArrayToString(
    value: unknown[],
    supportsValue: (it: unknown) => boolean = () => false
  ): unknown[] {
    return value.map((v) => (supportsValue(v) ? v : this.exportToString(v)));
  }

  importArrayFromString(value: unknown[]): unknown[] {
    return value.map((v) =>
      typeof v === "string" ? this.importFromString(v) : v
    );
  }

  deepExportObjectToString(
    value: Record<string, unknown>,
    supportsValue: (it: unknown) => boolean = () => false
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        typeof value === "object"
          ? value !== null
            ? this.deepExportObjectToString(
                value as Record<string, unknown>,
                supportsValue
              )
            : null
          : supportsValue(value)
          ? value
          : this.exportToString(value),
      ])
    );
  }

  deepImportObjectFromString(
    value: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        typeof value === "object"
          ? value !== null
            ? this.deepImportObjectFromString(value as Record<string, unknown>)
            : null
          : typeof value === "string"
          ? this.importFromString(value)
          : value,
      ])
    );
  }

  deepExportArrayToString(
    value: unknown[],
    supportsValue: (it: unknown) => boolean = () => false
  ): unknown[] {
    return value.map((v) =>
      typeof v === "object"
        ? v !== null
          ? this.deepExportObjectToString(
              v as Record<string, unknown>,
              supportsValue
            )
          : null
        : supportsValue(v)
        ? v
        : this.exportToString(v)
    );
  }

  deepImportArrayFromString(value: unknown[]): unknown[] {
    return value.map((v) =>
      typeof v === "object"
        ? v !== null
          ? this.deepImportObjectFromString(v as Record<string, unknown>)
          : null
        : typeof v === "string"
        ? this.importFromString(v)
        : v
    );
  }

  deepExportToString(
    value: unknown[],
    supportsValue: (it: unknown) => boolean
  ): unknown[];
  deepExportToString(
    value: Record<string, unknown>,
    supportsValue: (it: unknown) => boolean
  ): Record<string, unknown>;
  deepExportToString(
    value: unknown[] | Record<string, unknown>,
    supportsValue: (it: unknown) => boolean = () => false
  ): unknown[] | Record<string, unknown> {
    if (Array.isArray(value)) {
      return this.deepExportArrayToString(value, supportsValue);
    }

    if (typeof value === "object") {
      return this.deepExportObjectToString(
        value as Record<string, unknown>,
        supportsValue
      );
    }

    throw new Error("Unsupported type");
  }
}

// Decorator for registering a type in the conversion register
export function registerType<T extends AllowAnyTypeInformation>(
  identifier: string,
  exportToString: (value: T["type"]) => string,
  importFromString: (value: string) => T["type"]
) {
  return (target: T) => {
    ConversionRegister.instance.register(
      target,
      identifier,
      exportToString,
      importFromString
    );
  };
}

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

/**
 * Type for destructed type information
 */
export type DestructedType =
  | string
  | number
  | boolean
  | null
  | undefined
  | DestructedType[]
  | { [key: string]: DestructedType };

/**
 * Different ways to send data to the server
 *
 * query: Send data as query parameters
 * body: Send data as JSON in the body
 * param: Send data as a path parameter
 */
type SendMethod = "param" | "body" | "query";

export type StringType =
  | StringTypeInformation<string>
  | AnyStringTypeInformation;
export type NumberType =
  | NumberTypeInformation<number>
  | AnyNumberTypeInformation
  | NumberRangeTypeInformation<number, number>;
export type BooleanType =
  | BooleanTypeInformation<true>
  | BooleanTypeInformation<false>
  | AnyBooleanTypeInformation;

export abstract class TypeInformation<T> {
  constructor() {
    // Register the type in the conversion register
    this.__registerType();
  }

  private __registerType() {
    // Register the type in the conversion register
    ConversionRegister.instance.register(
      this,
      this.identifier,
      this.exportToString.bind(this),
      this.importFromString.bind(this)
    );
  }

  /**
   * Checks if the given value is of the type defined by this type information
   *
   * @param value - The value to check
   */
  abstract check(value: any): value is T;

  /**
   * Get a list of methods that can be used to send this type to the server
   */
  abstract sendableVia(): SendMethod[];

  /**
   * Checks if the given method can be used to send this type to the server
   *
   * @param m - The method to check
   */
  abstract sendableVia(m: SendMethod): boolean;

  /**
   * This is not a real property, but a hack to get the type of the type information
   * This is used to get the type of the type information for typescript to infer
   * It's return type should represent the typescript type of the type information
   * It can return or do basically anything, as it will never be called by the API and
   * SHOULD NOT be called by the user, only using `typeof` operator
   *
   * @readonly This is not a real property, but a hack to get the type of the type information
   * @abstract This is not a real property, but a hack to get the type of the type information
   * @type {T} This is the important part, it should represent the typescript type of the type information
   * @memberof TypeInformation This is not a real property, but a hack to get the type of the type information
   */
  abstract readonly type: T;

  abstract identifier: string;
  abstract exportToString(value: T): string;
  abstract importFromString(value: string): T;
}

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
  check(value: any): value is T {
    return typeof value === "string" && value === this.value;
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
    return "string";
  }

  exportToString(value: T): string {
    return value;
  }

  importFromString(value: string): T {
    return value as T;
  }

  toString() {
    return this.identifier;
  }
}

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
    return Number(value) as any;
  }
}

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

  check(value: any): value is T0 | T1 {
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

  get type(): T0 | T1 {
    return this.value0.type ?? this.value1.type;
  }

  get identifier(): string {
    return "or";
  }

  exportToString(value: T0 | T1): string {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  importFromString(value: string): T0 | T1 {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  toString() {
    return `${this.value0.toString()}|${this.value1.toString()}`;
  }
}

/**
 * Type for defining an object with specific properties
 *
 * @typeParam T - The object type
 */
export class ObjectTypeInformation<
  T extends { [key: string]: AllowAnyTypeInformation }
> extends TypeInformation<{ [key in keyof T]: T[key]["type"] }> {
  constructor(
    public readonly properties: {
      [key in keyof T]: { required: boolean; type: T[key] };
    }
  ) {
    super();
  }

  check(value: any): value is { [key in keyof T]: T[key]["type"] } {
    return (
      typeof value === "object" &&
      Object.keys(this.properties).every((key) => {
        const property = this.properties[key];
        return !property.required || property.type.check(value[key]);
      })
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

  get type(): { [key in keyof T]: T[key]["type"] } {
    return Object.keys(this.properties).reduce((acc, key) => {
      const value = this.properties[key];
      acc[key] = value.type.type;
      return acc;
    }, {} as any);
  }

  get identifier(): string {
    return "object";
  }

  exportToString(value: { [key in keyof T]: T[key]["type"] }): string {
    return JSON.stringify(
      ConversionRegister.instance.deepExportObjectToString(
        value,
        (it) =>
          typeof it === "boolean" ||
          typeof it === "number" ||
          typeof it === "string" ||
          it === "null"
      )
    );
  }

  importFromString(value: string): { [key in keyof T]: T[key]["type"] } {
    return ConversionRegister.instance.deepImportObjectFromString(
      JSON.parse(value)
    ) as { [key in keyof T]: T[key]["type"] };
  }
}

/**
 * Type for defining an array of specific types
 *
 * @typeParam T - The array type
 */
export class ArrayTypeInformation<
  T extends AllowAnyTypeInformation
> extends TypeInformation<T["type"][]> {
  minItems?: number;
  maxItems?: number;
  constructor(
    public readonly values: T[],
    {
      minItems,
      maxItems,
    }: {
      minItems?: number;
      maxItems?: number;
    }
  ) {
    super();
    this.minItems = minItems;
    this.maxItems = maxItems;
  }

  check(value: any): value is T["type"][] {
    return (
      Array.isArray(value) &&
      value.length >= (this.minItems ?? 0) &&
      value.length <= (this.maxItems ?? Infinity) &&
      value.every((v) => this.values.some((t) => t.check(v)))
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

  get type(): T["type"][] {
    return this.values.map((v) => v.type);
  }

  get identifier(): string {
    return "array";
  }

  exportToString(value: T["type"][]): string {
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

  importFromString(value: string): T["type"][] {
    return JSON.parse(value).map((v: any) =>
      typeof v === "string"
        ? ConversionRegister.instance.importFromString(v)
        : v
    );
  }
}

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

  check(value: any): value is T {
    return typeof value === "boolean" && value === this.value;
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["body"];
  }

  get type(): T {
    return this.value;
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
}

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

  get type(): null {
    return null;
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

  toString() {
    return this.identifier;
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

  get type(): undefined {
    return undefined;
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

  toString() {
    return this.identifier;
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

  check(value: any): value is string {
    return typeof value === "string";
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["param", "body", "query"];
  }

  get type(): string {
    return "";
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

  toString() {
    return this.identifier;
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

  check(value: any): value is boolean {
    return typeof value === "boolean";
  }

  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(m?: SendMethod): SendMethod[] | boolean {
    if (m) {
      return this.sendableVia().includes(m);
    }
    return ["param", "body", "query"];
  }

  get type(): boolean {
    return false;
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

  toString() {
    return this.identifier;
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

  get type(): T {
    return null as T;
  }

  get identifier(): string {
    return "any";
  }

  exportToString(value: T): string {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  importFromString(value: string): T {
    throw new Error("Method not supported."); // TODO: Possible to implement?
  }

  toString() {
    return this.identifier;
  }
}

/**
 * Type for defining a date
 */
export class DateTypeInformation extends TypeInformation<Date> {
  static readonly instance = new DateTypeInformation();

  constructor() {
    super();
  }

  check(value: unknown): value is Date {
    return value instanceof Date;
  }
  sendableVia(): SendMethod[];
  sendableVia(m: SendMethod): boolean;
  sendableVia(): SendMethod[] | boolean {
    return ["body"];
  }

  get type(): Date {
    return new Date();
  }

  get identifier(): string {
    return "date";
  }

  exportToString(value: Date): string {
    return value.toISOString();
  }

  importFromString(value: string): Date {
    return new Date(value);
  }

  toString() {
    return this.identifier;
  }
}

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
): AnyStringTypeInformation | StringTypeInformation<any> {
  if (value || value === "") {
    return new StringTypeInformation(value);
  }
  return AnyStringTypeInformation.instance;
}

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

/**
 * Create a type information for an object with specific properties
 * @param properties - The properties of the object
 * @returns A type information for an object with specific properties
 */
export function object<
  T extends Record<string, AllowAnyTypeInformation>
>(properties: {
  [key in keyof T]:
    | AllowAnyTypeInformation
    | { required: boolean; type: AllowAnyTypeInformation };
}): ObjectTypeInformation<T> {
  return new ObjectTypeInformation(
    Object.keys(properties).reduce((acc, key) => {
      const value = properties[key];
      acc[key] = {
        required: true,
        type: value instanceof TypeInformation ? value : value.type,
      };
      return acc;
    }, {} as any)
  );
}

/**
 * Create a type information for an array of specific types
 * @param values the types that are allowed in the array
 * @param param1 - The minimum and maximum number of items in the array
 * @returns A type information for an array of specific types
 */
export function array<T extends AllowAnyTypeInformation>(
  values: T[],
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

/**
 * Create a type information for any value
 * @returns A type information for any value
 */
export function any(): AnyTypeInformation {
  return AnyTypeInformation.instance;
}

/**
 * Type utility for converting a type to not include undefined
 */
export type NoUndefined<TYPE, ALTERNATIVE> = TYPE extends undefined
  ? ALTERNATIVE
  : TYPE;

/**
 * Type utility for converting a type a type information to it's typescript equivalent
 * @typeParam TYPE - The type information to convert
 * @see TypeInformation
 * @see TypeInformation.type
 * @see MapToPrimitiveType
 */
export type PrimitiveType<TYPE extends AllowAnyTypeInformation> = TYPE["type"];

/**
 * Type utility for converting a map of type information to their typescript equivalents
 * @typeParam TYPE - The map of type information to convert
 * @see TypeInformation
 * @see TypeInformation.type
 * @see PrimitiveType
 */
export type MapToPrimitiveType<
  TYPE extends Record<string, { type: AllowAnyTypeInformation }>
> = {
  [key in keyof TYPE]: PrimitiveType<TYPE[key]["type"]>;
};
