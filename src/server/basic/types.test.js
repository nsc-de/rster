const { expect } = require("chai");
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
      expect(typeInfo.check("hello")).to.be.true;
      expect(typeInfo.check("world")).to.be.false;
      expect(typeInfo.check(123)).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.identifier).to.equal("string");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.identifier).to.equal("string");
    });

    it("exportToString", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.exportToString("hello")).to.equal("hello");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.exportToString("world")).to.equal("world");
    });

    it("importFromString", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.importFromString("hello")).to.equal("hello");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.importFromString("world")).to.equal("world");
    });

    it("toString", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.toString()).to.equal("StringTypeInformation{hello}");

      const typeInfo2 = new StringTypeInformation("world");
      expect(typeInfo2.toString()).to.equal("StringTypeInformation{world}");
    });
  });

  describe("NumberTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.check(42)).to.be.true;
      expect(typeInfo.check("42")).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.identifier).to.equal("number");

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.identifier).to.equal("number");
    });

    it("exportToString", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.exportToString(42)).to.equal("42");

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.exportToString(43)).to.equal("43");
    });

    it("importFromString", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.importFromString("42")).to.equal(42);

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.importFromString("43")).to.equal(43);
    });

    it("toString", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.toString()).to.equal("NumberTypeInformation{42}");

      const typeInfo2 = new NumberTypeInformation(43);
      expect(typeInfo2.toString()).to.equal("NumberTypeInformation{43}");
    });
  });

  describe("BooleanTypeInformation", () => {
    it("check", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.check(true)).to.be.true;
      expect(typeInfo.check(false)).to.be.false;
      expect(typeInfo.check(0)).to.be.false;
      expect(typeInfo.check("true")).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).not.to.include("query");
      expect(typeInfo.sendableVia()).not.to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.false;
      expect(typeInfo.sendableVia("param")).to.be.false;
    });

    it("identifier", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.identifier).to.equal("boolean");
    });

    it("exportToString", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.exportToString(true)).to.equal("true");
      expect(typeInfo.exportToString(false)).to.equal("false");
    });

    it("importFromString", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.importFromString("true")).to.equal(true);
      expect(typeInfo.importFromString("false")).to.equal(false);
    });

    it("toString", () => {
      const typeInfo = new BooleanTypeInformation(true);
      expect(typeInfo.toString()).to.equal("BooleanTypeInformation{true}");
    });
  });

  describe("NumberRangeTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.check(5)).to.be.true;
      expect(typeInfo.check(20)).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.identifier).to.equal("number");

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.identifier).to.equal("number");
    });

    it("exportToString", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.exportToString(5)).to.equal("5");

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.exportToString(10)).to.equal("10");
    });

    it("importFromString", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.importFromString("5")).to.equal(5);

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.importFromString("10")).to.equal(10);
    });

    it("toString", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.toString()).to.equal("NumberRangeTypeInformation{1, 10}");

      const typeInfo2 = new NumberRangeTypeInformation(2, 20);
      expect(typeInfo2.toString()).to.equal(
        "NumberRangeTypeInformation{2, 20}"
      );
    });
  });

  describe("Or", () => {
    it("check", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.check("hello")).to.be.true;
      expect(typeInfo.check(42)).to.be.true;
      expect(typeInfo.check(true)).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.identifier).to.equal("or");

      const typeInfo2 = new Or(
        new StringTypeInformation("world"),
        new NumberTypeInformation(43)
      );
      expect(typeInfo2.identifier).to.equal("or");
    });

    it("exportToString", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(() => typeInfo.exportToString("hello")).to.throw(
        "Method not supported."
      );
    });

    it("importFromString", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(() => typeInfo.importFromString("hello")).to.throw(
        "Method not supported."
      );
    });

    it("toString", () => {
      const typeInfo = new Or(
        new StringTypeInformation("hello"),
        new NumberTypeInformation(42)
      );
      expect(typeInfo.toString()).to.equal(
        "Or{StringTypeInformation{hello}, NumberTypeInformation{42}}"
      );

      const typeInfo2 = new Or(
        new StringTypeInformation("world"),
        new NumberTypeInformation(43)
      );
      expect(typeInfo2.toString()).to.equal(
        "Or{StringTypeInformation{world}, NumberTypeInformation{43}}"
      );
    });
  });

  describe("ObjectTypeInformation", () => {
    it("check", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.check({ name: "John" })).to.be.true;
      expect(typeInfo.check({ name: "John", age: 30 })).to.be.true;
      expect(typeInfo.check({ name: "Jane", age: 25 })).to.be.false;
      expect(typeInfo.check({ name: "Jane" })).to.be.false;
      expect(typeInfo.check({ name: "Jane", age: "25" })).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).not.to.include("query");
      expect(typeInfo.sendableVia()).not.to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.false;
      expect(typeInfo.sendableVia("param")).to.be.false;
    });

    it("identifier", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.identifier).to.equal("object");

      const typeInfo2 = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("Jane") },
        age: { required: false, type: new NumberTypeInformation(25) },
      });
      expect(typeInfo2.identifier).to.equal("object");
    });

    it("exportToString", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.exportToString({ name: "John" })).to.deep.equal(
        '{"name":"John"}'
      );
    });

    it("importFromString", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.importFromString('{"name":"John"}')).to.deep.equal({
        name: "John",
      });
    });

    it("toString", () => {
      const typeInfo = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("John") },
        age: { required: false, type: new NumberTypeInformation(30) },
      });
      expect(typeInfo.toString()).to.equal(
        "ObjectTypeInformation{name: {required: true, type: StringTypeInformation{John}}, age: {required: false, type: NumberTypeInformation{30}}}"
      );

      const typeInfo2 = new ObjectTypeInformation({
        name: { required: true, type: new StringTypeInformation("Jane") },
        age: { required: false, type: new NumberTypeInformation(25) },
      });
      expect(typeInfo2.toString()).to.equal(
        "ObjectTypeInformation{name: {required: true, type: StringTypeInformation{Jane}}, age: {required: false, type: NumberTypeInformation{25}}}"
      );
    });
  });

  describe("ArrayTypeInformation", () => {
    it("check", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.check(["hello"])).to.be.true;
      expect(typeInfo.check(["world"])).to.be.false;
      expect(typeInfo.check([123])).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).not.to.include("query");
      expect(typeInfo.sendableVia()).not.to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).not.to.be.true;
      expect(typeInfo.sendableVia("param")).not.to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.identifier).to.equal("array");

      const typeInfo2 = new ArrayTypeInformation(
        new StringTypeInformation("world")
      );
      expect(typeInfo2.identifier).to.equal("array");
    });

    it("exportToString", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.exportToString(["hello"])).to.deep.equal('["hello"]');
    });

    it("importFromString", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.importFromString('["hello"]')).to.deep.equal(["hello"]);
    });

    it("toString", () => {
      const typeInfo = new ArrayTypeInformation(
        new StringTypeInformation("hello")
      );
      expect(typeInfo.toString()).to.equal(
        "ArrayTypeInformation{StringTypeInformation{hello}}"
      );

      const typeInfo2 = new ArrayTypeInformation(
        new StringTypeInformation("world")
      );
      expect(typeInfo2.toString()).to.equal(
        "ArrayTypeInformation{StringTypeInformation{world}}"
      );
    });
  });

  describe("NullTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.check(null)).to.be.true;
      expect(typeInfo.check(undefined)).to.be.false;
      expect(typeInfo.check(0)).to.be.false;
      expect(typeInfo.check("")).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.identifier).to.equal("null");
    });

    it("exportToString", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.exportToString(null)).to.equal("null");
    });

    it("importFromString", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.importFromString("null")).to.equal(null);
    });

    it("toString", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.toString()).to.equal("NullTypeInformation{}");
    });
  });

  describe("UndefinedTypeInformation", () => {
    it("check", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.check(undefined)).to.be.true;
      expect(typeInfo.check(null)).to.be.false;
      expect(typeInfo.check(0)).to.be.false;
      expect(typeInfo.check("")).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.identifier).to.equal("undefined");
    });

    it("exportToString", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.exportToString(undefined)).to.equal("undefined");
    });

    it("importFromString", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.importFromString("undefined")).to.equal(undefined);
    });

    it("toString", () => {
      const typeInfo = new UndefinedTypeInformation();
      expect(typeInfo.toString()).to.equal("UndefinedTypeInformation{}");
    });
  });

  describe("AnyStringTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.check("hello")).to.be.true;
      expect(typeInfo.check(123)).to.be.false;
      expect(typeInfo.check(null)).to.be.false;
      expect(typeInfo.check(undefined)).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.identifier).to.equal("string");
    });

    it("exportToString", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.exportToString("hello")).to.equal("hello");
    });

    it("importFromString", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.importFromString("hello")).to.equal("hello");
    });

    it("toString", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.toString()).to.equal("AnyStringTypeInformation{}");
    });
  });

  describe("AnyNumberTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.check(42)).to.be.true;
      expect(typeInfo.check("42")).to.be.false;
      expect(typeInfo.check(null)).to.be.false;
      expect(typeInfo.check(undefined)).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.identifier).to.equal("number");
    });

    it("exportToString", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.exportToString(42)).to.equal("42");
    });

    it("importFromString", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.importFromString("42")).to.equal(42);
    });

    it("toString", () => {
      const typeInfo = new AnyNumberTypeInformation();
      expect(typeInfo.toString()).to.equal("AnyNumberTypeInformation{}");
    });
  });

  describe("AnyBooleanTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.check(true)).to.be.true;
      expect(typeInfo.check(false)).to.be.true;
      expect(typeInfo.check(0)).to.be.false;
      expect(typeInfo.check(null)).to.be.false;
      expect(typeInfo.check(undefined)).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).to.include("query");
      expect(typeInfo.sendableVia()).to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.true;
      expect(typeInfo.sendableVia("param")).to.be.true;
    });

    it("identifier", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.identifier).to.equal("boolean");
    });

    it("exportToString", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.exportToString(true)).to.equal("true");
    });

    it("importFromString", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.importFromString("true")).to.equal(true);
    });

    it("toString", () => {
      const typeInfo = new AnyBooleanTypeInformation();
      expect(typeInfo.toString()).to.equal("AnyBooleanTypeInformation{}");
    });
  });

  describe("AnyTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.check(true)).to.be.true;
      expect(typeInfo.check(42)).to.be.true;
      expect(typeInfo.check("hello")).to.be.true;
      expect(typeInfo.check({ key: "value" })).to.be.true;
    });

    it("sendableVia", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).not.to.include("query");
      expect(typeInfo.sendableVia()).not.to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.false;
      expect(typeInfo.sendableVia("param")).to.be.false;
    });

    it("identifier", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.identifier).to.equal("any");
    });

    it("exportToString", () => {
      const typeInfo = new AnyTypeInformation();
      expect(() => typeInfo.exportToString(true)).to.throw(
        "Method not supported."
      );
    });

    it("importFromString", () => {
      const typeInfo = new AnyTypeInformation();
      expect(() => typeInfo.importFromString("true")).to.throw(
        "Method not supported."
      );
    });

    it("toString", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.toString()).to.equal("AnyTypeInformation{}");
    });
  });

  describe("DateTypeInformation", () => {
    it("check", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.check(new Date())).to.be.true;
      expect(typeInfo.check("2020-01-01")).to.be.false;
    });

    it("sendableVia", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.sendableVia()).to.include("body");
      expect(typeInfo.sendableVia()).not.to.include("query");
      expect(typeInfo.sendableVia()).not.to.include("param");
      expect(typeInfo.sendableVia("body")).to.be.true;
      expect(typeInfo.sendableVia("query")).to.be.false;
      expect(typeInfo.sendableVia("param")).to.be.false;
    });

    it("identifier", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.identifier).to.equal("date");
    });

    it("exportToString", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.exportToString(new Date("2020-01-01"))).to.equal(
        "2020-01-01T00:00:00.000Z"
      );
    });

    it("importFromString", () => {
      const typeInfo = new DateTypeInformation();
      expect(
        typeInfo.importFromString("2020-01-01T00:00:00.000Z")
      ).to.deep.equal(new Date("2020-01-01"));
    });

    it("toString", () => {
      const typeInfo = new DateTypeInformation();
      expect(typeInfo.toString()).to.equal("DateTypeInformation{}");
    });
  });
});

