import {
  AnyNumberTypeInformation,
  NumberRangeTypeInformation,
  NumberTypeInformation,
  number,
  numberRange,
} from "./number";

describe("NumberTypeInformation", () => {
  it("check", () => {
    const typeInfo = new NumberTypeInformation(42);
    expect(typeInfo.check(42)).toBe(true);
    expect(typeInfo.check("42")).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new NumberTypeInformation(42);
    expect(typeInfo.checkError(42)).toBeUndefined();
    expect(typeInfo.checkError("42")).toEqual("Not a number, but a string");
    expect(typeInfo.checkError(null)).toEqual("Not a number, but a object");
    expect(typeInfo.checkError(44)).toEqual("Not the number 42, but 44");
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

describe("NumberRangeTypeInformation", () => {
  it("check", () => {
    const typeInfo = new NumberRangeTypeInformation(1, 10);
    expect(typeInfo.check(5)).toBe(true);
    expect(typeInfo.check(20)).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new NumberRangeTypeInformation(1, 10);
    expect(typeInfo.checkError(5)).toBeUndefined();
    expect(typeInfo.checkError(20)).toEqual("Not in range 1 to 10, but 20");
    expect(typeInfo.checkError(null)).toEqual("Not a number, but a object");
    expect(typeInfo.checkError(44)).toEqual("Not in range 1 to 10, but 44");
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

describe("AnyNumberTypeInformation", () => {
  it("check", () => {
    const typeInfo = new AnyNumberTypeInformation();
    expect(typeInfo.check(42)).toBe(true);
    expect(typeInfo.check("42")).toBe(false);
    expect(typeInfo.check(null)).toBe(false);
    expect(typeInfo.check(undefined)).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new AnyNumberTypeInformation();
    expect(typeInfo.checkError(42)).toBeUndefined();
    expect(typeInfo.checkError("42")).toEqual("Not a number, but a string");
    expect(typeInfo.checkError(null)).toEqual("Not a number, but a object");
    expect(typeInfo.checkError(44)).toBeUndefined();
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
