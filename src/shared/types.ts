export type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export type DestructedType =
  | string
  | number
  | boolean
  | null
  | undefined
  | DestructedType[]
  | { [key: string]: DestructedType };

type SendMethod = "param" | "body" | "query";

export abstract class TypeInformation<T> {
  abstract readonly sendableVia: SendMethod[];
  abstract get type(): T;
}

export class StringTypeInformation<
  T extends string
> extends TypeInformation<T> {
  constructor(public readonly value: T) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["param", "body", "query"];
  }
  get type(): T {
    return this.value;
  }
}

export class NumberTypeInformation<
  T extends number
> extends TypeInformation<T> {
  constructor(public readonly value: T) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
  get type(): T {
    return this.value;
  }
}

export class NumberRangeTypeInformation<
  MIN extends number,
  MAX extends number
> extends TypeInformation<IntRange<MIN, MAX>> {
  constructor(public readonly min: MIN, public readonly max: MAX) {
    super();
  }
  includes(value: number) {
    return value >= this.min && value <= this.max;
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
  get type(): IntRange<MIN, MAX> {
    return this.min as any;
  }
}

export class Or<
  T0 extends TypeInformation<any>,
  T1 extends TypeInformation<any>
> extends TypeInformation<T0 | T1> {
  constructor(public readonly value0: T0, public readonly value1: T1) {
    super();
  }

  get sendableVia(): SendMethod[] {
    return [this.value0, this.value1]
      .map((v) => v.sendableVia)
      .reduce((a, b) => a.concat(b), []);
  }

  get type(): T0 | T1 {
    return this.value0.type ?? this.value1.type;
  }
}
export class ObjectTypeInformation<
  T extends { [key: string]: TypeInformation<any> }
> extends TypeInformation<T> {
  constructor(
    public readonly properties: {
      // [key: string]: { required: boolean; type: TypeInformation };
      [key in keyof T]: { required: boolean; type: T[key] };
    }
  ) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): T {
    return Object.keys(this.properties).reduce((acc, key) => {
      const value = this.properties[key];
      acc[key] = value.type.type;
      return acc;
    }, {} as any);
  }
}
export class ArrayTypeInformation<
  T extends TypeInformation<any>
> extends TypeInformation<T[]> {
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
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): T[] {
    return this.values.map((v) => v.type);
  }
}

export class BooleanTypeInformation<
  T extends true | false
> extends TypeInformation<T> {
  static readonly TRUE = new BooleanTypeInformation(true);
  static readonly FALSE = new BooleanTypeInformation(false);

  constructor(public readonly value: T) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): T {
    return this.value;
  }
}

export class NullTypeInformation extends TypeInformation<null> {
  static readonly instance = new NullTypeInformation();
  static readonly NULL = NullTypeInformation.instance;

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): null {
    return null;
  }
}

export class UndefinedTypeInformation extends TypeInformation<undefined> {
  static readonly instance = new NullTypeInformation();
  static readonly UNDEFINED = UndefinedTypeInformation.instance;

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): undefined {
    return undefined;
  }
}

export class AnyStringTypeInformation extends TypeInformation<string> {
  static readonly instance = new AnyStringTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["param", "body", "query"];
  }

  get type(): string {
    return "";
  }
}

export class AnyNumberTypeInformation extends TypeInformation<number> {
  static readonly instance = new AnyNumberTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): number {
    return 0;
  }
}

export class AnyBooleanTypeInformation extends TypeInformation<boolean> {
  static readonly instance = new AnyBooleanTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): boolean {
    return false;
  }
}

export class AnyTypeInformation extends TypeInformation<any> {
  static readonly instance = new AnyTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }

  get type(): any {
    return null;
  }
}

export function string(): AnyStringTypeInformation;
export function string<T extends string>(value: T): StringTypeInformation<T>;
export function string(
  value?: string
): AnyStringTypeInformation | StringTypeInformation<any> {
  if (value || value === "") {
    return new StringTypeInformation(value);
  }
  return AnyStringTypeInformation.instance;
}

export function number(): AnyNumberTypeInformation;
export function number<T extends number>(value: T): NumberTypeInformation<T>;
export function number(
  value?: number
): AnyNumberTypeInformation | NumberTypeInformation<any> {
  if (value || value === 0) {
    return new NumberTypeInformation(value);
  }
  return AnyNumberTypeInformation.instance;
}

export function numberRange<MIN extends number, MAX extends number>(
  min: MIN,
  max: MAX
): NumberRangeTypeInformation<MIN, MAX> {
  return new NumberRangeTypeInformation(min, max);
}

export function or<
  T0 extends TypeInformation<any>,
  T1 extends TypeInformation<any>
>(value0: T0, value1: T1): Or<T0, T1> {
  return new Or(value0, value1);
}

export function object<
  T extends { [key: string]: TypeInformation<any> }
>(properties: {
  [key in keyof T]:
    | TypeInformation<any>
    | { required: boolean; type: TypeInformation<any> };
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

export function array<T extends TypeInformation<any>>(
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

export function boolean<T extends true | false>(
  value: boolean
): BooleanTypeInformation<T>;
export function boolean(): AnyBooleanTypeInformation;
export function boolean(
  value?: boolean
): AnyBooleanTypeInformation | BooleanTypeInformation<any> {
  if (value || value === false) {
    return new BooleanTypeInformation(value);
  }
  return AnyBooleanTypeInformation.instance;
}

export function nullType(): NullTypeInformation {
  return NullTypeInformation.instance;
}

export function undefinedType(): UndefinedTypeInformation {
  return NullTypeInformation.instance;
}

export function trueType(): BooleanTypeInformation<true> {
  return BooleanTypeInformation.TRUE;
}

export function falseType(): BooleanTypeInformation<false> {
  return BooleanTypeInformation.FALSE;
}

export function any(): AnyTypeInformation {
  return AnyTypeInformation.instance;
}
