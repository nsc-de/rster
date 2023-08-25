const { expect } = require("chai");
const {
  StringTypeInformation,
  NumberTypeInformation,
  NumberRangeTypeInformation,
  Or,
  ObjectTypeInformation,
  NullTypeInformation,
  UndefinedTypeInformation,
  AnyStringTypeInformation,
  AnyNumberTypeInformation,
  AnyBooleanTypeInformation,
  AnyTypeInformation,
  DateTypeInformation,
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
      console.log(typeInfo);
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
