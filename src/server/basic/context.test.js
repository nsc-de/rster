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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionPath
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.describe(/test/, () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionPath
      );
      expect(context.children[0].context).not.to.be.undefined;
    });

    it("Should add a route using a Path2 condition if called with a RegExp", () => {
      const context = new Context();
      context.any(/test/, () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("post", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.post("test", () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("put", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.put("test", () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("patch", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.patch("test", () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("delete", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.delete("test", () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("head", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.head("test", () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });

  describe("options", () => {
    // Basically the same as any, but adds a METHOD condition and a PATH condition wrapped inside a AND condition

    it("Should add a route using a Path condition if called with a string", () => {
      const context = new Context();
      context.options("test", () => {});
      expect(context.children).to.have.length(1);
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
      expect(context.children[0].condition).to.be.an.instanceOf(
        ContextConditionMethod
      );
      expect(context.children[0].context).not.to.be.undefined;
    });
  });
});
