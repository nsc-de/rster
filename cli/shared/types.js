"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.any = exports.falseType = exports.trueType = exports.nullType = exports.boolean = exports.array = exports.object = exports.or = exports.numberRange = exports.number = exports.string = exports.AnyTypeInformation = exports.AnyBooleanTypeInformation = exports.AnyNumberTypeInformation = exports.AnyStringTypeInformation = exports.NullTypeInformation = exports.BooleanTypeInformation = exports.ArrayTypeInformation = exports.ObjectTypeInformation = exports.Or = exports.NumberRangeTypeInformation = exports.NumberTypeInformation = exports.StringTypeInformation = exports.TypeInformation = void 0;
class TypeInformation {
}
exports.TypeInformation = TypeInformation;
class StringTypeInformation extends TypeInformation {
    constructor(value) {
        super();
        this.value = value;
    }
    get sendableVia() { return ["param", "body", "query"]; }
}
exports.StringTypeInformation = StringTypeInformation;
class NumberTypeInformation extends TypeInformation {
    constructor(value) {
        super();
        this.value = value;
    }
    get sendableVia() { return ["body"]; }
}
exports.NumberTypeInformation = NumberTypeInformation;
class NumberRangeTypeInformation extends TypeInformation {
    constructor(min, max) {
        super();
        this.min = min;
        this.max = max;
    }
    includes(value) {
        return value >= this.min && value <= this.max;
    }
    get sendableVia() { return ["body"]; }
}
exports.NumberRangeTypeInformation = NumberRangeTypeInformation;
class Or extends TypeInformation {
    constructor(values) {
        super();
        this.values = values;
    }
    get sendableVia() {
        return this.values.map(v => v.sendableVia).reduce((a, b) => a.concat(b), []);
    }
}
exports.Or = Or;
class ObjectTypeInformation extends TypeInformation {
    constructor(properties) {
        super();
        this.properties = properties;
    }
    get sendableVia() { return ["body"]; }
}
exports.ObjectTypeInformation = ObjectTypeInformation;
;
class ArrayTypeInformation extends TypeInformation {
    constructor(values, { minItems, maxItems, }) {
        super();
        this.values = values;
        this.minItems = minItems;
        this.maxItems = maxItems;
    }
    get sendableVia() { return ["body"]; }
}
exports.ArrayTypeInformation = ArrayTypeInformation;
class BooleanTypeInformation extends TypeInformation {
    static { this.TRUE = new BooleanTypeInformation(true); }
    static { this.FALSE = new BooleanTypeInformation(false); }
    constructor(value) {
        super();
        this.value = value;
    }
    get sendableVia() { return ["body"]; }
}
exports.BooleanTypeInformation = BooleanTypeInformation;
class NullTypeInformation extends TypeInformation {
    static { this.instance = new NullTypeInformation(); }
    static { this.NULL = NullTypeInformation.instance; }
    constructor() {
        super();
    }
    get sendableVia() { return ["body"]; }
}
exports.NullTypeInformation = NullTypeInformation;
class AnyStringTypeInformation extends TypeInformation {
    static { this.instance = new AnyStringTypeInformation(); }
    constructor() {
        super();
    }
    get sendableVia() { return ["param", "body", "query"]; }
}
exports.AnyStringTypeInformation = AnyStringTypeInformation;
class AnyNumberTypeInformation extends TypeInformation {
    static { this.instance = new AnyNumberTypeInformation(); }
    constructor() {
        super();
    }
    get sendableVia() { return ["body"]; }
}
exports.AnyNumberTypeInformation = AnyNumberTypeInformation;
class AnyBooleanTypeInformation extends TypeInformation {
    static { this.instance = new AnyBooleanTypeInformation(); }
    constructor() {
        super();
    }
    get sendableVia() { return ["body"]; }
}
exports.AnyBooleanTypeInformation = AnyBooleanTypeInformation;
class AnyTypeInformation extends TypeInformation {
    static { this.instance = new AnyTypeInformation(); }
    constructor() {
        super();
    }
    get sendableVia() { return ["body"]; }
}
exports.AnyTypeInformation = AnyTypeInformation;
function string(value) {
    if (value || value === "") {
        return new StringTypeInformation(value);
    }
    return AnyStringTypeInformation.instance;
}
exports.string = string;
function number(value) {
    if (value || value === 0) {
        return new NumberTypeInformation(value);
    }
    return AnyNumberTypeInformation.instance;
}
exports.number = number;
function numberRange(min, max) {
    return new NumberRangeTypeInformation(min, max);
}
exports.numberRange = numberRange;
function or(...values) {
    return new Or(values);
}
exports.or = or;
function object(properties) {
    return new ObjectTypeInformation(Object.keys(properties).reduce((acc, key) => {
        const value = properties[key];
        if (value instanceof TypeInformation) {
            acc[key] = { required: true, type: value };
        }
        else {
            acc[key] = value;
        }
        return acc;
    }, {}));
}
exports.object = object;
function array(values, { minItems, maxItems, } = {}) {
    return new ArrayTypeInformation(values, {
        minItems,
        maxItems
    });
}
exports.array = array;
function boolean(value) {
    return value ? BooleanTypeInformation.TRUE : BooleanTypeInformation.FALSE;
}
exports.boolean = boolean;
function nullType() {
    return NullTypeInformation.instance;
}
exports.nullType = nullType;
function trueType() {
    return BooleanTypeInformation.TRUE;
}
exports.trueType = trueType;
function falseType() {
    return BooleanTypeInformation.FALSE;
}
exports.falseType = falseType;
function any() {
    return AnyTypeInformation.instance;
}
exports.any = any;
//# sourceMappingURL=types.js.map