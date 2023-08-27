const { Context } = require("./context");
import "./info";

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
});
