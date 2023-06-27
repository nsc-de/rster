type SendMethod = "param" | "body" | "query";
export declare abstract class TypeInformation {
    abstract readonly sendableVia: SendMethod[];
}
export declare class StringTypeInformation extends TypeInformation {
    value: string;
    constructor(value: string);
    get sendableVia(): SendMethod[];
}
export declare class NumberTypeInformation extends TypeInformation {
    value: number;
    constructor(value: number);
    get sendableVia(): SendMethod[];
}
export declare class NumberRangeTypeInformation extends TypeInformation {
    min: number;
    max: number;
    constructor(min: number, max: number);
    includes(value: number): boolean;
    get sendableVia(): SendMethod[];
}
export declare class Or<T extends TypeInformation> extends TypeInformation {
    values: T[];
    constructor(values: T[]);
    get sendableVia(): SendMethod[];
}
export declare class ObjectTypeInformation extends TypeInformation {
    properties: {
        [key: string]: {
            required: boolean;
            type: TypeInformation;
        };
    };
    constructor(properties: {
        [key: string]: {
            required: boolean;
            type: TypeInformation;
        };
    });
    get sendableVia(): SendMethod[];
}
export declare class ArrayTypeInformation extends TypeInformation {
    values: TypeInformation[];
    minItems?: number;
    maxItems?: number;
    constructor(values: TypeInformation[], { minItems, maxItems, }: {
        minItems?: number;
        maxItems?: number;
    });
    get sendableVia(): SendMethod[];
}
export declare class BooleanTypeInformation extends TypeInformation {
    readonly value: boolean;
    static readonly TRUE: BooleanTypeInformation;
    static readonly FALSE: BooleanTypeInformation;
    constructor(value: boolean);
    get sendableVia(): SendMethod[];
}
export declare class NullTypeInformation extends TypeInformation {
    static readonly instance: NullTypeInformation;
    static readonly NULL: NullTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyStringTypeInformation extends TypeInformation {
    static readonly instance: AnyStringTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyNumberTypeInformation extends TypeInformation {
    static readonly instance: AnyNumberTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyBooleanTypeInformation extends TypeInformation {
    static readonly instance: AnyBooleanTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyTypeInformation extends TypeInformation {
    static readonly instance: AnyTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare function string(): AnyStringTypeInformation;
export declare function string(value: string): StringTypeInformation;
export declare function number(): AnyNumberTypeInformation;
export declare function number(value: number): NumberTypeInformation;
export declare function numberRange(min: number, max: number): NumberRangeTypeInformation;
export declare function or<T extends TypeInformation>(...values: T[]): Or<T>;
export declare function object(properties: {
    [key: string]: {
        required: boolean;
        type: TypeInformation;
    } | TypeInformation;
}): ObjectTypeInformation;
export declare function array(values: TypeInformation[], { minItems, maxItems, }?: {
    minItems?: number;
    maxItems?: number;
}): ArrayTypeInformation;
export declare function boolean(value: boolean): BooleanTypeInformation;
export declare function nullType(): NullTypeInformation;
export declare function trueType(): BooleanTypeInformation;
export declare function falseType(): BooleanTypeInformation;
export declare function any(): AnyTypeInformation;
export {};
