import {
  AnyNumberTypeInformation,
  NumberTypeInformation,
  number,
} from "./number";
import { ObjectTypeInformation, object } from "./object";
import { Or, or } from "./or";
import {
  AnyStringTypeInformation,
  StringTypeInformation,
  string,
} from "./string";

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
