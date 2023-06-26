type SendMethod = "param" | "body" | "query";
export interface TypeInformation {
    readonly sendableVia: SendMethod[];
}
export declare class StringTypeInformation implements TypeInformation {
    value: string;
    constructor(value: string);
    get sendableVia(): SendMethod[];
}
export declare class NumberTypeInformation implements TypeInformation {
    value: number;
    constructor(value: number);
    get sendableVia(): SendMethod[];
}
export declare class NumberRangeTypeInformation implements TypeInformation {
    min: number;
    max: number;
    constructor(min: number, max: number);
    includes(value: number): boolean;
    get sendableVia(): SendMethod[];
}
export declare class Or<T extends TypeInformation> implements TypeInformation {
    values: T[];
    constructor(values: T[]);
    get sendableVia(): SendMethod[];
}
export declare class ObjectTypeInformation {
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
export declare class ArrayTypeInformation implements TypeInformation {
    values: TypeInformation[];
    minItems?: number;
    maxItems?: number;
    constructor(values: TypeInformation[], { minItems, maxItems, }: {
        minItems?: number;
        maxItems?: number;
    });
    get sendableVia(): SendMethod[];
}
export declare class BooleanTypeInformation implements TypeInformation {
    value: boolean;
    static readonly TRUE: BooleanTypeInformation;
    static readonly FALSE: BooleanTypeInformation;
    constructor(value: boolean);
    get sendableVia(): SendMethod[];
}
export declare class NullTypeInformation implements TypeInformation {
    static readonly instance: NullTypeInformation;
    static readonly NULL: NullTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyStringTypeInformation implements TypeInformation {
    static readonly instance: AnyStringTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyNumberTypeInformation implements TypeInformation {
    static readonly instance: AnyNumberTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyBooleanTypeInformation implements TypeInformation {
    static readonly instance: AnyBooleanTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export declare class AnyTypeInformation implements TypeInformation {
    static readonly instance: AnyTypeInformation;
    constructor();
    get sendableVia(): SendMethod[];
}
export {};
