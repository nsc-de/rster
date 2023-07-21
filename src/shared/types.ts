type DestructedType =
  | string
  | number
  | boolean
  | null
  | undefined
  | DestructedType[]
  | { [key: string]: DestructedType };

type SendMethod = "param" | "body" | "query";

export abstract class TypeInformation {
  abstract readonly sendableVia: SendMethod[];
}

export class StringTypeInformation extends TypeInformation {
  constructor(public value: string) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["param", "body", "query"];
  }
}

export class NumberTypeInformation extends TypeInformation {
  constructor(public value: number) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export class NumberRangeTypeInformation extends TypeInformation {
  constructor(public min: number, public max: number) {
    super();
  }
  includes(value: number) {
    return value >= this.min && value <= this.max;
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export class Or<T extends TypeInformation> extends TypeInformation {
  constructor(public values: T[]) {
    super();
  }

  get sendableVia(): SendMethod[] {
    return this.values
      .map((v) => v.sendableVia)
      .reduce((a, b) => a.concat(b), []);
  }
}
export class ObjectTypeInformation extends TypeInformation {
  constructor(
    public properties: {
      [key: string]: { required: boolean; type: TypeInformation };
    }
  ) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}
export class ArrayTypeInformation extends TypeInformation {
  minItems?: number;
  maxItems?: number;
  constructor(
    public values: TypeInformation[],
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
}

export class BooleanTypeInformation extends TypeInformation {
  static readonly TRUE = new BooleanTypeInformation(true);
  static readonly FALSE = new BooleanTypeInformation(false);

  constructor(public readonly value: boolean) {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export class NullTypeInformation extends TypeInformation {
  static readonly instance = new NullTypeInformation();
  static readonly NULL = NullTypeInformation.instance;

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export class UndefinedTypeInformation extends TypeInformation {
  static readonly instance = new NullTypeInformation();
  static readonly UNDEFINED = UndefinedTypeInformation.instance;

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export class AnyStringTypeInformation extends TypeInformation {
  static readonly instance = new AnyStringTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["param", "body", "query"];
  }
}

export class AnyNumberTypeInformation extends TypeInformation {
  static readonly instance = new AnyNumberTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export class AnyBooleanTypeInformation extends TypeInformation {
  static readonly instance = new AnyBooleanTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export class AnyTypeInformation extends TypeInformation {
  static readonly instance = new AnyTypeInformation();

  constructor() {
    super();
  }
  get sendableVia(): SendMethod[] {
    return ["body"];
  }
}

export function string(): AnyStringTypeInformation;
export function string(value: string): StringTypeInformation;
export function string(
  value?: string
): AnyStringTypeInformation | StringTypeInformation {
  if (value || value === "") {
    return new StringTypeInformation(value);
  }
  return AnyStringTypeInformation.instance;
}

export function number(): AnyNumberTypeInformation;
export function number(value: number): NumberTypeInformation;
export function number(
  value?: number
): AnyNumberTypeInformation | NumberTypeInformation {
  if (value || value === 0) {
    return new NumberTypeInformation(value);
  }
  return AnyNumberTypeInformation.instance;
}

export function numberRange(
  min: number,
  max: number
): NumberRangeTypeInformation {
  return new NumberRangeTypeInformation(min, max);
}

export function or<T extends TypeInformation>(...values: T[]): Or<T> {
  return new Or<T>(values);
}

export function object(properties: {
  [key: string]: { required: boolean; type: TypeInformation } | TypeInformation;
}): ObjectTypeInformation {
  return new ObjectTypeInformation(
    Object.keys(properties).reduce((acc, key) => {
      const value = properties[key];
      if (value instanceof TypeInformation) {
        acc[key] = { required: true, type: value };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: { required: boolean; type: TypeInformation } })
  );
}

export function array(
  values: TypeInformation[],
  {
    minItems,
    maxItems,
  }: {
    minItems?: number;
    maxItems?: number;
  } = {}
): ArrayTypeInformation {
  return new ArrayTypeInformation(values, {
    minItems,
    maxItems,
  });
}

export function boolean(value: boolean): BooleanTypeInformation {
  return value ? BooleanTypeInformation.TRUE : BooleanTypeInformation.FALSE;
}

export function nullType(): NullTypeInformation {
  return NullTypeInformation.instance;
}

export function undefinedType(): UndefinedTypeInformation {
  return NullTypeInformation.instance;
}

export function trueType(): BooleanTypeInformation {
  return BooleanTypeInformation.TRUE;
}

export function falseType(): BooleanTypeInformation {
  return BooleanTypeInformation.FALSE;
}

export function any(): AnyTypeInformation {
  return AnyTypeInformation.instance;
}
