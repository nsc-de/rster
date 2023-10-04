import { AnyTypeInformation, any, nullType, undefinedType } from "./misc";
import { NullTypeInformation } from "./misc";
import { UndefinedTypeInformation } from "./misc";

describe("NullTypeInformation", () => {
  it("check", () => {
    const typeInfo = new NullTypeInformation();
    expect(typeInfo.check(null)).toBe(true);
    expect(typeInfo.check(undefined)).toBe(false);
    expect(typeInfo.check(0)).toBe(false);
    expect(typeInfo.check("")).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new NullTypeInformation();
    expect(typeInfo.checkError(null)).toBeUndefined();
    expect(typeInfo.checkError(undefined)).toEqual("Not null, but a undefined");
    expect(typeInfo.checkError(0)).toEqual("Not null, but a number");
    expect(typeInfo.checkError("")).toEqual("Not null, but a string");
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
    // @ts-ignore
    expect(typeInfo.exportToString(null)).toEqual("null");
  });

  it("importFromString", () => {
    const typeInfo = new NullTypeInformation();
    // @ts-ignore
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

  it("checkError", () => {
    const typeInfo = new UndefinedTypeInformation();
    expect(typeInfo.checkError(undefined)).toBeUndefined();
    expect(typeInfo.checkError(null)).toEqual("Not undefined, but a object");
    expect(typeInfo.checkError(0)).toEqual("Not undefined, but a number");
    expect(typeInfo.checkError("")).toEqual("Not undefined, but a string");
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
    // @ts-ignore
    expect(typeInfo.exportToString(undefined)).toEqual("undefined");
  });

  it("importFromString", () => {
    const typeInfo = new UndefinedTypeInformation();
    // @ts-ignore
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

describe("AnyTypeInformation", () => {
  it("check", () => {
    const typeInfo = new AnyTypeInformation();
    expect(typeInfo.check(true)).toBe(true);
    expect(typeInfo.check(42)).toBe(true);
    expect(typeInfo.check("hello")).toBe(true);
    expect(typeInfo.check({ key: "value" })).toBe(true);
  });

  it("checkError", () => {
    const typeInfo = new AnyTypeInformation();
    expect(typeInfo.checkError(true)).toBeUndefined();
    expect(typeInfo.checkError(42)).toBeUndefined();
    expect(typeInfo.checkError("hello")).toBeUndefined();
    expect(typeInfo.checkError({ key: "value" })).toBeUndefined();
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
