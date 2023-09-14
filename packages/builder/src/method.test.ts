import { number, string, undefinedType } from "@rster/types";
import { RsterApiMethod, method } from "./method";
import {
  ContextChildCondition,
  ContextConditionAnd,
  ContextConditionMethod,
  ContextConditionPath,
  rest,
} from "@rster/basic";
import { createSyntheticContext } from "@rster/common";

describe("RsterApiMethod", () => {
  describe("#constructor()", () => {
    it("should create a method with the given name", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        () => {}
      );

      expect(method.name).toBe("test");
    });

    it("should create a method with the given description", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: undefinedType() },
        "/test",
        "get",
        () => {}
      );

      expect(method.description).toEqual(["test description"]);
    });

    it("should create a method with the given http path", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        () => {}
      );

      expect(method.httpPath).toBe("/test");
    });

    it("should create a method with the given http method", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        () => {}
      );

      expect(method.httpMethod).toBe("get");
    });

    it("should create a method with the given declaration", () => {
      const method = new RsterApiMethod(
        "test",
        [],
        { returns: undefinedType() },
        "/test",
        "get",
        () => {}
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
        () => {}
      );

      expect(method.action).toBeDefined();
    });

    it("should create create a method with default parameters generated (without params)", () => {
      const method = new RsterApiMethod("test", [], {
        returns: undefinedType(),
        expectParams: {},
      });

      expect(method.declaration).toEqual({
        expectParams: {},
        returns: undefinedType(),
      });

      expect(method.action).toBeUndefined();
      expect(method.name).toBe("test");
      expect(method.description).toEqual([]);
      expect(method.httpPath).toBe("/test");
      expect(method.httpMethod).toBeUndefined();
    });

    it("should create create a method with default parameters generated (with params)", () => {
      const method = new RsterApiMethod("test", [], {
        returns: undefinedType(),
        expectParams: {
          test: { type: string(), required: true },
          test2: { type: string(), required: true },
        },
      });

      expect(method.declaration).toEqual({
        expectParams: {
          test: { type: string(), required: true },
          test2: { type: string(), required: true },
        },
        returns: undefinedType(),
      });

      expect(method.action).toBeUndefined();
      expect(method.name).toBe("test");
      expect(method.description).toEqual([]);
      expect(method.httpPath).toBe("/test/:test/:test2");
      expect(method.httpMethod).toBeUndefined();
    });
  });

  describe("#json()", () => {
    it("should return a json representation of the method", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: undefinedType() },
        "/test",
        "get",
        () => {}
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
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          expectQuery: {
            test3: { type: string(), required: true },
            test4: { type: string(), required: false },
          },
          expectParams: {
            test5: { type: string(), required: true },
            test6: { type: string(), required: false },
          },
          returns: undefinedType(),
        },
        "/test",
        "get",
        () => {}
      );

      expect(method.json()).toEqual({
        name: "test",
        description: ["test description"],
        httpPath: "/test",
        httpMethod: "get",
        declaration: {
          expectBody: {
            test: { type: { type: "string" }, required: true },
            test2: { type: { type: "string" }, required: false },
          },
          expectQuery: {
            test3: { type: { type: "string" }, required: true },
            test4: { type: { type: "string" }, required: false },
          },
          expectParams: {
            test5: { type: { type: "string" }, required: true },
            test6: { type: { type: "string" }, required: false },
          },
          returns: {
            type: "undefined",
          },
        },
      });
    });
  });

  describe("#rest()", () => {
    it("should return a rest representation of the method", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          expectQuery: {
            test3: { type: string(), required: true },
            test4: { type: string(), required: false },
          },
          expectParams: {
            test5: { type: string(), required: true },
            test6: { type: string(), required: false },
          },
          returns: undefinedType(),
        },
        "/test",
        "get",
        () => {}
      );
      const api = rest(function () {
        method.rest(this);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toBe("condition");

      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionAnd);
      const condition = child.condition as ContextConditionAnd;
      expect(condition.conditions).toHaveLength(2);
      expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
      expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);

      const path = condition.conditions[0] as ContextConditionPath;
      expect(path.path).toBe("/test");
      const methodCondition = condition.conditions[1] as ContextConditionMethod;
      expect(methodCondition.method.toLowerCase()).toBe("get");

      const ctx = child.context;

      expect(ctx.description()).toEqual(["test description"]);
      expect(ctx.declaration()).toEqual({
        name: "test",
        expectBody: {
          test: { type: string(), required: true },
          test2: { type: string(), required: false },
        },
        expectQuery: {
          test3: { type: string(), required: true },
          test4: { type: string(), required: false },
        },
        expectParams: {
          test5: { type: string(), required: true },
          test6: { type: string(), required: false },
        },
        returnBody: undefinedType(),
      });

      expect(ctx.children).toHaveLength(1);
      expect(ctx.children[0].type).toBe("action");
    });
    it("test action function to work", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          returns: string(),
        },
        "/test",
        "get",
        () => {
          return "Hello from the test action 😉";
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toBe("condition");
      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionAnd);
      const condition = child.condition as ContextConditionAnd;
      expect(condition.conditions).toHaveLength(2);
      expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
      expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
      const pathCondition = condition.conditions[0] as ContextConditionPath;
      expect(pathCondition.path).toBe("/test");
      const methodCondition = condition.conditions[1] as ContextConditionMethod;
      expect(methodCondition.method.toLowerCase()).toBe("get");

      const ctx = child.context;

      expect(ctx.children).toHaveLength(1);
      expect(ctx.children[0].type).toBe("action");

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        method: "get",
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 200,
        data: '"Hello from the test action 😉"',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with body params (all parameters set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        body: {
          test: "test",
          test2: "test2",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 200,
        data: '"Hello from the test action 😉 test,test2"',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with body params (optional parameter not set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        body: {
          test: "test",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 200,
        data: '"Hello from the test action 😉 test,"',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with body params (required parameter not set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        body: {
          test2: "test2",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 400,
        data: '{"error":{"status":400,"message":"Missing body parameter test"}}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with body params (wrong type)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        body: {
          test: 1,
          test2: "test2",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 400,
        data: '{"error":{"status":400,"message":"Invalid body parameter test: Expected {\\"type\\":\\"string\\"}"}}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with query params (all parameters set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        query: {
          test: "test",
          test2: "test2",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 200,
        data: '"Hello from the test action 😉 test,test2"',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with query params (optional parameter not set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        query: {
          test: "test",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 200,
        data: '"Hello from the test action 😉 test,"',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with query params (required parameter not set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        query: {
          test2: "test2",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 400,
        data: '{"error":{"status":400,"message":"Missing query parameter test"}}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with query params (wrong type)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test",
        query: {
          // @ts-expect-error
          test: 1,
          test2: "test2",
        },
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 400,
        data: '{"error":{"status":400,"message":"Invalid query parameter test: Expected {\\"type\\":\\"string\\"}"}}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with params (all parameters set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test/:test/:test2",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test/test/test2",
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 200,
        data: '"Hello from the test action 😉 test,test2"',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with params (optional parameter not set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test/:test/:test3",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );
      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test/test/test2",
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 200,
        data: '"Hello from the test action 😉 test,"',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("test action function to work with params (required parameter not set)", async () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test/:test1/:test2",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );
      const api = rest(function () {
        method.rest(this);
      });

      const { pass, promise } = createSyntheticContext({
        path: "/test/test/test2",
      });

      api.handle(...pass);

      const result = await promise;

      expect(result).toEqual({
        code: 400,
        data: '{"error":{"status":400,"message":"Missing path parameter test"}}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });
  });

  describe("#native()", () => {
    it("Test without parameters", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: string() },
        "/test",
        "get",
        () => {
          return "Hello from the test action 😉";
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(native({})).toBe("Hello from the test action 😉");
    });

    it("Test with body parameters", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(native({ test: "test", test2: "test2" })).toBe(
        "Hello from the test action 😉 test,test2"
      );
    });

    it("Test with body params (optional parameter not set)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(native({ test: "test" })).toBe(
        "Hello from the test action 😉 test,"
      );
    });

    it("Test with body params (required parameter not set)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test2: "test2" })).toThrow(
        "Missing body parameter test"
      );
    });

    it("Test with body params (wrong type on optional parameter)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test: 1, test2: "test2" })).toThrow(
        'Invalid body parameter test: Expected {"type":"string"}'
      );
    });

    it("Test with body params (wrong type on required parameter)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectBody: {
            test: { type: number(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "post",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test: "test", test2: "test2" })).toThrow(
        'Invalid body parameter test: Expected {"type":"number"}'
      );
    });

    it("Test with query parameters", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(native({ test: "test", test2: "test2" })).toBe(
        "Hello from the test action 😉 test,test2"
      );
    });

    it("Test with query params (optional parameter not set)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(native({ test: "test" })).toBe(
        "Hello from the test action 😉 test,"
      );
    });

    it("Test with query params (required parameter not set)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test2: "test2" })).toThrow(
        "Missing query parameter test"
      );
    });

    it("Test with query params (wrong type on optional parameter)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test: 1, test2: "test2" })).toThrow(
        'Invalid query parameter test: Expected {"type":"string"}'
      );
    });

    it("Test with query params (wrong type on required parameter)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectQuery: {
            test: { type: number(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test",
        "post",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );
      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test: "test", test2: "test2" })).toThrow(
        'Invalid query parameter test: Expected {"type":"number"}'
      );
    });

    it("Test with params", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test/:test/:test2",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(native({ test: "test", test2: "test2" })).toBe(
        "Hello from the test action 😉 test,test2"
      );
    });

    it("Test with params (optional parameter not set)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test/:test/:test3",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );
      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(native({ test: "test" })).toBe(
        "Hello from the test action 😉 test,"
      );
    });

    it("Test with params (required parameter not set)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: string(),
        },
        "/test/:test1/:test2",
        "get",
        (args) => {
          return (
            "Hello from the test action 😉 " + [args.test, args.test2].join(",")
          );
        }
      );
      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test2: "test2" })).toThrow(
        "Missing path parameter test"
      );
    });

    it("Test with params (wrong type on optional parameter)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: string(), required: true },
            test2: { type: string(), required: false },
          },
          returns: number(),
        },
        "/test/:test/:test2",
        "get",
        () => {
          return 1;
        }
      );
      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test: 1, test2: "test2" })).toThrow(
        'Invalid path parameter test: Expected {"type":"string"}'
      );
    });

    it("Test with params (wrong type on required parameter)", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        {
          expectParams: {
            test: { type: number(), required: true },
            test2: { type: string(), required: false },
          },
          returns: number(),
        },
        "/test/:test/:test2",
        "get",
        () => {
          return 1;
        }
      );
      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      // @ts-ignore
      expect(() => native({ test: "test", test2: "test2" })).toThrow(
        'Invalid path parameter test: Expected {"type":"number"}'
      );
    });

    it("Test error on no action defined", () => {
      const method = new RsterApiMethod(
        "test",
        ["test description"],
        { returns: string() },
        "/test",
        "get"
      );

      const native = method.native();
      expect(native).toBeInstanceOf(Function);
      expect(() => native()).toThrow("No action defined");
    });
  });
});

describe("method()", () => {
  it("should create a method with the given parameters", () => {
    const m = method(
      "test",
      [],
      { returns: undefinedType() },
      "/test",
      "get",
      () => {}
    );

    expect(m.name).toBe("test");
    expect(m.description).toEqual([]);
    expect(m.httpPath).toBe("/test");
    expect(m.httpMethod).toBe("get");
    expect(m.declaration).toEqual({ returns: undefinedType() });
    expect(m.action).toBeDefined();
  });
});
