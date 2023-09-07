import { createSyntheticContext } from "@rster/common";
import rest, {
  Context,
  ContextChild,
  ContextChildCondition,
} from "@rster/basic";
import "./info";
import { any, number, string } from "@rster/types";

// @ts-ignore
const createEmptyContext = () => new Context();

describe("Context", () => {
  describe("#description()", () => {
    it("Describe without should return the description", () => {
      const context = createEmptyContext();
      context.init(function () {
        expect(this.description()).toEqual([]);
      });
    });

    it("Description with arguments should add to the description", () => {
      const context = createEmptyContext();
      context.init(function () {
        this.description("test");
        expect(this.description()).toEqual(["test"]);
      });
    });

    it("Test description with multiple arguments", () => {
      const context = createEmptyContext();
      context.init(function () {
        this.description("test", "test2");
        expect(this.description()).toEqual(["test", "test2"]);
      });
    });

    it("Test multiple description calls", () => {
      const context = createEmptyContext();
      context.init(function () {
        this.description("test");
        this.description("test2", "test3");
        expect(this.description()).toEqual(["test", "test2", "test3"]);
      });
    });

    it("Test getting description for another context with no description set", () => {
      const context = createEmptyContext();
      const context2 = createEmptyContext();
      context2.init(function () {
        expect(this.description(context)).toEqual([]);
      });
    });

    it("Test getting description for another context", () => {
      const context = createEmptyContext();
      context.init(function () {
        this.description("test");
        expect(this.description(context)).toEqual(["test"]);
      });

      const context2 = createEmptyContext();
      context2.init(function () {
        expect(this.description(context)).toEqual(["test"]);
      });
    });

    it("Test getting description for another context with more arguments to throw error", () => {
      const context = createEmptyContext();
      const context2 = createEmptyContext();
      context2.init(function () {
        // @ts-ignore
        expect(() => this.description(context, "test")).toThrow(
          "Cannot add description to another context"
        );
      });
    });
  });

  describe("#field()", () => {
    it("Test getting not-set field", () => {
      const context = createEmptyContext();
      context.init(function () {
        expect(this.field("test")).toBeUndefined();
      });
    });

    it("Test setting and getting field", () => {
      const context = createEmptyContext();
      context.init(function () {
        this.field("test", "hello world");
        expect(this.field("test")).toEqual("hello world");
      });
    });

    it("Test getting unset field from another context", () => {
      const context = createEmptyContext();
      const context2 = createEmptyContext();
      context2.init(function () {
        expect(this.field(context, "test")).toBeUndefined();
      });
    });

    it("Test getting field from another context", () => {
      const context = createEmptyContext();

      context.init(function () {
        this.field("test", "hello world");
        expect(this.field(context, "test")).toEqual("hello world");
      });

      const context2 = createEmptyContext();
      context2.init(function () {
        expect(this.field(context, "test")).toEqual("hello world");
      });
    });

    it("Test setting and getting field from another context", () => {
      const context = createEmptyContext();
      const context2 = createEmptyContext();
      context2.init(function () {
        this.field(context, "test", "hello world");
        expect(this.field(context, "test")).toEqual("hello world");
      });
    });

    it("Test with invalid arguments", () => {
      const context = createEmptyContext();
      const context2 = createEmptyContext();
      context2.init(function () {
        // @ts-ignore
        expect(() => this.field(context, 10)).toThrow("Invalid arguments");
      });
    });
  });

  describe("#fields()", () => {
    it("Test getting fields", () => {
      const context = createEmptyContext();
      context.init(function () {
        expect(this.fields()).toEqual({});
      });
    });

    it("Test setting and getting fields", () => {
      const context = createEmptyContext();
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
      const context = createEmptyContext();
      const context2 = createEmptyContext();
      context2.init(function () {
        expect(this.fields(context)).toEqual({});
      });
    });

    it("Test getting fields from another context", () => {
      const context = createEmptyContext();
      const context2 = createEmptyContext();
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

  describe("#useInfo()", () => {
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
          console.log(this.getPath());
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
        data: '{"path":"","method":"any","description":["Test description"],"map":[{"path":"/test","method":"get","description":["Just a test path"]},{"path":"/hello","method":"get","description":["Just another test path"]},{"path":"/hello/world","method":"get","description":["And another test path"]},{"path":"/info","method":"any","description":["This module can be used to get information about the API","Just call /info/[path] to get information about this module"]}],"fields":[{"name":"test","value":"hello world"}]}',
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
        data: '{"path":"/test","method":"get","description":["Just a test path"],"map":[],"fields":[{"name":"test2","value":"hello world2"}]}',
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
        code: 404,
        data: '{"error":{"status":404,"message":"No context found for path \\"/test/test\\""}}',
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
        data: '{"path":"/hello","method":"get","description":["Just another test path"],"map":[{"path":"/world","method":"get","description":["And another test path"]}],"fields":[{"name":"test3","value":"hello world3"}]}',
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
        data: '{"path":"/hello/world","method":"get","description":["And another test path"],"map":[],"fields":[{"name":"test4","value":"hello world4"},{"name":"test5","value":"hello world5"}]}',
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
        data: '{"path":"/info","method":"any","description":["This module can be used to get information about the API","Just call /info/[path] to get information about this module"],"map":[],"fields":[{"name":"version","value":"0.1.4"}]}',
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
        code: 200,
        data: '{"path":"","method":"any","description":["Test description"],"map":[{"path":"/test","method":"get","description":["Just a test path"]},{"path":"/hello","method":"get","description":["Just another test path"]},{"path":"/hello/world","method":"get","description":["And another test path"]},{"path":"/info","method":"any","description":["This module can be used to get information about the API","Just call /info/[path] to get information about this module"]}],"fields":[{"name":"test","value":"hello world"}]}',
        headers: {
          "Content-Type": "application/json",
        },
        sendFile: undefined,
      });
    });
  });

  describe("#declaration()", () => {
    it("Test getting declaration of actual context", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        this.setData("@info/declaration", "test");
        expect(this.declaration()).toEqual("test");
      });
    });

    it("Test getting declaration of another context", () => {
      const ctx = createEmptyContext();
      const ctx2 = createEmptyContext();

      ctx.init(function () {
        this.setData("@info/declaration", "test");
      });

      ctx2.init(function () {
        this.setData("@info/declaration", "test2");
        expect(this.declaration(ctx)).toEqual("test");
      });
    });

    it("Test setting declaration of actual context", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });
        expect(this.declaration()).toEqual({
          name: "test",
          returnBody: string(),
        });
      });
    });

    it("Test setting declaration of another context", () => {
      const ctx = createEmptyContext();
      const ctx2 = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });
      });

      ctx2.init(function () {
        this.declaration(ctx, { name: "test2", returnBody: string() });
        expect(this.declaration(ctx)).toEqual({
          name: "test",
          returnBody: string(),
        });
      });
    });

    it("Test setting declaration with invalid arguments", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        // @ts-ignore
        expect(() => this.declaration(10)).toThrow("Invalid arguments");
      });
    });

    it("Test setting declaration of another context with invalid arguments", () => {
      const ctx = createEmptyContext();
      const ctx2 = createEmptyContext();

      ctx.init(function () {
        // @ts-ignore
        expect(() => this.declaration(ctx2, 10)).toThrow("Invalid arguments");
      });
    });
  });

  describe("#hasDeclaration()", () => {
    it("Test hasDeclaration with no declaration", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        expect(this.hasDeclaration()).toBeFalsy();
      });
    });

    it("Test hasDeclaration with declaration", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });
        expect(this.hasDeclaration()).toBeTruthy();
      });
    });

    it("Test hasDeclaration without declaration of another context", () => {
      const ctx = createEmptyContext();
      const ctx2 = createEmptyContext();

      ctx.init(function () {});

      ctx2.init(function () {
        expect(this.hasDeclaration(ctx)).toBeFalsy();
      });
    });

    it("Test hasDeclaration with declaration of another context", () => {
      const ctx = createEmptyContext();
      const ctx2 = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });
      });

      ctx2.init(function () {
        expect(this.hasDeclaration(ctx)).toBeTruthy();
      });
    });
  });

  describe("#collectDeclarations()", () => {
    it("Test collectDeclarations with no declarations", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        expect(this.collectDeclarations()).toEqual([]);
      });
    });

    it("Test collectDeclarations with one declaration", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });
        expect(this.collectDeclarations()).toEqual([
          { declaration: { name: "test", returnBody: string() }, ctx: ctx },
        ]);
      });
    });

    it("Test collectDeclarations with one declaration of another context", () => {
      const ctx = createEmptyContext();
      const ctx2 = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });
      });

      ctx2.init(function () {
        expect(this.collectDeclarations(ctx)).toEqual([
          { declaration: { name: "test", returnBody: string() }, ctx: ctx },
        ]);
      });
    });

    it("Test collectDeclarations with multiple declarations", () => {
      const ctx = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });

        this.get("/test1", function () {
          this.declaration({ name: "test2", returnBody: number() });
          this.action((req, res) => {});
        });

        this.get("/test2", function () {
          this.declaration({ name: "test3", returnBody: any() });
          this.action((req, res) => {});

          this.get("/test3", function () {
            this.declaration({ name: "test4", returnBody: string() });
            this.action((req, res) => {});
          });
        });

        // @ts-ignore
        const children: ContextChild[] = this.children;
        const child0 = (children[0] as ContextChildCondition).context;
        const child1 = (children[1] as ContextChildCondition).context;

        // @ts-ignore
        const child1Children: ContextChild[] = child1.children;
        const child1Child1 = (child1Children[1] as ContextChildCondition)
          .context;

        const collect = this.collectDeclarations();
        expect(collect).toHaveLength(4);
        expect(collect).toEqual(
          expect.arrayContaining([
            {
              declaration: { name: "test2", returnBody: number() },
              ctx: child0,
            },
            {
              declaration: { name: "test4", returnBody: string() },
              ctx: child1Child1,
            },
            { declaration: { name: "test3", returnBody: any() }, ctx: child1 },
            { declaration: { name: "test", returnBody: string() }, ctx: ctx },
          ])
        );
      });
    });

    it("Test collectDeclarations with multiple declarations of another context", () => {
      const ctx = createEmptyContext();
      const ctx2 = createEmptyContext();

      ctx.init(function () {
        this.declaration({ name: "test", returnBody: string() });

        this.get("/test1", function () {
          this.declaration({ name: "test2", returnBody: number() });
          this.action((req, res) => {});
        });

        this.get("/test2", function () {
          this.declaration({ name: "test3", returnBody: any() });
          this.action((req, res) => {});

          this.get("/test3", function () {
            this.declaration({ name: "test4", returnBody: string() });
            this.action((req, res) => {});
          });
        });

        // @ts-ignore
        const children: ContextChild[] = this.children;
        const child0 = (children[0] as ContextChildCondition).context;
        const child1 = (children[1] as ContextChildCondition).context;

        // @ts-ignore
        const child1Children: ContextChild[] = child1.children;
        const child1Child1 = (child1Children[1] as ContextChildCondition)
          .context;

        const collect = this.collectDeclarations(ctx);
        expect(collect).toHaveLength(4);
        expect(collect).toEqual(
          expect.arrayContaining([
            {
              declaration: { name: "test2", returnBody: number() },
              ctx: child0,
            },
            {
              declaration: { name: "test4", returnBody: string() },
              ctx: child1Child1,
            },
            { declaration: { name: "test3", returnBody: any() }, ctx: child1 },
            { declaration: { name: "test", returnBody: string() }, ctx: ctx },
          ])
        );
      });
    });
  });
});
