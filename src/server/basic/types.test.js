const {
  AnyBooleanTypeInformation,
  AnyNumberTypeInformation,
  AnyStringTypeInformation,
  AnyTypeInformation,
  ArrayTypeInformation,
  DateTypeInformation,
  NullTypeInformation,
  NumberRangeTypeInformation,
  NumberTypeInformation,
  ObjectTypeInformation,
  Or,
  StringTypeInformation,
  UndefinedTypeInformation,

  string,
  any,
  number,
  numberRange,
  object,
  array,
  or,
  nullType,
  undefinedType,
  boolean,
  BooleanTypeInformation,
  trueType,
  falseType,
  date,
  ConversionRegister,
} = require("./types");

describe("TypeInformation", () => {
  describe("StringTypeInformation", () => {
    it("check", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.check("hello")).toBe(true);
      expect(typeInfo.check("world")).toBe(false);
      expect(typeInfo.check(123)).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.identifier).toEqual("string");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.identifier).toEqual("string");
    });

    it("exportToString", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.exportToString("hello")).toEqual("hello");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.exportToString("world")).toEqual("world");
    });

    it("importFromString", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.importFromString("hello")).toEqual("hello");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.importFromString("world")).toEqual("world");
    });

    it("toString", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.toString()).toEqual("StringTypeInformation{hello}");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.toString()).toEqual("StringTypeInformation{world}");
    });

    it("json", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.json()).toEqual({ type: "string", value: "hello" });

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.json()).toEqual({ type: "string", value: "world" });
    });
  });

  describe("NumberTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.check(42)).toBe(true);
      expect(typeInfo.check("42")).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.identifier).toEqual("number");

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.identifier).toEqual("number");
    });

    it("exportToString", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.exportToString(42)).toEqual("42");

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.exportToString(43)).toEqual("43");
    });

    it("importFromString", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.importFromString("42")).toEqual(42);

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.importFromString("43")).toEqual(43);
    });

    it("toString", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.toString()).toEqual("NumberTypeInformation{42}");

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.toString()).toEqual("NumberTypeInformation{43}");
    });

    it("json", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.json()).toEqual({ type: "number", value: 42 });

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.json()).toEqual({ type: "number", value: 43 });
    });
  });

  describe("BooleanTypeInformation", () => {
    it("check", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.check(true)).toBe(true);
      expect(typeInfo.check(false)).toBe(false);
      expect(typeInfo.check(0)).toBe(false);
      expect(typeInfo.check("true")).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).not.toContain("query");
      expect(typeInfo.sendableVia()).not.toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(false);
      expect(typeInfo.sendableVia("param")).toBe(false);
    });

    it("identifier", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.identifier).toEqual("boolean");
    });

    it("exportToString", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.exportToString(true)).toEqual("true");
      expect(typeInfo.exportToString(false)).toEqual("false");
    });

    it("importFromString", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.importFromString("true")).toEqual(true);
      expect(typeInfo.importFromString("false")).toEqual(false);
    });

    it("toString", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.toString()).toEqual("BooleanTypeInformation{true}");
    });

    it("json", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.json()).toEqual({ type: "boolean", value: true });
    });
  });

  describe("NumberRangeTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.check(5)).toBe(true);
      expect(typeInfo.check(20)).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.identifier).toEqual("number");

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.identifier).toEqual("number");
    });

    it("exportToString", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.exportToString(5)).toEqual("5");

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.exportToString(10)).toEqual("10");
    });

    it("importFromString", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.importFromString("5")).toEqual(5);

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.importFromString("10")).toEqual(10);
    });

    it("toString", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.toString()).toEqual("NumberRangeTypeInformation{1, 10}");

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.toString()).toEqual("NumberRangeTypeInformation{2, 20}");
    });

    it("json", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.json()).toEqual({ type: "number", min: 1, max: 10 });

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.json()).toEqual({ type: "number", min: 2, max: 20 });
    });
  });

  describe("Or", () => {
    it("check", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.check("hello")).toBe(true);
      expect(typeInfo.check(42)).toBe(true);
      expect(typeInfo.check(true)).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.identifier).toEqual("or");

      const typeInfo2 = new Or(
        new StringTypeInformation("world"),
        new NumberTypeInformation(43)
      );
      expect(typeInfo2.identifier).toEqual("or");
    });

    it("exportToString", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(() => typeInfo.exportToString("hello")).toThrow(
        "Method not supported."
      );
    });

    it("importFromString", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(() => typeInfo.importFromString("hello")).toThrow(
        "Method not supported."
      );
    });

    it("toString", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.toString()).toEqual(
        "Or{StringTypeInformation{hello}, NumberTypeInformation{42}}"
      );

      const typeInfo2 = new Or(
        new StringTypeInformation("world"),
        new NumberTypeInformation(43)
      );
      expect(typeInfo2.toString()).toEqual(
        "Or{StringTypeInformation{world}, NumberTypeInformation{43}}"
      );
    });

    it("json", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.json()).toEqual({
        type: "or",
        value0: { type: "string", value: "hello" },
        value1: { type: "number", value: 42 },
      });

      const typeInfo2 = new Or(
        new StringTypeInformation("world"),
        new NumberTypeInformation(43)
      );
      expect(typeInfo2.json()).toEqual({
        type: "or",
        value0: { type: "string", value: "world" },
        value1: { type: "number", value: 43 },
      });
    });
  });

  describe("ObjectTypeInformation", () => {
    it("check", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.check({ name: "John" })).toBe(true);
      expect(typeInfo.check({ name: "John", age: 30 })).toBe(true);
      expect(typeInfo.check({ name: "Jane", age: 25 })).toBe(false);
      expect(typeInfo.check({ name: "Jane" })).toBe(false);
      expect(typeInfo.check({ name: "Jane", age: "25" })).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).not.toContain("query");
      expect(typeInfo.sendableVia()).not.toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(false);
      expect(typeInfo.sendableVia("param")).toBe(false);
    });

    it("identifier", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.identifier).toEqual("object");

      const typeInfo2 = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("Jane") },
        age: { required: false, type: new NumberTypeInformation(25) },
      });
      expect(typeInfo2.identifier).toEqual("object");
    });

    it("exportToString", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.exportToString({ name: "John" })).toEqual(
        '{"name":"John"}'
      );
    });

    it("importFromString", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.importFromString('{"name":"John"}')).toEqual({
        name: "John",
      });
    });

    it("toString", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.toString()).toEqual(
        "ObjectTypeInformation{name: {required: true, type: StringTypeInformation{John}}, age: {required: false, type: NumberTypeInformation{30}}}"
      );

      const typeInfo2 = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("Jane") },
        age: { required: false, type: new NumberTypeInformation(25) },
      });
      expect(typeInfo2.toString()).toEqual(
        "ObjectTypeInformation{name: {required: true, type: StringTypeInformation{Jane}}, age: {required: false, type: NumberTypeInformation{25}}}"
      );
    });

    it("json", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.json()).toEqual({
        type: "object",
        properties: {
          name: { required: true, type: { type: "string", value: "John" } },
          age: { required: false, type: { type: "number", value: 30 } },
        },
      });

      const typeInfo2 = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("Jane") },
        age: { required: false, type: new NumberTypeInformation(25) },
      });
      expect(typeInfo2.json()).toEqual({
        type: "object",
        properties: {
          name: { required: true, type: { type: "string", value: "Jane" } },
          age: { required: false, type: { type: "number", value: 25 } },
        },
      });
    });
  });

  describe("ArrayTypeInformation", () => {
    it("check", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.check(["hello"])).toBe(true);
      expect(typeInfo.check(["world"])).toBe(false);
      expect(typeInfo.check([123])).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).not.toContain("query");
      expect(typeInfo.sendableVia()).not.toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).not.toBe(true);
      expect(typeInfo.sendableVia("param")).not.toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.identifier).toEqual("array");

      const typeInfo2 = new ArrayTypeInformation(
        new StringTypeInformation("world")
      );
      expect(typeInfo2.identifier).toEqual("array");
    });

    it("exportToString", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.exportToString(["hello"])).toEqual('["hello"]');
    });

    it("importFromString", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.importFromString('["hello"]')).toEqual(["hello"]);
    });

    it("toString", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.toString()).toEqual(
        "ArrayTypeInformation{StringTypeInformation{hello}}"
      );

      const typeInfo2 = new ArrayTypeInformation(
        new StringTypeInformation("world")
      );
      expect(typeInfo2.toString()).toEqual(
        "ArrayTypeInformation{StringTypeInformation{world}}"
      );
    });

    it("json", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.json()).toEqual({
        type: "array",
        values: { type: "string", value: "hello" },
      });

      const typeInfo2 = new ArrayTypeInformation(
        new StringTypeInformation("world")
      );
      expect(typeInfo2.json()).toEqual({
        type: "array",
        values: { type: "string", value: "world" },
      });
    });
  });

  describe("NullTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.check(null)).toBe(true);
      expect(typeInfo.check(undefined)).toBe(false);
      expect(typeInfo.check(0)).toBe(false);
      expect(typeInfo.check("")).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.identifier).toEqual("null");
    });

    it("exportToString", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.exportToString(null)).toEqual("null");
    });

    it("importFromString", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.importFromString("null")).toEqual(null);
    });

    it("toString", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.toString()).toEqual("NullTypeInformation{}");
    });

    it("json", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.json()).toEqual({ type: "null" });
    });
  });

  describe("UndefinedTypeInformation", () => {
    it("check", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.check(undefined)).toBe(true);
      expect(typeInfo.check(null)).toBe(false);
      expect(typeInfo.check(0)).toBe(false);
      expect(typeInfo.check("")).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.identifier).toEqual("undefined");
    });

    it("exportToString", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.exportToString(undefined)).toEqual("undefined");
    });

    it("importFromString", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.importFromString("undefined")).toEqual(undefined);
    });

    it("toString", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.toString()).toEqual("UndefinedTypeInformation{}");
    });

    it("json", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.json()).toEqual({ type: "undefined" });
    });
  });

  describe("AnyStringTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.check("hello")).toBe(true);
      expect(typeInfo.check(123)).toBe(false);
      expect(typeInfo.check(null)).toBe(false);
      expect(typeInfo.check(undefined)).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.identifier).toEqual("string");
    });

    it("exportToString", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.exportToString("hello")).toEqual("hello");
    });

    it("importFromString", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.importFromString("hello")).toEqual("hello");
    });

    it("toString", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.toString()).toEqual("AnyStringTypeInformation{}");
    });

    it("json", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.json()).toEqual({ type: "string" });
    });
  });

  describe("AnyNumberTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.check(42)).toBe(true);
      expect(typeInfo.check("42")).toBe(false);
      expect(typeInfo.check(null)).toBe(false);
      expect(typeInfo.check(undefined)).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.identifier).toEqual("number");
    });

    it("exportToString", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.exportToString(42)).toEqual("42");
    });

    it("importFromString", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.importFromString("42")).toEqual(42);
    });

    it("toString", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.toString()).toEqual("AnyNumberTypeInformation{}");
    });

    it("json", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.json()).toEqual({ type: "number" });
    });
  });

  describe("AnyBooleanTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.check(true)).toBe(true);
      expect(typeInfo.check(false)).toBe(true);
      expect(typeInfo.check(0)).toBe(false);
      expect(typeInfo.check(null)).toBe(false);
      expect(typeInfo.check(undefined)).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).toContain("query");
      expect(typeInfo.sendableVia()).toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(true);
      expect(typeInfo.sendableVia("param")).toBe(true);
    });

    it("identifier", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.identifier).toEqual("boolean");
    });

    it("exportToString", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.exportToString(true)).toEqual("true");
    });

    it("importFromString", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.importFromString("true")).toEqual(true);
    });

    it("toString", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.toString()).toEqual("AnyBooleanTypeInformation{}");
    });

    it("json", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.json()).toEqual({ type: "boolean" });
    });
  });

  describe("AnyTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.check(true)).toBe(true);
      expect(typeInfo.check(42)).toBe(true);
      expect(typeInfo.check("hello")).toBe(true);
      expect(typeInfo.check({ key: "value" })).toBe(true);
    });

    it("sendableVia", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).not.toContain("query");
      expect(typeInfo.sendableVia()).not.toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(false);
      expect(typeInfo.sendableVia("param")).toBe(false);
    });

    it("identifier", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.identifier).toEqual("any");
    });

    it("exportToString", () => {
      const typeInfo = new AnyTypeInformation();
      expect(() => typeInfo.exportToString(true)).toThrow(
        "Method not supported."
      );
    });

    it("importFromString", () => {
      const typeInfo = new AnyTypeInformation();
      expect(() => typeInfo.importFromString("true")).toThrow(
        "Method not supported."
      );
    });

    it("toString", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.toString()).toEqual("AnyTypeInformation{}");
    });

    it("json", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.json()).toEqual({ type: "any" });
    });
  });

  describe("DateTypeInformation", () => {
    it("check", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.check(new Date())).toBe(true);
      expect(typeInfo.check("2020-01-01")).toBe(false);
    });

    it("sendableVia", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.sendableVia()).toContain("body");
      expect(typeInfo.sendableVia()).not.toContain("query");
      expect(typeInfo.sendableVia()).not.toContain("param");
      expect(typeInfo.sendableVia("body")).toBe(true);
      expect(typeInfo.sendableVia("query")).toBe(false);
      expect(typeInfo.sendableVia("param")).toBe(false);
    });

    it("identifier", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.identifier).toEqual("date");
    });

    it("exportToString", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.exportToString(new Date("2020-01-01"))).toEqual(
        "2020-01-01T00:00:00.000Z"
      );
    });

    it("importFromString", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.importFromString("2020-01-01T00:00:00.000Z")).toEqual(
        new Date("2020-01-01")
      );
    });

    it("toString", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.toString()).toEqual("DateTypeInformation{}");
    });

    it("json", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.json()).toEqual({ type: "date" });
    });
  });
});

