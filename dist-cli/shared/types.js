"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyTypeInformation = exports.AnyBooleanTypeInformation = exports.AnyNumberTypeInformation = exports.AnyStringTypeInformation = exports.NullTypeInformation = exports.BooleanTypeInformation = exports.ArrayTypeInformation = exports.ObjectTypeInformation = exports.Or = exports.NumberRangeTypeInformation = exports.NumberTypeInformation = exports.StringTypeInformation = void 0;
class StringTypeInformation {
    constructor(value) {
        this.value = value;
    }
    get sendableVia() { return ["param", "body", "query"]; }
}
exports.StringTypeInformation = StringTypeInformation;
class NumberTypeInformation {
    constructor(value) {
        this.value = value;
    }
    get sendableVia() { return ["body"]; }
}
exports.NumberTypeInformation = NumberTypeInformation;
class NumberRangeTypeInformation {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    includes(value) {
        return value >= this.min && value <= this.max;
    }
    get sendableVia() { return ["body"]; }
}
exports.NumberRangeTypeInformation = NumberRangeTypeInformation;
class Or {
    constructor(values) {
        this.values = values;
    }
    get sendableVia() {
        return this.values.map(v => v.sendableVia).reduce((a, b) => a.concat(b), []);
    }
}
exports.Or = Or;
class ObjectTypeInformation {
    constructor(properties) {
        this.properties = properties;
    }
    get sendableVia() { return ["body"]; }
}
exports.ObjectTypeInformation = ObjectTypeInformation;
;
class ArrayTypeInformation {
    constructor(values, { minItems, maxItems, }) {
        this.values = values;
        this.minItems = minItems;
        this.maxItems = maxItems;
    }
    get sendableVia() { return ["body"]; }
}
exports.ArrayTypeInformation = ArrayTypeInformation;
class BooleanTypeInformation {
    static { this.TRUE = new BooleanTypeInformation(true); }
    static { this.FALSE = new BooleanTypeInformation(false); }
    constructor(value) {
        this.value = value;
    }
    get sendableVia() { return ["body"]; }
}
exports.BooleanTypeInformation = BooleanTypeInformation;
class NullTypeInformation {
    static { this.instance = new NullTypeInformation(); }
    static { this.NULL = NullTypeInformation.instance; }
    constructor() { }
    get sendableVia() { return ["body"]; }
}
exports.NullTypeInformation = NullTypeInformation;
class AnyStringTypeInformation {
    static { this.instance = new AnyStringTypeInformation(); }
    constructor() { }
    get sendableVia() { return ["param", "body", "query"]; }
}
exports.AnyStringTypeInformation = AnyStringTypeInformation;
class AnyNumberTypeInformation {
    static { this.instance = new AnyNumberTypeInformation(); }
    constructor() { }
    get sendableVia() { return ["body"]; }
}
exports.AnyNumberTypeInformation = AnyNumberTypeInformation;
class AnyBooleanTypeInformation {
    static { this.instance = new AnyBooleanTypeInformation(); }
    constructor() { }
    get sendableVia() { return ["body"]; }
}
exports.AnyBooleanTypeInformation = AnyBooleanTypeInformation;
class AnyTypeInformation {
    static { this.instance = new AnyTypeInformation(); }
    constructor() { }
    get sendableVia() { return ["body"]; }
}
exports.AnyTypeInformation = AnyTypeInformation;
//# sourceMappingURL=types.js.map