import {
  AnyStringTypeInformation,
  StringTypeInformation,
  string,
} from "./string";

describe("StringTypeInformation", () => {
  it("check", () => {
    const typeInfo = new StringTypeInformation("hello");
    expect(typeInfo.check("hello")).toBe(true);
    expect(typeInfo.check("world")).toBe(false);
    expect(typeInfo.check(123)).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new StringTypeInformation("hello");
    expect(typeInfo.checkError("hello")).toBeUndefined();
    expect(typeInfo.checkError("world")).toEqual(
      "Not the string hello, but world"
    );
    expect(typeInfo.checkError(123)).toEqual("Not a string, but a number");
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

describe("AnyStringTypeInformation", () => {
  it("check", () => {
    const typeInfo = new AnyStringTypeInformation();
    expect(typeInfo.check("hello")).toBe(true);
    expect(typeInfo.check(123)).toBe(false);
    expect(typeInfo.check(null)).toBe(false);
    expect(typeInfo.check(undefined)).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new AnyStringTypeInformation();
    expect(typeInfo.checkError("hello")).toBeUndefined();
    expect(typeInfo.checkError(123)).toEqual("Not a string, but a number");
    expect(typeInfo.checkError(null)).toEqual("Not a string, but a object");
    expect(typeInfo.checkError(undefined)).toEqual(
      "Not a string, but a undefined"
    );
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

describe("string()", () => {
  it("test any string type creation", () => {
    expect(string()).toBeInstanceOf(AnyStringTypeInformation);
  });

  it("test specific string type creation", () => {
    expect(string("hello")).toBeInstanceOf(StringTypeInformation);
    expect(string("hello").value).toEqual("hello");
  });
});
