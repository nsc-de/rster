import { ArrayTypeInformation, array } from "./array";
import {
  AnyStringTypeInformation,
  StringTypeInformation,
  string,
} from "./string";

describe("ArrayTypeInformation", () => {
  it("check", () => {
    const typeInfo = new ArrayTypeInformation(
      new StringTypeInformation("hello")
    );
    expect(typeInfo.check(["hello"])).toBe(true);
    expect(typeInfo.check(["world"])).toBe(false);
    expect(typeInfo.check([123])).toBe(false);
  });

  it("checkError", () => {
    const typeInfo = new ArrayTypeInformation(
      new StringTypeInformation("hello")
    );
    expect(typeInfo.checkError(["hello"])).toBeUndefined();
    expect(typeInfo.checkError(["world"])).toEqual(
      "0: Not the string hello, but world"
    );
    expect(typeInfo.checkError([123])).toEqual("0: Not a string, but a number");

    expect(typeInfo.checkError(null)).toEqual("Not an array, but a object");
    expect(typeInfo.checkError(undefined)).toEqual(
      "Not an array, but a undefined"
    );

    const typeInfo2 = new ArrayTypeInformation(
      new StringTypeInformation("world"),
      {
        maxItems: 4,
        minItems: 2,
      }
    );

    expect(typeInfo2.checkError(["world", "world", "world", "world"])).toBe(
      undefined
    );

    expect(
      typeInfo2.checkError(["world", "world", "world", "world", "world"])
    ).toBe("Array is too long, needs to be at most 4");

    expect(typeInfo2.checkError(["world"])).toBe(
      "Array is too short, needs to be at least 2"
    );
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

describe("array()", () => {
  it("test array type creation", () => {
    expect(array(string())).toBeInstanceOf(ArrayTypeInformation);
    expect(array(string()).values).toBeInstanceOf(AnyStringTypeInformation);
  });
});
