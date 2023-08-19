import {
  ContextConditionAnd,
  ContextConditionMethod,
  ContextConditionPath,
  ContextConditionPath2,
} from "./condition";
import { Context } from "./context";
import { expect } from "chai";

describe("Context", () => {
  describe("constructor", () => {
    it("Should create a new context", () => {
      const context = new Context();
      expect(context).not.to.be.undefined;
    });
  });

  describe("current", () => {
    it("Should return the currently executing context", () => {
      const context = new Context();
      context.init(() => {
        expect(Context.current).not.to.be.undefined;
        expect(Context.current).to.equal(context);
      });
    });

    it("Should throw an error if no context is executing", () => {
      expect(() => Context.current).to.throw(
        "No context is currently executing"
      );
    });

    it("Test with multiple contexts", () => {
      const context = new Context();
      context.init(() => {
        expect(Context.current).not.to.be.undefined;
        expect(Context.current).to.equal(context);
      });

      const context2 = new Context();
      context2.init(() => {
        expect(Context.current).not.to.be.undefined;
        expect(Context.current).to.equal(context2);
        expect(Context.current).not.to.equal(context);
      });
    });

    it("Test with nested contexts", () => {
      const context = new Context();
      context.init(() => {
        expect(Context.current).not.to.be.undefined;
        expect(Context.current).to.equal(context);
        const context2 = new Context();
        context2.init(() => {
          expect(Context.current).not.to.be.undefined;
          expect(Context.current).to.equal(context2);
          expect(Context.current).not.to.equal(context);
        });
      });
    });
  });

  describe("init", () => {
    it("Should execute the callback in the context", () => {
      const context = new Context();
      let executed = false;
      context.init(() => {
        executed = true;
      });
      expect(executed).to.be.true;
    });

    it("Should initialize context.current", () => {
      const context = new Context();
      context.init(() => {
        expect(Context.current).not.to.be.undefined;
        expect(Context.current).to.equal(context);
      });
    });

    it("Should throw an error if no callback is provided", () => {
      const context = new Context();
      expect(() => context.init()).to.throw("No callback provided");
    });

    it("Should throw an error if the callback is not a function", () => {
      const context = new Context();
      expect(() => context.init("test")).to.throw("Callback is not a function");
    });

    it("Should throw an error if the callback throws an error", () => {
      const context = new Context();
      expect(() =>
        context.init(() => {
          throw new Error("test");
        })
      ).to.throw("test");
    });

    it("Should initialize this parameter with the context", () => {
      const context = new Context();
      context.init(function () {
        expect(this).not.to.be.undefined;
        expect(this).to.equal(context);
      });
    });

    it("Should initialize Context.current with the context", () => {
      const context = new Context();
      context.init(function () {
        expect(Context.current).not.to.be.undefined;
        expect(Context.current).to.equal(context);
      });
    });
  });

  describe("when", () => {
    it("Should add a context condition clause to the context's children", () => {
      const context = new Context();
      context.when(new ContextConditionPath("test"), () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionPath
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Should execute the callback in the context", () => {
      const context = new Context();
      let executed = false;
      context.when(new ContextConditionPath("test"), () => {
        executed = true;
      });
      expect(executed).to.be.true;
    });
  });

  describe("describe", () => {
    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.describe("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionPath
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.describe(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionPath2
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("any", () => {
    // Should basically be the same as describe
    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.any("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionPath
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.any(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionPath2
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("get", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.get("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "get",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.get(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "get",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = new Context();
      context.get(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test with wrong parameters", () => {
      const context = new Context();
      expect(() => context.get("")).to.throw("Invalid arguments");
      expect(() => context.get("", "")).to.throw("Invalid arguments");
    });
  });

  describe("post", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.post("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "post",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.post(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "post",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = new Context();
      context.post(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test with wrong parameters", () => {
      const context = new Context();
      expect(() => context.post("")).to.throw("Invalid arguments");
      expect(() => context.post("", "")).to.throw("Invalid arguments");
    });
  });

  describe("put", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.put("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "put",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.put(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "put",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = new Context();
      context.put(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test with wrong parameters", () => {
      const context = new Context();
      expect(() => context.put("")).to.throw("Invalid arguments");
      expect(() => context.put("", "")).to.throw("Invalid arguments");
    });
  });

  describe("patch", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.patch("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "patch",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.patch(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "patch",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = new Context();
      context.patch(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test with wrong parameters", () => {
      const context = new Context();
      expect(() => context.patch("")).to.throw("Invalid arguments");
      expect(() => context.patch("", "")).to.throw("Invalid arguments");
    });
  });

  describe("delete", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.delete("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "delete",
        path: "test",
      });
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.delete(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].context).not.to.be.undefined;

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "delete",
        path: "[test]",
      });
    });

    it("Test without a path", () => {
      const context = new Context();
      context.delete(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test with wrong parameters", () => {
      const context = new Context();
      expect(() => context.delete("")).to.throw("Invalid arguments");
      expect(() => context.delete("", "")).to.throw("Invalid arguments");
    });
  });

  describe("head", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.head("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].condition.info()).to.deep.equal({
        method: "head",
        path: "test",
      });
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.head(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );
      expect(context.children[0].condition.info()).to.deep.equal({
        method: "head",
        path: "[test]",
      });
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test without a path", () => {
      const context = new Context();
      context.head(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test with wrong parameters", () => {
      const context = new Context();
      expect(() => context.head("")).to.throw("Invalid arguments");
      expect(() => context.head("", "")).to.throw("Invalid arguments");
    });
  });

  describe("options", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.options("test", () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "options",
        path: "test",
      });
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.options(/test/, () => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionAnd
      );

      /** @type {ContextConditionAnd} */
      const andCondition = context.children[0].condition;
      expect(andCondition.info()).to.deep.equal({
        method: "options",
        path: "[test]",
      });
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test without a path", () => {
      const context = new Context();
      context.options(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("condition");
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Test with wrong parameters", () => {
      const context = new Context();
      expect(() => context.options("")).to.throw("Invalid arguments");
      expect(() => context.options("", "")).to.throw("Invalid arguments");
    });
  });

  describe("action", () => {
    it("Should add an action as a child", () => {
      const context = new Context();
      context.action(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("action");
      expect(context.children[0].condition).to.be.undefined;
      expect(context.children[0].func).not.to.be.undefined;
    });

    it("Function should not be executed directly", () => {
      const context = new Context();
      context.action(() => fail("Function should not be executed directly"));
    });

    it("Should be executed when the context is executed", () => {
      const context = new Context();
      let executed = false;
      context.action(() => {
        executed = true;
      });
      context.execute({
        method: "get",
        path: "test",
      });

      expect(executed).to.be.true;
    });

    it("Should be executed with the correct parameters", () => {
      const context = new Context();
      let executed = false;

      const req = {
        method: "get",
        path: "test",
      };

      const res = {
        test: "test",
      };

      context.action((reqq, ress, next) => {
        executed = true;
        expect(reqq).to.equal(req);
        expect(ress).to.equal(res);
      });
      context.execute(req, res);

      expect(executed).to.be.true;
    });

    it("Everything after the action should not be executed", () => {
      const context = new Context();
      let executed = false;
      context.action(() => {
        executed = true;
      });
      context.use(() => {
        fail("Everything after the action should not be executed");
      });
      context.execute({
        method: "get",
        path: "test",
      });

      expect(executed).to.be.true;
    });

    it("Should throw an error if no callback is provided", () => {
      const context = new Context();
      expect(() => context.action()).to.throw("No callback provided");
    });

    it("Should throw an error if the callback is not a function", () => {
      const context = new Context();
      expect(() => context.action("test")).to.throw(
        "Callback is not a function"
      );
    });

    it("Should throw an error if two actions are added", () => {
      const context = new Context();
      context.action(() => {});
      expect(() => context.action(() => {})).to.throw(
        "Only one action function is allowed in a context"
      );
    });
  });

  describe("use", () => {
    it("Should add a middleware as a child", () => {
      const context = new Context();
      context.use(() => {});
      expect(context.children).to.have.length(1);
      expect(context.children[0].type).to.equal("use");
      expect(context.children[0].condition).to.be.undefined;
      expect(context.children[0].func).not.to.be.undefined;
    });

    it("Function should not be executed directly", () => {
      const context = new Context();
      context.use(() => fail("Function should not be executed directly"));
    });

    it("Should be executed when the context is executed", () => {
      const context = new Context();
      let executed = false;
      context.use(() => {
        executed = true;
      });
      context.execute({
        method: "get",
        path: "test",
      });

      expect(executed).to.be.true;
    });

    it("Should be executed with the correct parameters", () => {
      const context = new Context();
      let executed = false;

      const req = {
        method: "get",
        path: "test",
      };

      const res = {
        test: "test",
      };

      context.use((reqq, ress, next) => {
        executed = true;
        expect(reqq).to.equal(req);
        expect(ress).to.equal(res);
      });
      context.execute(req, res);

      expect(executed).to.be.true;
    });

    it("Everything after the middleware should be executed", () => {
      const context = new Context();
      let executed = false;
      context.use(() => {
        executed = true;
      });
      context.action(() => {
        executed = true;
      });
      context.execute({
        method: "get",
        path: "test",
      });

      expect(executed).to.be.true;
    });

    it("Should provide a next function", () => {
      const context = new Context();
      let executed = false;
      context.use((req, res, next) => {
        executed = true;
        expect(next).not.to.be.undefined;
        expect(next).to.be.a("function");
      });
      context.execute({
        method: "get",
        path: "test",
      });

      expect(executed).to.be.true;
    });

    it("Should execute the next middleware if next is called", () => {
      const context = new Context();
      let executed = false;
      context.use((req, res, next) => {
        executed = true;
        next();
      });
      context.use(() => {
        executed = true;
      });
      context.execute({
        method: "get",
        path: "test",
      });

      expect(executed).to.be.true;
    });

    it("Should not execute the next middleware if next not is called", () => {
      const context = new Context();
      let executed = false;
      context.use((req, res, next) => {
        executed = true;
      });
      context.use(() => {
        fail("Should not execute the next middleware if next not is called");
      });
      context.execute({
        method: "get",
        path: "test",
      });

      expect(executed).to.be.true;
    });

    it("Should throw an error if no callback is provided", () => {
      const context = new Context();
      expect(() => context.use()).to.throw("No callback provided");
    });

    it("Should throw an error if the callback is not a function", () => {
      const context = new Context();
      expect(() => context.use("test")).to.throw("Callback is not a function");
    });
  });

  describe("contextStack", () => {
    it("Test on empty context", async () => {
      const context = new Context();
      const req = {
          method: "get",
          path: "/test",
        },
        res = {
          test: "test",
        };

      expect(await context.contextStack(req, res)).to.be.an("array");
      expect(await context.contextStack(req, res)).to.deep.equal([[]]);
    });

    it("Test on complex context", async () => {
      const context = new Context().init(function () {
        this.any("/test", function () {
          this.get(function () {});
          this.post(function () {});
        });

        this.use(function () {});
      });

      const req = {
          method: "get",
          path: "/test",
        },
        res = {
          test: "test",
        };

      const r = await context.contextStack(req, res);

      expect(r).to.be.an("array");
      expect(r).to.have.length(3);

      expect(r[0]).to.be.an("array");
      expect(r[0]).to.have.length(1);
      expect(r[0][0]).to.be.an("object");
      expect(r[0][0].type).to.equal("condition");
      expect(r[0][0].condition).to.be.an.instanceOf(ContextConditionPath);
      expect(r[0][0].context).to.be.an.instanceOf(Context);

      expect(r[1]).to.be.an("array");
      expect(r[1]).to.have.length(1);
      expect(r[1][0]).to.be.an("object");
      expect(r[1][0].type).to.equal("condition");
      expect(r[1][0].condition).to.be.an.instanceOf(ContextConditionMethod);
      expect(r[1][0].context).to.be.an.instanceOf(Context);

      // TODO : Test the last one
    });
  });
});