describe("Creation Shortcuts", () => {
  describe("string()", () => {
    it("test any string type creation", () => {
      expect(string()).toBeInstanceOf(AnyStringTypeInformation);
    });

    it("test specific string type creation", () => {
      expect(string("hello")).toBeInstanceOf(StringTypeInformation);
      expect(string("hello").value).toEqual("hello");
    });
  });

  describe("number()", () => {
    it("test any number type creation", () => {
      expect(number()).toBeInstanceOf(AnyNumberTypeInformation);
    });

    it("test specific number type creation", () => {
      expect(number(42)).toBeInstanceOf(NumberTypeInformation);
      expect(number(42).value).toEqual(42);
    });

    it("test number range type creation", () => {
      expect(number(1, 10)).toBeInstanceOf(NumberRangeTypeInformation);
      expect(number(1, 10).min).toEqual(1);
      expect(number(1, 10).max).toEqual(10);
    });
  });

  describe("numberRange()", () => {
    it("test number range type creation", () => {
      expect(numberRange(1, 10)).toBeInstanceOf(NumberRangeTypeInformation);
      expect(numberRange(1, 10).min).toEqual(1);
      expect(numberRange(1, 10).max).toEqual(10);
    });
  });

  describe("object()", () => {
    it("test object type creation", () => {
      expect(object({})).toBeInstanceOf(ObjectTypeInformation);
      expect(object({}).properties).toEqual({});
    });
  });

  describe("array()", () => {
    it("test array type creation", () => {
      expect(array(string())).toBeInstanceOf(ArrayTypeInformation);
      expect(array(string()).values).toBeInstanceOf(AnyStringTypeInformation);
    });
  });

  describe("or()", () => {
    it("test or type creation", () => {
      const typeInfo = or(string(), number());
      expect(typeInfo).toBeInstanceOf(Or);
      expect(typeInfo.value0).toBeInstanceOf(AnyStringTypeInformation);
      expect(typeInfo.value1).toBeInstanceOf(AnyNumberTypeInformation);
    });

    it("test or type creation with 3 arguments", () => {
      const typeInfo = or(string(), number(), object({}));
      expect(typeInfo).toBeInstanceOf(Or);
      expect(typeInfo.value0).toBeInstanceOf(Or);
      expect(typeInfo.value0.value0).toBeInstanceOf(AnyStringTypeInformation);
      expect(typeInfo.value0.value1).toBeInstanceOf(AnyNumberTypeInformation);
      expect(typeInfo.value1).toBeInstanceOf(ObjectTypeInformation);
    });

    it("test or type creation with 4 arguments", () => {
      const typeInfo = or(string(), number(), string(), object({}));
      expect(typeInfo).toBeInstanceOf(Or);
      expect(typeInfo.value0).toBeInstanceOf(Or);
      expect(typeInfo.value0.value0).toBeInstanceOf(Or);
      expect(typeInfo.value0.value0.value0).toBeInstanceOf(
        AnyStringTypeInformation
      );
      expect(typeInfo.value0.value0.value1).toBeInstanceOf(
        AnyNumberTypeInformation
      );
      expect(typeInfo.value0.value1).toBeInstanceOf(AnyStringTypeInformation);
      expect(typeInfo.value1).toBeInstanceOf(ObjectTypeInformation);
    });
  });

  describe("any()", () => {
    it("test any type creation", () => {
      expect(any()).toBeInstanceOf(AnyTypeInformation);
    });
  });

  describe("nullType()", () => {
    it("test null type creation", () => {
      expect(nullType()).toBeInstanceOf(NullTypeInformation);
    });
  });

  describe("undefinedType()", () => {
    it("test undefined type creation", () => {
      expect(undefinedType()).toBeInstanceOf(UndefinedTypeInformation);
    });
  });

  describe("boolean()", () => {
    it("test any boolean type creation", () => {
      expect(boolean()).toBeInstanceOf(AnyBooleanTypeInformation);
    });
  });

  describe("trueType()", () => {
    it("test true type creation", () => {
      expect(trueType()).toBeInstanceOf(BooleanTypeInformation);
      expect(trueType().value).toBe(true);
    });
  });

  describe("falseType()", () => {
    it("test false type creation", () => {
      expect(falseType()).toBeInstanceOf(BooleanTypeInformation);
      expect(falseType().value).toBe(false);
    });
  });

  describe("date()", () => {
    it("test date type creation", () => {
      expect(date()).toBeInstanceOf(DateTypeInformation);
    });
  });
});

