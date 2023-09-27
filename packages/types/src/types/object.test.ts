import { NumberTypeInformation } from "./number";
import { ObjectTypeInformation, object } from "./object";
import { StringTypeInformation } from "./string";

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

  it("allOptional", () => {
    const typeInfo = new ObjectTypeInformation({
      name: { required: true, type: new StringTypeInformation("John") },
      age: { required: false, type: new NumberTypeInformation(30) },
    });
    const allOptional = typeInfo.allOptional();
    expect(allOptional.properties).toEqual({
      name: { required: false, type: new StringTypeInformation("John") },
      age: { required: false, type: new NumberTypeInformation(30) },
    });
  });

  it("allRequired", () => {
    const typeInfo = new ObjectTypeInformation({
      name: { required: false, type: new StringTypeInformation("John") },
      age: { required: false, type: new NumberTypeInformation(30) },
    });
    const allRequired = typeInfo.allRequired();
    expect(allRequired.properties).toEqual({
      name: { required: true, type: new StringTypeInformation("John") },
      age: { required: true, type: new NumberTypeInformation(30) },
    });
  });

  it("keys", () => {
    const typeInfo = new ObjectTypeInformation({
      name: { required: false, type: new StringTypeInformation("John") },
      age: { required: false, type: new NumberTypeInformation(30) },
    });
    expect(typeInfo.keys()).toEqual(["name", "age"]);
  });
});

describe("object()", () => {
  it("test object type creation", () => {
    expect(object({})).toBeInstanceOf(ObjectTypeInformation);
    expect(object({}).properties).toEqual({});
  });
});
