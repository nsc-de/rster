import {
  AnyBooleanTypeInformation,
  BooleanTypeInformation,
  boolean,
  falseType,
  trueType,
} from "./boolean";

describe("BooleanTypeInformation", () => {
  it("check", () => {
    const typeInfo = new BooleanTypeInformation(true);
    expect(typeInfo.check(true)).toBe(true);
    expect(typeInfo.check(false)).toBe(false);
    expect(typeInfo.check(0)).toBe(false);
    expect(typeInfo.check("true")).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new BooleanTypeInformation(true);
    expect(typeInfo.checkError(true)).toBeUndefined();
    expect(typeInfo.checkError(false)).toEqual(
      "Not the boolean true, but false"
    );
    expect(typeInfo.checkError(0)).toEqual("Not a boolean, but a number");
    expect(typeInfo.checkError("true")).toEqual("Not a boolean, but a string");
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

describe("AnyBooleanTypeInformation", () => {
  it("check", () => {
    const typeInfo = new AnyBooleanTypeInformation();
    expect(typeInfo.check(true)).toBe(true);
    expect(typeInfo.check(false)).toBe(true);
    expect(typeInfo.check(0)).toBe(false);
    expect(typeInfo.check(null)).toBe(false);
    expect(typeInfo.check(undefined)).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new AnyBooleanTypeInformation();
    expect(typeInfo.checkError(true)).toBeUndefined();
    expect(typeInfo.checkError(false)).toBeUndefined();
    expect(typeInfo.checkError(0)).toEqual("Not a boolean, but a number");
    expect(typeInfo.checkError(null)).toEqual("Not a boolean, but a object");
    expect(typeInfo.checkError(undefined)).toEqual(
      "Not a boolean, but a undefined"
    );
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