describe("Creation Shortcuts", () => {
  describe("string()", () => {
    it("test any string type creation", () => {
      expect(string()).be.instanceOf(AnyStringTypeInformation);
    });

    it("test specific string type creation", () => {
      expect(string("hello")).be.instanceOf(StringTypeInformation);
      expect(string("hello").value).to.equal("hello");
    });
  });

  describe("number()", () => {
    it("test any number type creation", () => {
      expect(number()).be.instanceOf(AnyNumberTypeInformation);
    });

    it("test specific number type creation", () => {
      expect(number(42)).be.instanceOf(NumberTypeInformation);
      expect(number(42).value).to.equal(42);
    });

    it("test number range type creation", () => {
      expect(number(1, 10)).be.instanceOf(NumberRangeTypeInformation);
      expect(number(1, 10).min).to.equal(1);
      expect(number(1, 10).max).to.equal(10);
    });
  });

  describe("numberRange()", () => {
    it("test number range type creation", () => {
      expect(numberRange(1, 10)).be.instanceOf(NumberRangeTypeInformation);
      expect(numberRange(1, 10).min).to.equal(1);
      expect(numberRange(1, 10).max).to.equal(10);
    });
  });

  describe("object()", () => {
    it("test object type creation", () => {
      expect(object({})).be.instanceOf(ObjectTypeInformation);
      expect(object({}).properties).to.deep.equal({});
    });
  });

  describe("array()", () => {
    it("test array type creation", () => {
      expect(array(string())).be.instanceOf(ArrayTypeInformation);
      expect(array(string()).values).to.be.instanceOf(AnyStringTypeInformation);
    });
  });

  describe("or()", () => {
    it("test or type creation", () => {
      const typeInfo = or(string(), number());
      expect(typeInfo).be.instanceOf(Or);
      expect(typeInfo.value0).to.be.instanceOf(AnyStringTypeInformation);
      expect(typeInfo.value1).to.be.instanceOf(AnyNumberTypeInformation);
    });

    it("test or type creation with 3 arguments", () => {
      const typeInfo = or(string(), number(), object({}));
      expect(typeInfo).be.instanceOf(Or);
      expect(typeInfo.value0).to.be.instanceOf(Or);
      expect(typeInfo.value0.value0).to.be.instanceOf(AnyStringTypeInformation);
      expect(typeInfo.value0.value1).to.be.instanceOf(AnyNumberTypeInformation);
      expect(typeInfo.value1).to.be.instanceOf(ObjectTypeInformation);
    });

    it("test or type creation with 4 arguments", () => {
      const typeInfo = or(string(), number(), string(), object({}));
      expect(typeInfo).be.instanceOf(Or);
      expect(typeInfo.value0).to.be.instanceOf(Or);
      expect(typeInfo.value0.value0).to.be.instanceOf(Or);
      expect(typeInfo.value0.value0.value0).to.be.instanceOf(
        AnyStringTypeInformation
      );
      expect(typeInfo.value0.value0.value1).to.be.instanceOf(
        AnyNumberTypeInformation
      );
      expect(typeInfo.value0.value1).to.be.instanceOf(AnyStringTypeInformation);
      expect(typeInfo.value1).to.be.instanceOf(ObjectTypeInformation);
    });
  });

  describe("any()", () => {
    it("test any type creation", () => {
      expect(any()).be.instanceOf(AnyTypeInformation);
    });
  });

  describe("nullType()", () => {
    it("test null type creation", () => {
      expect(nullType()).be.instanceOf(NullTypeInformation);
    });
  });

  describe("undefinedType()", () => {
    it("test undefined type creation", () => {
      expect(undefinedType()).be.instanceOf(UndefinedTypeInformation);
    });
  });

  describe("boolean()", () => {
    it("test any boolean type creation", () => {
      expect(boolean()).be.instanceOf(AnyBooleanTypeInformation);
    });
  });

  describe("trueType()", () => {
    it("test true type creation", () => {
      expect(trueType()).be.instanceOf(BooleanTypeInformation);
      expect(trueType().value).to.be.true;
    });
  });

  describe("falseType()", () => {
    it("test false type creation", () => {
      expect(falseType()).be.instanceOf(BooleanTypeInformation);
      expect(falseType().value).to.be.false;
    });
  });

  describe("date()", () => {
    it("test date type creation", () => {
      expect(date()).be.instanceOf(DateTypeInformation);
    });
  });
});

