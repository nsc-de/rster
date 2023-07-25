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
} = require("./types");

describe("TypeInformation", () => {
  describe("StringTypeInformation", () => {
    it("check", () => {
      const typeInfo = new StringTypeInformation("hello");
      expect(typeInfo.check("hello")).to.be.true;
      expect(typeInfo.check(123)).to.be.false;
    });
  });

  describe("NumberTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NumberTypeInformation(42);
      expect(typeInfo.check(42)).to.be.true;
      expect(typeInfo.check("42")).to.be.false;
    });
  });

  describe("NumberRangeTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NumberRangeTypeInformation(1, 10);
      expect(typeInfo.check(5)).to.be.true;
      expect(typeInfo.check(20)).to.be.false;
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
  });

  describe("NullTypeInformation", () => {
    it("check", () => {
      const typeInfo = new NullTypeInformation();
      expect(typeInfo.check(null)).to.be.true;
      expect(typeInfo.check(undefined)).to.be.false;
      expect(typeInfo.check(0)).to.be.false;
      expect(typeInfo.check("")).to.be.false;
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
  });

  describe("AnyStringTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyStringTypeInformation();
      expect(typeInfo.check("hello")).to.be.true;
      expect(typeInfo.check(123)).to.be.false;
      expect(typeInfo.check(null)).to.be.false;
      expect(typeInfo.check(undefined)).to.be.false;
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
  });

  describe("AnyTypeInformation", () => {
    it("check", () => {
      const typeInfo = new AnyTypeInformation();
      expect(typeInfo.check(true)).to.be.true;
      expect(typeInfo.check(42)).to.be.true;
      expect(typeInfo.check("hello")).to.be.true;
      expect(typeInfo.check({ key: "value" })).to.be.true;
    });
  });
});
