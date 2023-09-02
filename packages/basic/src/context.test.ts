import { fail } from "assert";
import {
  ContextConditionAnd,
  ContextConditionMethod,
  ContextConditionPath,
  ContextConditionPath2,
} from "./condition";
import {
  Context,
  ContextChildAction,
  ContextChildCondition,
  ContextChildUse,
} from "./context";
import { $404 } from "./error";
import { Request, Response, createSyntheticContext } from "@rster/common";

// @ts-ignore
const createEmptyContext = () => new Context();

describe("Context", () => {
  describe("constructor", () => {
    it("Should create a new context", () => {
      const context = createEmptyContext();
      expect(context).not.toBeUndefined();
    });
  });

  describe("current", () => {
    it("Should return the currently executing context", () => {
      const context = createEmptyContext();
      context.init(() => {
        expect(Context.current).not.toBeUndefined();
        expect(Context.current).toEqual(context);
      });
    });

    it("Should throw an error if no context is executing", () => {
      expect(() => Context.current).toThrow(
        "No context is currently executing"
      );
    });

    it("Test with multiple contexts", () => {
      const context = createEmptyContext();
      context.init(() => {
        expect(Context.current).not.toBeUndefined();
        expect(Context.current).toEqual(context);
      });

      const context2 = createEmptyContext();
      context2.init(() => {
        expect(Context.current).not.toBeUndefined();
        expect(Context.current).toBe(context2);
        expect(Context.current).not.toBe(context);
      });
    });

    it("Test with nested contexts", () => {
      const context = createEmptyContext();
      context.init(() => {
        expect(Context.current).not.toBeUndefined();
        expect(Context.current).toEqual(context);
        const context2 = createEmptyContext();
        context2.init(() => {
          expect(Context.current).not.toBeUndefined();
          expect(Context.current).toBe(context2);
          expect(Context.current).not.toBe(context);
        });
      });
    });
  });

  describe("init", () => {
    it("Should execute the callback in the context", () => {
      const context = createEmptyContext();
      let executed = false;
      context.init(() => {
        executed = true;
      });
      expect(executed).toBe(true);
    });

    it("Should initialize context.current", () => {
      const context = createEmptyContext();
      context.init(() => {
        expect(Context.current).not.toBeUndefined();
        expect(Context.current).toEqual(context);
      });
    });

    it("Should throw an error if no callback is provided", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.init()).toThrow("No callback provided");
    });

    it("Should throw an error if the callback is not a function", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.init("test")).toThrow("Callback is not a function");
    });

    it("Should throw an error if the callback throws an error", () => {
      const context = createEmptyContext();
      expect(() =>
        context.init(() => {
          throw new Error("test");
        })
      ).toThrow("test");
    });

    it("Should initialize this parameter with the context", () => {
      const context = createEmptyContext();
      context.init(function () {
        expect(this).not.toBeUndefined();
        expect(this).toEqual(context);
      });
    });

    it("Should initialize Context.current with the context", () => {
      const context = createEmptyContext();
      context.init(function () {
        expect(Context.current).not.toBeUndefined();
        expect(Context.current).toEqual(context);
      });
    });
  });

  describe("when", () => {
    it("Should add a context condition clause to the context's children", () => {
      const context = createEmptyContext();
      context.when(new ContextConditionPath("test"), () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionPath);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Should execute the callback in the context", () => {
      const context = createEmptyContext();
      let executed = false;
      context.when(new ContextConditionPath("test"), () => {
        executed = true;
      });
      expect(executed).toBe(true);
    });
  });

  describe("describe", () => {
    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.describe("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionPath);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.describe(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionPath2);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });
  });

  describe("any", () => {
    // Should basically be the same as describe
    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.any("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionPath);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.any(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionPath2);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });
  });

  describe("get", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.get("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "get",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.get(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "get",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = createEmptyContext();
      context.get(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionMethod);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test with wrong parameters", () => {
      const context = createEmptyContext();

      // @ts-ignore
      expect(() => context.get("")).toThrow("Invalid arguments");
      // @ts-ignore
      expect(() => context.get("", "")).toThrow("Invalid arguments");
    });
  });

  describe("post", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.post("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "post",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.post(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "post",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = createEmptyContext();
      context.post(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionMethod);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test with wrong parameters", () => {
      const context = createEmptyContext();

      // @ts-ignore
      expect(() => context.post("")).toThrow("Invalid arguments");
      // @ts-ignore
      expect(() => context.post("", "")).toThrow("Invalid arguments");
    });
  });

  describe("put", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.put("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "put",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.put(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "put",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = createEmptyContext();
      context.put(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionMethod);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test with wrong parameters", () => {
      const context = createEmptyContext();

      // @ts-ignore
      expect(() => context.put("")).toThrow("Invalid arguments");
      // @ts-ignore
      expect(() => context.put("", "")).toThrow("Invalid arguments");
    });
  });

  describe("patch", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.patch("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "patch",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.patch(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "patch",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = createEmptyContext();
      context.patch(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionMethod);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test with wrong parameters", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.patch("")).toThrow("Invalid arguments");
      // @ts-ignore
      expect(() => context.patch("", "")).toThrow("Invalid arguments");
    });
  });

  describe("delete", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.delete("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "delete",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.delete(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "delete",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = createEmptyContext();
      context.delete(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionMethod);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test with wrong parameters", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.delete("")).toThrow("Invalid arguments");
      // @ts-ignore
      expect(() => context.delete("", "")).toThrow("Invalid arguments");
    });
  });

  describe("head", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.head("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).condition.info()
      ).toEqual({
        method: "head",
        path: "test",
      });
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.head(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);
      expect(
        (context.children[0] as ContextChildCondition).condition.info()
      ).toEqual({
        method: "head",
        path: "[test]",
      });
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test without a path", () => {
      const context = createEmptyContext();
      context.head(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionMethod);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test with wrong parameters", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.head("")).toThrow("Invalid arguments");
      // @ts-ignore
      expect(() => context.head("", "")).toThrow("Invalid arguments");
    });
  });

  describe("options", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = createEmptyContext();
      context.options("test", () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "options",
        path: "test",
      });
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = createEmptyContext();
      context.options(/test/, () => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionAnd);

      /** @type {ContextConditionAnd} */
      const andCondition = (context.children[0] as ContextChildCondition)
        .condition;
      expect(andCondition.info()).toEqual({
        method: "options",
        path: "[test]",
      });
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test without a path", () => {
      const context = createEmptyContext();
      context.options(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("condition");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeInstanceOf(ContextConditionMethod);
      expect(
        (context.children[0] as ContextChildCondition).context
      ).not.toBeUndefined();
    });

    it("Test with wrong parameters", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.options("")).toThrow("Invalid arguments");
      // @ts-ignore
      expect(() => context.options("", "")).toThrow("Invalid arguments");
    });
  });

  describe("action", () => {
    it("Should add an action as a child", () => {
      const context = createEmptyContext();
      context.action(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("action");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeUndefined();
      expect(
        (context.children[0] as ContextChildAction).func
      ).not.toBeUndefined();
    });

    it("Function should not be executed directly", () => {
      const context = createEmptyContext();
      context.action(() => fail("Function should not be executed directly"));
    });

    it("Should be executed when the context is executed", () => {
      const context = createEmptyContext();
      let executed = false;
      context.action(() => {
        executed = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Should be executed with the correct parameters", () => {
      const context = createEmptyContext();
      let executed = false;

      const {
        pass,
        request: req,
        response: res,
      } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);
      context.action((reqq, ress) => {
        executed = true;
        expect(reqq).toEqual(req);
        expect(ress).toEqual(res);
      });
      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Everything after the action should not be executed", () => {
      const context = createEmptyContext();
      let executed = false;
      context.action(() => {
        executed = true;
      });
      context.use(() => {
        fail("Everything after the action should not be executed");
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Should throw an error if no callback is provided", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.action()).toThrow("No callback provided");
    });

    it("Should throw an error if the callback is not a function", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.action("test")).toThrow(
        "Callback is not a function"
      );
    });

    it("Should throw an error if two actions are added", () => {
      const context = createEmptyContext();
      context.action(() => {});
      expect(() => context.action(() => {})).toThrow(
        "Only one action function is allowed in a context"
      );
    });
  });

  describe("use", () => {
    it("Should add a middleware as a child", () => {
      const context = createEmptyContext();
      context.use(() => {});
      expect(context.children).toHaveLength(1);
      expect(context.children[0].type).toEqual("use");
      expect(
        (context.children[0] as ContextChildCondition).condition
      ).toBeUndefined();
      expect(
        (context.children[0] as ContextChildAction).func
      ).not.toBeUndefined();
    });

    it("Function should not be executed directly", () => {
      const context = createEmptyContext();
      context.use(() => fail("Function should not be executed directly"));
    });

    it("Should be executed when the context is executed", () => {
      const context = createEmptyContext();
      let executed = false;
      context.use(() => {
        executed = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Should be executed with the correct parameters", () => {
      const context = createEmptyContext();
      let executed = false;

      const {
        pass,
        request: req,
        response: res,
      } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.use((reqq, ress, next) => {
        executed = true;
        expect(reqq).toEqual(req);
        expect(ress).toEqual(res);
      });
      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Everything after the middleware should be executed", () => {
      const context = createEmptyContext();
      let executed = false;
      context.use(() => {
        executed = true;
      });
      context.action(() => {
        executed = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Should provide a next function", () => {
      const context = createEmptyContext();
      let executed = false;
      context.use((req, res, next) => {
        executed = true;
        expect(next).not.toBeUndefined();
        expect(typeof next).toBe("function");
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Should execute the next middleware if next is called", () => {
      const context = createEmptyContext();
      let executed = false;
      context.use((req, res, next) => {
        executed = true;
        next();
      });
      context.use(() => {
        executed = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Should not execute the next middleware if next not is called", () => {
      const context = createEmptyContext();
      let executed = false;
      context.use((req, res, next) => {
        executed = true;
      });
      context.use(() => {
        fail("Should not execute the next middleware if next not is called");
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Should throw an error if no callback is provided", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.use()).toThrow("No callback provided");
    });

    it("Should throw an error if the callback is not a function", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.use("test")).toThrow("Callback is not a function");
    });
  });

  describe("contextStack", () => {
    it("Test on empty context", async () => {
      const context = createEmptyContext();

      const {
        pass,
        request: req,
        response: res,
      } = createSyntheticContext({
        method: "get",
        path: "test",
      });
      expect(Array.isArray(await context.contextStack(...pass))).toBe(true);
      expect(await context.contextStack(...pass)).toEqual([[]]);
    });

    it("Test on complex context", async () => {
      const context = createEmptyContext().init(function () {
        this.any("/test", function () {
          this.get(function () {
            this.action(function () {});
          });
          this.post(function () {
            this.action(function () {});
          });
        });

        this.use(function () {});
      });

      const {
        pass,
        request: req,
        response: res,
      } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      const r = await context.contextStack(...pass);

      expect(Array.isArray(r)).toBe(true);
      expect(r).toHaveLength(3);

      expect(Array.isArray(r[0])).toBe(true);
      expect(r[0]).toHaveLength(1);
      expect(typeof r[0][0]).toBe("object");
      expect(r[0][0].type).toEqual("condition");
      expect((r[0][0] as ContextChildCondition).condition).toBeInstanceOf(
        ContextConditionPath
      );
      expect((r[0][0] as ContextChildCondition).context).toBeInstanceOf(
        Context
      );

      expect(Array.isArray(r[1])).toBe(true);
      expect(r[1]).toHaveLength(1);
      expect(typeof r[1][0]).toBe("object");
      expect(r[1][0].type).toEqual("condition");
      expect((r[1][0] as ContextChildCondition).condition).toBeInstanceOf(
        ContextConditionMethod
      );
      expect((r[1][0] as ContextChildCondition).context).toBeInstanceOf(
        Context
      );

      expect(Array.isArray(r[2])).toBe(true);
      expect(r[2]).toHaveLength(1);
      expect(typeof r[2][0]).toBe("object");
      expect(r[2][0].type).toEqual("action");
      // @ts-ignore
      expect(r[2][0].condition).toBeUndefined();

      expect(typeof (r[2][0] as ContextChildAction).func).toBe("function");
    });

    it("Test on another complex context", async () => {
      const context = createEmptyContext().init(function () {
        this.any("/test", function () {
          this.get(function () {
            this.use(function () {});
            this.action(function () {});
          });
          this.post(function () {
            this.use(function () {});
            this.action(function () {});
          });
        });

        this.use(function () {});
      });

      const {
        pass,
        request: req,
        response: res,
      } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      const r = await context.contextStack(...pass);

      expect(Array.isArray(r)).toBe(true);
      expect(r).toHaveLength(3);

      expect(Array.isArray(r[0])).toBe(true);
      expect(r[0]).toHaveLength(1);
      expect(typeof r[0][0]).toBe("object");
      expect(r[0][0].type).toEqual("condition");
      expect((r[0][0] as ContextChildCondition).condition).toBeInstanceOf(
        ContextConditionPath
      );
      expect((r[0][0] as ContextChildCondition).context).toBeInstanceOf(
        Context
      );

      expect(Array.isArray(r[1])).toBe(true);
      expect(r[1]).toHaveLength(1);
      expect(typeof r[1][0]).toBe("object");
      expect(r[1][0].type).toEqual("condition");
      expect((r[1][0] as ContextChildCondition).condition).toBeInstanceOf(
        ContextConditionMethod
      );
      expect((r[1][0] as ContextChildCondition).context).toBeInstanceOf(
        Context
      );

      expect(Array.isArray(r[2])).toBe(true);
      expect(r[2]).toHaveLength(2);
      expect(typeof r[2][0]).toBe("object");
      expect(r[2][0].type).toEqual("use");
      expect((r[2][0] as ContextChildCondition).condition).toBeUndefined();
      expect(typeof (r[2][0] as ContextChildUse).func).toBe("function");
      expect(typeof r[2][1]).toBe("object");
      expect(r[2][1].type).toEqual("action");
      expect((r[2][1] as ContextChildCondition).condition).toBeUndefined();
      expect(typeof (r[2][1] as ContextChildAction).func).toBe("function");
    });
  });

  describe("execute", () => {
    it("Should execute action", () => {
      const context = createEmptyContext();
      let executed = false;
      context.action(() => {
        executed = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });
      context.execute(...pass);

      expect(executed).toBe(true);
    });
    it("Should execute middleware", () => {
      const context = createEmptyContext();
      let executed = false;
      context.use(() => {
        executed = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });
      context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Test middleware with error passed to next", () => {
      const context = createEmptyContext();
      context.use(async (req, res, next) => {
        await next(new Error("test"));
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      expect(async () => await context.execute(...pass)).rejects.toThrow(
        "test"
      );
    });

    it("Test middleware with error thrown", () => {
      const context = createEmptyContext();
      context.use(async (req, res, next) => {
        throw new Error("test");
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      expect(async () => await context.execute(...pass)).rejects.toThrow(
        "test"
      );
    });

    it("Test middleware not throwing error if true is passed to next", async () => {
      const context = createEmptyContext();
      context.use(async (req, res, next) => {
        await next(true);
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });
      await context.execute(...pass);
    });

    it("Test middleware without next called not activating next middleware", async () => {
      const context = createEmptyContext();
      let executed = false;
      let executed2 = false;
      context.use(async (req, res, next) => {
        executed = true;
      });
      context.use(async (req, res, next) => {
        executed2 = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
      expect(executed2).toBe(false);
    });

    it("Test middleware without next called not activating next action", async () => {
      const context = createEmptyContext();
      let executed = false;
      let executed2 = false;
      context.use(async (req, res, next) => {
        executed = true;
        await next();
      });
      context.action(async (req, res) => {
        let executed2 = true;
      });

      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
      expect(executed2).toBe(false);
    });

    it("Test middleware without next called not activating next condition", async () => {
      const context = createEmptyContext();
      let executed = false;
      let executed2 = false;
      context.use(async (req, res, next) => {
        executed = true;
        await next();
      });
      context.get(function () {
        this.action(() => {
          executed2 = true;
        });
      });
      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });

      context.execute(...pass);

      expect(executed).toBe(true);
      expect(executed2).toBe(false);
    });

    it("Test middleware with next called activating next middleware", async () => {
      const context = createEmptyContext();
      let executed = false;
      let called = 0;
      context.use(async (req, res, next) => {
        next();
      });
      context.use(async (req, res, next) => {
        executed = true;
        next();
      });
      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });
      await context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Test middleware with next called activating next action", async () => {
      const context = createEmptyContext();
      let executed = false;
      context.use(async (req, res, next) => {
        await next();
      });
      context.action(async (req, res) => {
        executed = true;
      });
      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });
      await context.execute(...pass);

      expect(executed).toBe(true);
    });

    it("Test middleware with next called activating next condition", async () => {
      const context = createEmptyContext();
      let executed = false;
      const { pass } = createSyntheticContext({
        method: "get",
        path: "test",
      });
      context.use(async (req, res, next) => {
        next();
      });
      context.get("/test", function () {
        this.action(() => {
          executed = true;
        });
      });
      await context.execute(...pass);

      expect(executed).toBe(true);
    });

    describe("Test conditions", () => {
      it("Test condition with true", async () => {
        const context = createEmptyContext();
        let executed = false;
        context.get("/test", function () {
          this.action(() => {
            executed = true;
          });
        });

        const { pass } = createSyntheticContext({
          method: "get",
          path: "test",
        });
        await context.execute(...pass);

        expect(executed).toBe(true);
      });

      it("Test condition with false", async () => {
        const context = createEmptyContext();
        let executed = false;
        context.get("/test", function () {
          this.action(() => {
            executed = true;
          });
        });
        const { pass } = createSyntheticContext({
          method: "get",
          path: "tes2",
        });
        await context.execute(...pass);

        expect(executed).toBe(false);
      });

      it("Test HTTP error", async () => {
        const context = createEmptyContext();
        let executed = false;
        context.get("/test", function () {
          this.action(() => {
            throw $404("test");
          });
        });

        await expect(() =>
          context.execute(
            // @ts-ignore
            {
              method: "get",
              path: "/test",
            },
            {
              json(body) {
                return this;
              },
              status(code) {
                return this;
              },

              end() {},
            }
          )
        ).rejects.toThrow($404("test"));
      });
    });
  });

  describe("data / setData", () => {
    it("test storing data", () => {
      const context = createEmptyContext();
      context.setData("test", "test");
      expect(context.data("test")).toEqual("test");
    });

    it("test storing data with object", () => {
      const context = createEmptyContext();
      context.setData("test", { test: "test" });
      expect(context.data("test")).toEqual({ test: "test" });
    });

    it("test multiple data", () => {
      const context = createEmptyContext();
      context.setData("test", "test");
      context.setData("test2", "test2");
      expect(context.data("test")).toEqual("test");
      expect(context.data("test2")).toEqual("test2");
    });

    it("test multiple data with object", () => {
      const context = createEmptyContext();
      context.setData("test", { test: "test" });
      context.setData("test2", { test2: "test2" });
      expect(context.data("test")).toEqual({ test: "test" });
      expect(context.data("test2")).toEqual({ test2: "test2" });
    });

    it("test data object", () => {
      const context = createEmptyContext();
      context.setData("test", "test");
      context.setData("test2", "test2323");
      expect(context.data()).toEqual({
        test: "test",
        test2: "test2323",
      });
    });

    it("test with wrong parameters", () => {
      const context = createEmptyContext();
      // @ts-ignore
      expect(() => context.setData()).toThrow("No key provided");
      // @ts-ignore
      expect(() => context.setData("")).toThrow("No key provided");
      // @ts-ignore
      expect(() => context.data(null)).toThrow("Invalid arguments");
    });
  });

  describe("map", () => {
    it("test on empty context", () => {
      const context = createEmptyContext();
      expect(context.map).toEqual([]);
    });

    it("test with action", () => {
      const context = createEmptyContext();
      context.action(() => {});
      expect(context.map).toEqual([]);
    });

    it("test with use", () => {
      const context = createEmptyContext();
      context.use(() => {});
      expect(context.map).toEqual([]);
    });

    it("test on context with one child", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});

      expect(context.map).toEqual([
        {
          condition: {
            conditions: [
              { method: "get", type: "method" },
              { path: "/test", type: "path" },
            ],
            type: "and",
          },
          context: [],
        },
      ]);
    });

    it("test on context with multiple children", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});
      context.post("/test", () => {});

      expect(context.map).toEqual([
        {
          condition: {
            conditions: [
              { method: "get", type: "method" },
              { path: "/test", type: "path" },
            ],
            type: "and",
          },
          context: [],
        },
        {
          condition: {
            conditions: [
              { method: "post", type: "method" },
              { path: "/test", type: "path" },
            ],
            type: "and",
          },
          context: [],
        },
      ]);
    });

    it("test on deep context", () => {
      const context = createEmptyContext();
      context.get("/test", function () {
        this.get("/testtttt", () => {});
      });

      expect(context.map).toEqual([
        {
          condition: {
            conditions: [
              { method: "get", type: "method" },
              { path: "/test", type: "path" },
            ],
            type: "and",
          },
          context: [
            {
              condition: {
                conditions: [
                  { method: "get", type: "method" },
                  { path: "/testtttt", type: "path" },
                ],
                type: "and",
              },
              context: [],
            },
          ],
        },
      ]);
    });
  });

  describe("info", () => {
    it("test on empty context", () => {
      const context = createEmptyContext();
      expect(context.info()).toEqual([]);
    });

    it("test with action", () => {
      const context = createEmptyContext();
      context.action(() => {});
      expect(context.info()).toEqual([]);
    });

    it("test with use", () => {
      const context = createEmptyContext();
      context.use(() => {});
      expect(context.info()).toEqual([]);
    });

    it("test on context with one child", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});

      expect(context.info()).toEqual([
        {
          condition: { method: "get", path: "/test" },
          context: (context.children[0] as ContextChildCondition).context,
        },
      ]);
    });

    it("test on context with multiple children", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});
      context.post("/test", () => {});

      expect(context.info()).toEqual([
        {
          condition: { method: "get", path: "/test" },
          context: (context.children[0] as ContextChildCondition).context,
        },
        {
          condition: { method: "post", path: "/test" },
          context: (context.children[1] as ContextChildCondition).context,
        },
      ]);
    });

    it("test on deep context", () => {
      const context = createEmptyContext();
      context.get("/test", function () {
        this.get("/testtttt", () => {});
      });

      expect(context.info()).toEqual([
        {
          condition: { method: "get", path: "/test" },
          context: (context.children[0] as ContextChildCondition).context,
        },
        {
          condition: { method: "get", path: "/test/testtttt" },
          context: (
            (context.children[0] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
        },
      ]);
    });

    it("test on deep context (inner anonymous get)", () => {
      const context = createEmptyContext();
      context.any("/test", function () {
        this.get(() => {});
        this.post(() => {});
      });

      expect(context.info()).toEqual([
        {
          condition: { path: "/test" },
          context: (context.children[0] as ContextChildCondition).context,
        },
        {
          condition: { method: "get", path: "/test" },
          context: (
            (context.children[0] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
        },
        {
          condition: { method: "post", path: "/test" },
          context: (
            (context.children[0] as ContextChildCondition).context
              .children[1] as ContextChildCondition
          ).context,
        },
      ]);
    });

    it("test on deep context (outer anonymous get)", () => {
      const context = createEmptyContext();
      context.get(function () {
        this.any("/test", function () {});
      });

      expect(context.info()).toEqual([
        {
          condition: { method: "get" },
          context: (context.children[0] as ContextChildCondition).context,
        },
        {
          condition: { method: "get", path: "/test" },
          context: (
            (context.children[0] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
        },
      ]);
    });

    it("test on 2-layer deep context", () => {
      const context = createEmptyContext();
      context.get("/test", function () {
        this.get("/testtttt", function () {
          this.get("/testtttttttt", () => {});
        });
      });

      expect(context.info()).toEqual([
        {
          condition: { method: "get", path: "/test" },
          context: (context.children[0] as ContextChildCondition).context,
        },
        {
          condition: { method: "get", path: "/test/testtttt" },
          context: (
            (context.children[0] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
        },
        {
          condition: { method: "get", path: "/test/testtttt/testtttttttt" },
          context: (
            (
              (context.children[0] as ContextChildCondition).context
                .children[0] as ContextChildCondition
            ).context.children[0] as ContextChildCondition
          ).context,
        },
      ]);
    });

    it("test on 3-layer deep context", () => {
      const context = createEmptyContext();
      context.get("/test", function () {
        this.get("/testtttt", function () {
          this.get("/testtttttttt", function () {
            this.get("/testtttttttttttt", () => {});
          });
        });
      });

      expect(context.info()).toEqual([
        {
          condition: { method: "get", path: "/test" },
          context: (context.children[0] as ContextChildCondition).context,
        },
        {
          condition: { method: "get", path: "/test/testtttt" },
          context: (
            (context.children[0] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
        },
        {
          condition: { method: "get", path: "/test/testtttt/testtttttttt" },
          context: (
            (
              (context.children[0] as ContextChildCondition).context
                .children[0] as ContextChildCondition
            ).context.children[0] as ContextChildCondition
          ).context,
        },
        {
          condition: {
            method: "get",
            path: "/test/testtttt/testtttttttt/testtttttttttttt",
          },
          context: (
            (
              (
                (context.children[0] as ContextChildCondition).context
                  .children[0] as ContextChildCondition
              ).context.children[0] as ContextChildCondition
            ).context.children[0] as ContextChildCondition
          ).context,
        },
      ]);
    });
  });

  describe("toJson", () => {
    it("test on empty context", () => {
      const context = createEmptyContext();
      expect(context.toJson()).toEqual({ children: [] });
    });

    it("test with action", () => {
      const context = createEmptyContext();
      context.action(() => {});
      expect(context.toJson()).toEqual({
        children: [{ type: "action" }],
      });
    });

    it("test with use", () => {
      const context = createEmptyContext();
      context.use(() => {});
      expect(context.toJson()).toEqual({
        children: [{ type: "use" }],
      });
    });

    it("test on context with one child", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});

      expect(context.toJson()).toEqual({
        children: [
          {
            type: "condition",
            condition: {
              type: "and",
              conditions: [
                { type: "method", method: "get" },
                { type: "path", path: "/test" },
              ],
            },
            context: { children: [] },
          },
        ],
      });
    });

    it("test on context with multiple children", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});
      context.post("/test", () => {});

      expect(context.toJson()).toEqual({
        children: [
          {
            type: "condition",
            condition: {
              type: "and",
              conditions: [
                { type: "method", method: "get" },
                { type: "path", path: "/test" },
              ],
            },
            context: { children: [] },
          },
          {
            type: "condition",
            condition: {
              type: "and",
              conditions: [
                { type: "method", method: "post" },
                { type: "path", path: "/test" },
              ],
            },
            context: { children: [] },
          },
        ],
      });
    });

    it("test on deep context", () => {
      const context = createEmptyContext();
      context.get("/test", function () {
        this.get("/testtttt", () => {});
      });

      expect(context.toJson()).toEqual({
        children: [
          {
            type: "condition",
            condition: {
              type: "and",
              conditions: [
                { type: "method", method: "get" },
                { type: "path", path: "/test" },
              ],
            },
            context: {
              children: [
                {
                  type: "condition",
                  condition: {
                    type: "and",
                    conditions: [
                      { type: "method", method: "get" },
                      { type: "path", path: "/testtttt" },
                    ],
                  },
                  context: { children: [] },
                },
              ],
            },
          },
        ],
      });
    });
  });

  describe("collect", () => {
    it("test on empty context", () => {
      const context = createEmptyContext();
      expect(context.collect()).toEqual([context]);
    });

    it("test with action", () => {
      const context = createEmptyContext();
      context.action(() => {});
      expect(context.collect()).toEqual([context]);
    });

    it("test with use", () => {
      const context = createEmptyContext();
      context.use(() => {});
      expect(context.collect()).toEqual([context]);
    });

    it("test on context with one child", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});

      const collect = context.collect();
      expect(collect).toHaveLength(2);
      expect(context.collect()).toEqual(
        expect.arrayContaining([
          (context.children[0] as ContextChildCondition).context,
          context,
        ])
      );
    });

    it("test on context with multiple children", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});
      context.post("/test", () => {});

      const collect = context.collect();
      expect(collect).toHaveLength(3);
      expect(context.collect()).toEqual(
        expect.arrayContaining([
          (context.children[0] as ContextChildCondition).context,
          (context.children[1] as ContextChildCondition).context,
          context,
        ])
      );
    });

    it("test on deep context", () => {
      const context = createEmptyContext();
      context.get("/test", function () {
        this.get("/testtttt", () => {});
      });

      const collect = context.collect();
      expect(collect).toHaveLength(3);
      expect(context.collect()).toEqual(
        expect.arrayContaining([
          (
            (context.children[0] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
          (context.children[0] as ContextChildCondition).context,
          context,
        ])
      );
    });

    it("test on deep context with multiple children", () => {
      const context = createEmptyContext();
      context.any("/test", function () {
        this.get("/testtttt", () => {});
        this.post("/testtttt", () => {});
      });
      context.any("/test2", function () {
        this.get("/test3", () => {});
        this.post("/testtttt", () => {});
      });

      const collect = context.collect();
      expect(collect).toHaveLength(7);
      expect(collect).toEqual(
        expect.arrayContaining([
          (
            (context.children[0] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
          (
            (context.children[0] as ContextChildCondition).context
              .children[1] as ContextChildCondition
          ).context,
          (context.children[0] as ContextChildCondition).context,
          (
            (context.children[1] as ContextChildCondition).context
              .children[0] as ContextChildCondition
          ).context,
          (
            (context.children[1] as ContextChildCondition).context
              .children[1] as ContextChildCondition
          ).context,
          (context.children[1] as ContextChildCondition).context,
          context,
        ])
      );
    });
  });

  describe("getMethod", () => {
    it("test on empty context", () => {
      const context = createEmptyContext();
      expect(context.getMethod()).toEqual("any");
    });

    it("test with method defined", () => {
      const context = createEmptyContext();
      context.get(() => {});
      expect(
        (context.children[0] as ContextChildCondition).context.getMethod()
      ).toEqual("get");
    });
  });

  describe("getPath", () => {
    it("test on empty context", () => {
      const context = createEmptyContext();
      expect(context.getPath()).toEqual("");
    });

    it("test with path defined", () => {
      const context = createEmptyContext();
      context.get("/test", () => {});
      expect(
        (context.children[0] as ContextChildCondition).context.getPath()
      ).toEqual("/test");
    });
  });
});