describe("ConversionRegister", () => {
  describe("instance", () => {
    it("test instance contains instance of ConversionRegister", () => {
      expect(ConversionRegister.instance).toBeInstanceOf(ConversionRegister);
    });
  });

  describe("constructor", () => {
    it("test constructor", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister).toBeInstanceOf(ConversionRegister);
    });
  });

  describe("register", () => {
    it("register should register a new conversion", () => {
      const conversionRegister = new ConversionRegister([]);
      const type = new StringTypeInformation("hello");

      conversionRegister.register(
        type,
        "hello",
        (value) => JSON.stringify(value),
        (value) => JSON.parse(value)
      );

      expect(conversionRegister.entries).toHaveLength(1);
      expect(conversionRegister.entries[0].type).toEqual(type);
      expect(conversionRegister.entries[0].identifier).toEqual("hello");
      expect(conversionRegister.entries[0].exportToString("hello")).toEqual(
        '"hello"'
      );
      expect(conversionRegister.entries[0].importFromString('"hello"')).toEqual(
        "hello"
      );
    });
  });

  describe("exportToString", () => {
    it("exportToString should export a value to string using the given conversion", () => {
      const typeInfo = new StringTypeInformation("hello");
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.exportToString("hello")).toEqual(
        '@hello:"hello"'
      );
    });

    it("exportToString with multiple conversations", () => {
      const typeInfo = string("hello");
      const typeInfo2 = string("world");
      const typeInfo3 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "world",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo3,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.exportToString("hello")).toEqual(
        '@hello:"hello"'
      );
      expect(conversionRegister.exportToString("world")).toEqual(
        '@world:"world"'
      );
      expect(conversionRegister.exportToString(42)).toEqual("@number:42");
    });

    it("exportToString should throw an error if no conversion is found", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(() => conversionRegister.exportToString("hello")).toThrow(
        "Unsupported type: String"
      );

      expect(() => conversionRegister.exportToString(42)).toThrow(
        "Unsupported type: Number"
      );

      expect(() => conversionRegister.exportToString(null)).toThrow(
        "Unsupported type: Null"
      );

      expect(() => conversionRegister.exportToString(undefined)).toThrow(
        "Unsupported type: undefined"
      );
    });
  });

  describe("importFromString", () => {
    it("importFromString should import a value from string using the given conversion", () => {
      const typeInfo = new StringTypeInformation("hello");
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.importFromString('@hello:"hello"')).toEqual(
        "hello"
      );
    });

    it("importFromString with multiple conversations", () => {
      const typeInfo = string("hello");
      const typeInfo2 = string("world");
      const typeInfo3 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "hello",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "world",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo3,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.importFromString('@hello:"hello"')).toEqual(
        "hello"
      );
      expect(conversionRegister.importFromString('@world:"world"')).toEqual(
        "world"
      );
      expect(conversionRegister.importFromString("@number:42")).toEqual(42);
    });

    it("importFromString should throw an error if no conversion is found", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(() =>
        conversionRegister.importFromString('@hello:"hello"')
      ).toThrow("Unsupported type for identifier: hello");

      expect(() =>
        conversionRegister.importFromString('@world:"world"')
      ).toThrow("Unsupported type for identifier: world");

      expect(() => conversionRegister.importFromString("@number:42")).toThrow(
        "Unsupported type for identifier: number"
      );
    });

    it("should passthrough if no @identifier is declared", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString("hello")).toEqual("hello");
      expect(conversionRegister.importFromString("world")).toEqual("world");
      expect(conversionRegister.importFromString("42")).toEqual("42");
    });

    it("test escaped @identifier", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString('\\@hello:"hello"')).toEqual(
        '@hello:"hello"'
      );
    });

    it("test escaped \\ character at begining", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString("\\\\@hello")).toEqual(
        "\\@hello"
      );
    });
  });

  describe("exportObjectToString", () => {
    it("exportObjectToString should export an object's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.exportObjectToString({
          name: "John",
          age: 42,
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
      });
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.exportObjectToString(
          {
            name: "John",
            age: 42,
          },
          (it) => typeof it === "string"
        )
      ).toEqual({
        name: "John",
        age: "@number:42",
      });
    });
  });

  describe("importObjectFromString", () => {
    it("importObjectFromString should import an object's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.importObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          age2: 42,
        })
      ).toEqual({
        name: "John",
        age: 42,
        age2: 42,
      });
    });
  });

  describe("exportArrayToString", () => {
    it("exportArrayToString should export an array's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.exportArrayToString(["John", 42])).toEqual([
        '@string:"John"',
        "@number:42",
      ]);
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.exportArrayToString(
          ["John", 42],
          (it) => typeof it === "string"
        )
      ).toEqual(["John", "@number:42"]);
    });
  });

  describe("importArrayFromString", () => {
    it("importArrayFromString should import an array's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.importArrayFromString([
          '@string:"John"',
          "@number:42",
          42,
        ])
      ).toEqual(["John", 42, 42]);
    });
  });

  describe("deepExportObjectToString", () => {
    it("deepExportObjectToString should export an object's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
      });
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString(
          {
            name: "John",
            age: 42,
          },
          (it) => typeof it === "string"
        )
      ).toEqual({
        name: "John",
        age: "@number:42",
      });
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
          address: {
            street: "street",
            number: 42,
          },
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
        address: {
          street: '@string:"street"',
          number: "@number:42",
        },
      });
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
          address: ["street", 42],
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
        address: ['@string:"street"', "@number:42"],
      });
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportObjectToString({
          name: "John",
          age: 42,
          address: null,
        })
      ).toEqual({
        name: '@string:"John"',
        age: "@number:42",
        address: null,
      });
    });
  });

  describe("deepImportObjectFromString", () => {
    it("deepImportObjectFromString should import an object's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          age2: 42,
        })
      ).toEqual({
        name: "John",
        age: 42,
        age2: 42,
      });
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => JSON.stringify(value),
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          address: {
            street: '@string:"street"',
            number: "@number:42",
          },
        })
      ).toEqual({
        name: "John",
        age: 42,
        address: {
          street: "street",
          number: 42,
        },
      });
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          address: ['@string:"street"', "@number:42"],
        })
      ).toEqual({
        name: "John",
        age: 42,
        address: ["street", 42],
      });
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportObjectFromString({
          name: '@string:"John"',
          age: "@number:42",
          address: null,
        })
      ).toEqual({
        name: "John",
        age: 42,
        address: null,
      });
    });
  });

  describe("deepExportArrayToString", () => {
    it("deepExportArrayToString should export an array's contents to string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(conversionRegister.deepExportArrayToString(["John", 42])).toEqual([
        '@string:"John"',
        "@number:42",
      ]);
    });

    it("Don't export if value is compatible with conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString(
          ["John", 42],
          (it) => typeof it === "string"
        )
      ).toEqual(["John", "@number:42"]);
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString([
          "John",
          42,
          {
            street: "street",
            number: 42,
          },
        ])
      ).toEqual([
        '@string:"John"',
        "@number:42",
        {
          street: '@string:"street"',
          number: "@number:42",
        },
      ]);
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString(["John", 42, ["street", 42]])
      ).toEqual([
        '@string:"John"',
        "@number:42",
        ['@string:"street"', "@number:42"],
      ]);
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepExportArrayToString(["John", 42, null])
      ).toEqual(['@string:"John"', "@number:42", null]);
    });
  });

  describe("deepImportArrayFromString", () => {
    it("deepImportArrayFromString should import an array's contents from string using the given conversion", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          42,
        ])
      ).toEqual(["John", 42, 42]);
    });

    it("test with nested objects", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          {
            street: '@string:"street"',
            number: "@number:42",
          },
        ])
      ).toEqual(["John", 42, { street: "street", number: 42 }]);
    });

    it("test with nested arrays", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          ['@string:"street"', "@number:42"],
        ])
      ).toEqual(["John", 42, ["street", 42]]);
    });

    it("test with null values (they should be ignored)", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return JSON.stringify(value);
          },
          importFromString: (value) => JSON.parse(value),
        },
      ]);

      expect(
        conversionRegister.deepImportArrayFromString([
          '@string:"John"',
          "@number:42",
          null,
        ])
      ).toEqual(["John", 42, null]);
    });
  });

  describe("deepExportToString", () => {
    it("Test with object", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
      ]);

      expect(
        conversionRegister.deepExportToString({
          name: "John",
          age: 42,
          address: {
            street: "street",
            number: 42,
          },
        })
      ).toEqual({
        name: "@string:John",
        age: "@number:42",
        address: {
          street: "@string:street",
          number: "@number:42",
        },
      });
    });

    it("Test with array", () => {
      const typeInfo = string();
      const typeInfo2 = number();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
      ]);

      expect(
        conversionRegister.deepExportToString(["John", 42, ["street", 42]])
      ).toEqual([
        "@string:John",
        "@number:42",
        ["@string:street", "@number:42"],
      ]);
    });

    it("Test with unsupported type", () => {
      const typeInfo = string();
      const typeInfo2 = number();
      const typeInfo3 = boolean();

      const conversionRegister = new ConversionRegister([
        {
          type: typeInfo,
          identifier: "string",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
        {
          type: typeInfo2,
          identifier: "number",
          exportToString: (value) => {
            return value;
          },
          importFromString: (value) => value,
        },
      ]);

      expect(() => conversionRegister.deepExportToString(true)).toThrow(
        "Unsupported type"
      );
    });
  });
});