describe("ConversionRegister", () => {
  describe("instance", () => {
    it("test instance contains instance of ConversionRegister", () => {
      expect(ConversionRegister.instance).to.be.instanceOf(ConversionRegister);
    });
  });

  describe("constructor", () => {
    it("test constructor", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister).to.be.instanceOf(ConversionRegister);
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

      expect(conversionRegister.entries).to.have.lengthOf(1);
      expect(conversionRegister.entries[0].type).to.equal(type);
      expect(conversionRegister.entries[0].identifier).to.equal("hello");
      expect(conversionRegister.entries[0].exportToString("hello")).to.equal(
        '"hello"'
      );
      expect(
        conversionRegister.entries[0].importFromString('"hello"')
      ).to.equal("hello");
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

      expect(conversionRegister.exportToString("hello")).to.equal(
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

      expect(conversionRegister.exportToString("hello")).to.equal(
        '@hello:"hello"'
      );
      expect(conversionRegister.exportToString("world")).to.equal(
        '@world:"world"'
      );
      expect(conversionRegister.exportToString(42)).to.equal("@number:42");
    });

    it("exportToString should throw an error if no conversion is found", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(() => conversionRegister.exportToString("hello")).to.throw(
        "Unsupported type: String"
      );

      expect(() => conversionRegister.exportToString(42)).to.throw(
        "Unsupported type: Number"
      );

      expect(() => conversionRegister.exportToString(null)).to.throw(
        "Unsupported type: Null"
      );

      expect(() => conversionRegister.exportToString(undefined)).to.throw(
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

      expect(
        conversionRegister.importFromString('@hello:"hello"')
      ).to.deep.equal("hello");
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

      expect(
        conversionRegister.importFromString('@hello:"hello"')
      ).to.deep.equal("hello");
      expect(
        conversionRegister.importFromString('@world:"world"')
      ).to.deep.equal("world");
      expect(conversionRegister.importFromString("@number:42")).to.deep.equal(
        42
      );
    });

    it("importFromString should throw an error if no conversion is found", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(() =>
        conversionRegister.importFromString('@hello:"hello"')
      ).to.throw("Unsupported type for identifier: hello");

      expect(() =>
        conversionRegister.importFromString('@world:"world"')
      ).to.throw("Unsupported type for identifier: world");

      expect(() => conversionRegister.importFromString("@number:42")).to.throw(
        "Unsupported type for identifier: number"
      );
    });

    it("should passthrough if no @identifier is declared", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString("hello")).to.deep.equal(
        "hello"
      );
      expect(conversionRegister.importFromString("world")).to.deep.equal(
        "world"
      );
      expect(conversionRegister.importFromString("42")).to.deep.equal("42");
    });

    it("test escaped @identifier", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(
        conversionRegister.importFromString('\\@hello:"hello"')
      ).to.deep.equal('@hello:"hello"');
    });

    it("test escaped \\ character at begining", () => {
      const conversionRegister = new ConversionRegister([]);
      expect(conversionRegister.importFromString("\\\\@hello")).to.deep.equal(
        "\\@hello"
      );
    });
  });
});
