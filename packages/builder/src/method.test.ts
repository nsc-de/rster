import { string, undefinedType } from "@rster/types";
import { RsterApiMethod } from "./method";

describe("RsterApiMethod", () => {
  describe("#constructor()", () => {
    it("should create a method with the given name", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get"
      );

      expect(method.name).toBe("test");
    });

    it("should create a method with the given description", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: undefinedType() },
        "/test",
        "get"
      );

      expect(method.description).toEqual(["test description"]);
    });

    it("should create a method with the given http path", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get"
      );

      expect(method.httpPath).toBe("/test");
    });

    it("should create a method with the given http method", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get"
      );

      expect(method.httpMethod).toBe("get");
    });

    it("should create a method with the given declaration", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get"
      );

      expect(method.declaration).toEqual({ returns: undefinedType() });
    });

    it("should create a method with the given action", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        (args) => {}
      );

      expect(method.action).toBeDefined();
    });
  });

  describe("#json()", () => {
    it("should return a json representation of the method", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: undefinedType() },
        "/test",
        "get"
      );

      expect(method.json()).toEqual({
        name: "test",
        description: ["test description"],
        httpPath: "/test",
        httpMethod: "get",
        declaration: {
          expectBody: undefined,
          expectQuery: undefined,
          expectParams: undefined,
          returns: {
            type: "undefined",
          },
        },
      });
    });

    it("test with declaration for body, query and params", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), optional: false },
            test2: { type: string(), optional: true },
          },
          expectQuery: {
            test3: { type: string(), optional: false },
            test4: { type: string(), optional: true },
          },
          expectParams: {
            test5: { type: string(), optional: false },
            test6: { type: string(), optional: true },
          },
          returns: undefinedType(),
        },
        "/test",
        "get"
      );

      expect(method.json()).toEqual({
        name: "test",
        description: ["test description"],
        httpPath: "/test",
        httpMethod: "get",
        declaration: {
          expectBody: {
            test: { type: { type: "string" }, optional: false },
            test2: { type: { type: "string" }, optional: true },
          },
          expectQuery: {
            test3: { type: { type: "string" }, optional: false },
            test4: { type: { type: "string" }, optional: true },
          },
          expectParams: {
            test5: { type: { type: "string" }, optional: false },
            test6: { type: { type: "string" }, optional: true },
          },
          returns: {
            type: "undefined",
          },
        },
      });
    });
  });
});
