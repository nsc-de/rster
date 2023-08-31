const { Context } = require("../basic/context");
import { createSyntheticContext } from "../basic/common";
import "./info";
import rest from "../basic/rster";
describe("Context", () => {
  describe("description", () => {
    it("Describe without should return the description", () => {
      const context = new Context();
      context.init(function () {
        expect(this.description()).toEqual([]);
      });
    });

    it("Description with arguments should add to the description", () => {
      const context = new Context();
      context.init(function () {
        this.description("test");
        expect(this.description()).toEqual(["test"]);
      });
    });

    it("Test description with multiple arguments", () => {
      const context = new Context();
      context.init(function () {
        this.description("test", "test2");
        expect(this.description()).toEqual(["test", "test2"]);
      });
    });

    it("Test multiple description calls", () => {
      const context = new Context();
      context.init(function () {
        this.description("test");
        this.description("test2", "test3");
        expect(this.description()).toEqual(["test", "test2", "test3"]);
      });
    });

    it("Test getting description for another context with no description set", () => {
      const context = new Context();
      const context2 = new Context();
      context2.init(function () {
        expect(this.description(context)).toEqual([]);
      });
    });

    it("Test getting description for another context", () => {
      const context = new Context();
      context.init(function () {
        this.description("test");
        expect(this.description(context)).toEqual(["test"]);
      });

      const context2 = new Context();
      context2.init(function () {
        expect(this.description(context)).toEqual(["test"]);
      });
    });

    it("Test getting description for another context with more arguments to throw error", () => {
      const context = new Context();
      const context2 = new Context();
      context2.init(function () {
        expect(() => this.description(context, "test")).toThrow(
          "Cannot add description to another context"
        );
      });
    });
  });

  describe("field", () => {
    it("Test getting not-set field", () => {
      const context = new Context();
      context.init(function () {
        expect(this.field("test")).toBeUndefined();
      });
    });

    it("Test setting and getting field", () => {
      const context = new Context();
      context.init(function () {
        this.field("test", "hello world");
        expect(this.field("test")).toEqual("hello world");
      });
    });

    it("Test getting unset field from another context", () => {
      const context = new Context();
      const context2 = new Context();
      context2.init(function () {
        expect(this.field(context, "test")).toBeUndefined();
      });
    });

    it("Test setting and getting field from another context", () => {
      const context = new Context();

      context.init(function () {
        this.field("test", "hello world");
        expect(this.field(context, "test")).toEqual("hello world");
      });

      const context2 = new Context();
      context2.init(function () {
        expect(this.field(context, "test")).toEqual("hello world");
      });
    });

    it("Test setting and getting field from another context", () => {
      const context = new Context();
      const context2 = new Context();
      context2.init(function () {
        this.field(context, "test", "hello world");
        expect(this.field(context, "test")).toEqual("hello world");
      });
    });

    it("Test with invalid arguments", () => {
      const context = new Context();
      const context2 = new Context();
      context2.init(function () {
        expect(() => this.field(context, 10)).toThrow("Invalid arguments");
      });
    });
  });

  describe("fields", () => {
    it("Test getting fields", () => {
      const context = new Context();
      context.init(function () {
        expect(this.fields()).toEqual({});
      });
    });

    it("Test setting and getting fields", () => {
      const context = new Context();
      context.init(function () {
        this.field("test", "hello world");
        this.field("test2", "hello world2");
        expect(this.fields()).toEqual({
          test: "hello world",
          test2: "hello world2",
        });
      });
    });

    it("Test getting fields from another context (with no fields)", () => {
      const context = new Context();
      const context2 = new Context();
      context2.init(function () {
        expect(this.fields(context)).toEqual({});
      });
    });

    it("Test getting fields from another context", () => {
      const context = new Context();
      const context2 = new Context();
      context2.init(function () {
        this.field(context, "test", "hello world");
        this.field(context, "test2", "hello world2");
        expect(this.fields(context)).toEqual({
          test: "hello world",
          test2: "hello world2",
        });
      });
    });
  });

  describe("useInfo", () => {
    const ctx = rest(function () {
      this.description("Test description");
      this.field("test", "hello world");

      this.get("/test", function () {
        this.description("Just a test path");
        this.field("test2", "hello world2");
        this.action((req, res) => {
          res.send("Hello World").end();
        });
      });

      this.get("/hello", function () {
        this.description("Just another test path");
        this.field("test3", "hello world3");
        this.get("/world", function () {
          this.description("And another test path");
          this.field("test4", "hello world4");
          this.field("test5", "hello world5");
          this.action((req, res) => {
            res.send("Hello World").end();
          });
        });
      });

      this.useInfo();
    });

    it("Test getting info for root", async () => {
      const { promise, pass } = createSyntheticContext({
        path: "/info/",
      });

      ctx.handle(...pass);

      expect(await promise).toEqual({
        code: 200,
        data: '{"path":"/","description":["Test description"],"map":[{"path":"/test","method":"get","description":["Just a test path"]},{"path":"/hello","method":"get","description":["Just another test path"]},{"path":"/hello/world","method":"get","description":["And another test path"]},{"path":"/info","method":"any","description":["This module can be used to get information about the API","Just call /info/[path] to get information about this module"]}],"fields":[{"name":"test","value":"hello world"}]}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("Test getting info for /test", async () => {
      const { promise, pass } = createSyntheticContext({
        path: "/info/test",
      });

      ctx.handle(...pass);

      expect(await promise).toEqual({
        code: 200,
        data: '{"path":"/test","description":["Just a test path"],"map":[],"fields":[{"name":"test2","value":"hello world2"}]}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("Test getting info for /test/test", async () => {
      const { promise, pass } = createSyntheticContext({
        path: "/info/test/test",
      });

      ctx.handle(...pass);

      expect(await promise).toEqual({
        code: 200,
        data: '{"path":"/test/test","description":["Just a test path"],"map":[],"fields":[{"name":"test2","value":"hello world2"}]}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("Test getting info for /hello", async () => {
      const { promise, pass } = createSyntheticContext({
        path: "/info/hello",
      });

      ctx.handle(...pass);

      expect(await promise).toEqual({
        code: 200,
        data: '{"path":"/hello","description":["Just another test path"],"map":[{"path":"/world","method":"get","description":["And another test path"]}],"fields":[{"name":"test3","value":"hello world3"}]}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("Test getting info for /hello/world", async () => {
      const { promise, pass } = createSyntheticContext({
        path: "/info/hello/world",
      });

      ctx.handle(...pass);

      expect(await promise).toEqual({
        code: 200,
        data: '{"path":"/hello/world","description":["Just another test path"],"map":[{"path":"/world","method":"get","description":["And another test path"]}],"fields":[{"name":"test3","value":"hello world3"}]}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("Get info for /info", async () => {
      const { promise, pass } = createSyntheticContext({
        path: "/info/info",
      });

      ctx.handle(...pass);

      expect(await promise).toEqual({
        code: 200,
        data: '{"path":"/info","description":["This module can be used to get information about the API","Just call /info/[path] to get information about this module"],"map":[],"fields":[{"name":"version","value":"0.1.0"}]}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });

    it("Test with no path", async () => {
      const { promise, pass } = createSyntheticContext({
        path: "/info",
      });

      ctx.handle(...pass);

      expect(await promise).toEqual({
        code: 404,
        data: '{"path":"","message":"Nothing found here"}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });
  });
});
