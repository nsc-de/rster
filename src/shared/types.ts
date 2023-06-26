type DestructedType = string | number | boolean | null | undefined | DestructedType[] | { [key: string]: DestructedType };

type SendMethod = "param" | "body" | "query";

export interface TypeInformation {
  readonly sendableVia: SendMethod[];
}

export class StringTypeInformation implements TypeInformation {
  constructor(public value: string) { }
  get sendableVia(): SendMethod[] { return ["param", "body", "query"] }
}

export class NumberTypeInformation implements TypeInformation {
  constructor(public value: number) { }
  get sendableVia(): SendMethod[] { return ["body"] }
}

export class NumberRangeTypeInformation implements TypeInformation {
  constructor(public min: number, public max: number) { }
  includes(value: number) {
    return value >= this.min && value <= this.max;
  }
  get sendableVia(): SendMethod[] { return ["body"] }
}


export class Or<T extends TypeInformation> implements TypeInformation {

  constructor(public values: T[]) { }


  get sendableVia(): SendMethod[] {
    return this.values.map(v => v.sendableVia).reduce((a, b) => a.concat(b), [])
  }
}
export class ObjectTypeInformation {
  constructor(public properties: { [key: string]: { required: boolean, type: TypeInformation } }) { }
  get sendableVia(): SendMethod[] { return ["body"] }
};
export class ArrayTypeInformation implements TypeInformation {
  minItems?: number;
  maxItems?: number;
  constructor(public values: TypeInformation[], {
    minItems,
    maxItems,
  }: {
    minItems?: number,
    maxItems?: number,
  }) {
    this.minItems = minItems;
    this.maxItems = maxItems;
  }
  get sendableVia(): SendMethod[] { return ["body"] }
}

export class BooleanTypeInformation implements TypeInformation {
  static readonly TRUE = new BooleanTypeInformation(true);
  static readonly FALSE = new BooleanTypeInformation(false);

  constructor(public value: boolean) { }
  get sendableVia(): SendMethod[] { return ["body"] }
}

export class NullTypeInformation implements TypeInformation {

  static readonly instance = new NullTypeInformation();
  static readonly NULL = NullTypeInformation.instance;

  constructor() { }
  get sendableVia(): SendMethod[] { return ["body"] }
}

export class AnyStringTypeInformation implements TypeInformation {

  static readonly instance = new AnyStringTypeInformation();

  constructor() { }
  get sendableVia(): SendMethod[] { return ["param", "body", "query"] }
}

export class AnyNumberTypeInformation implements TypeInformation {

  static readonly instance = new AnyNumberTypeInformation();

  constructor() { }
  get sendableVia(): SendMethod[] { return ["body"] }
}

export class AnyBooleanTypeInformation implements TypeInformation {

  static readonly instance = new AnyBooleanTypeInformation();

  constructor() { }
  get sendableVia(): SendMethod[] { return ["body"] }
}


export class AnyTypeInformation implements TypeInformation {

  static readonly instance = new AnyTypeInformation();

  constructor() { }
  get sendableVia(): SendMethod[] { return ["body"] }
}

