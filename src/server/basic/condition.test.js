import {
  ContextConditionAnd,
  ContextConditionPath,
  ContextConditionPath2,
  ContextConditionMethod,
  ConditionChain,
  ContextCondition,
} from "./condition";

import { expect } from "chai";

describe("ContextCondition", () => {
  describe("and()", () => {
    it("should return a ContextConditionAnd instance", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const andCondition = condition1.and(condition2);

      expect(andCondition).to.be.instanceOf(ContextConditionAnd);
    });
  });

  describe("chain()", () => {
    it("should return a ConditionChain instance", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const chain = condition1.chain(condition2);

      expect(chain).to.be.instanceOf(ConditionChain);
    });
  });

  describe("subRequest()", () => {
    it("should return the same request because it has no need to be modified", () => {
      const condition = new (class extends ContextCondition {
        appliesTo() {
          return true;
        }
      })();
      const req = {
        method: "GET",
        path: "/users/123",
      };

      expect(condition.subRequest(req)).to.equal(req);
    });
  });
});

describe("ContextConditionAnd", () => {
  describe("appliesTo()", () => {
    it("should return true if all conditions apply", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      const req = {
        method: "GET",
        path: "/users/123",
      };

      expect(andCondition.appliesTo(req)).to.be.true;
    });

    it("should return false if any condition does not apply", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      const req = {
        method: "POST",
        path: "/users/123",
      };

      expect(andCondition.appliesTo(req)).to.be.false;
    });

    it("should return true if no conditions are specified", () => {
      const andCondition = new ContextConditionAnd([]);

      const req = {
        method: "POST",
        path: "/users/123",
      };

      expect(andCondition.appliesTo(req)).to.be.true;
    });
  });

  describe("subRequest()", () => {
    const condition1 = new ContextConditionPath("/users");
    const condition2 = new ContextConditionMethod("GET");
    const andCondition = new ContextConditionAnd([condition1, condition2]);

    const req = {
        method: "GET",
        path: "/users/123",
      },
      subReq = andCondition.subRequest(req);

    it("should return a sub request with the same method", () => {
      expect(subReq.method).to.equal(req.method);
    });

    it("should return a sub request the path starting from the part checked for", () => {
      expect(subReq.path).to.equal("/123");
    });
  });

  describe("and()", () => {
    it("should return a ContextConditionAnd instance", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const condition3 = new ContextConditionPath2(/^\/products\/\d+$/);
      const andCondition = condition1.and(condition2);
      const andCondition2 = andCondition.and(condition3);

      expect(andCondition2).to.be.instanceOf(ContextConditionAnd);
      expect(andCondition2.conditions).to.have.lengthOf(3);
    });
  });

  describe("info()", () => {
    it("should return a Object info representation of the condition", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition.info()).to.deep.equal({
        method: "GET",
        path: "/users",
      });
    });
  });

  describe("toJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition.toJson()).to.deep.equal({
        type: "and",
        conditions: [
          {
            type: "path",
            path: "/users",
          },
          {
            type: "method",
            method: "GET",
          },
        ],
      });
    });
  });

  describe("infoJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("GET");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition.infoJson()).to.deep.equal({
        method: "GET",
        path: "/users",
      });
    });
  });
});

describe("ContextConditionPath", () => {
  describe("appliesTo()", () => {
    it("should return true if the request path starts with the specified path", () => {
      const condition = new ContextConditionPath("/users");

      const req = {
        method: "GET",
        path: "/users/123",
      };

      expect(condition.appliesTo(req)).to.be.true;
    });

    it("should return false if the request path does not start with the specified path", () => {
      const condition = new ContextConditionPath("/users");

      const req = {
        method: "GET",
        path: "/products/123",
      };

      expect(condition.appliesTo(req)).to.be.false;
    });
  });

  describe("subRequest()", () => {
    const condition = new ContextConditionPath("/users");

    const req = {
        method: "GET",
        path: "/users/123",
      },
      subReq = condition.subRequest(req);

    it("should return a sub request with the same method", () => {
      expect(subReq.method).to.equal(req.method);
    });

    it("should return a sub request the path starting from the part checked for", () => {
      expect(subReq.path).to.equal("/123");
    });
  });

  describe("info()", () => {
    it("should return a Object info representation of the condition", () => {
      const condition = new ContextConditionPath("/users");

      expect(condition.info()).to.deep.equal({
        path: "/users",
      });
    });
  });

  describe("toJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition = new ContextConditionPath("/users");

      expect(condition.toJson()).to.deep.equal({
        type: "path",
        path: "/users",
      });
    });
  });

  describe("infoJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition = new ContextConditionPath("/users");

      expect(condition.infoJson()).to.deep.equal({
        path: "/users",
      });
    });
  });
});

describe("ContextConditionPath2", () => {
  describe("appliesTo()", () => {
    it("should return true if the request path starts with the specified path", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      const req = {
        method: "GET",
        path: "/users/123",
      };

      expect(condition.appliesTo(req)).to.be.true;
    });

    it("should return false if the request path does not start with the specified path", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      const req = {
        method: "GET",
        path: "/products/123",
      };

      expect(condition.appliesTo(req)).to.be.false;
    });
  });

  describe("subRequest()", () => {
    const condition = new ContextConditionPath2(/^\/users\/\d/);

    const req = {
        method: "GET",
        path: "/users/123",
      },
      subReq = condition.subRequest(req);

    it("should return a sub request with the same method", () => {
      expect(subReq.method).to.equal(req.method);
    });

    it("should return a sub request the path starting from the part checked for", () => {
      expect(subReq.path).to.equal("23");
    });
  });

  describe("info()", () => {
    it("should return a Object info representation of the condition", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      expect(condition.info()).to.deep.equal({
        path: "[^\\/users\\/\\d+$]",
      });
    });

    describe("toJson()", () => {
      it("should return a JSON representation of the condition", () => {
        const condition = new ContextConditionPath2(/^\/users\/\d+$/);

        expect(condition.toJson()).to.deep.equal({
          flags: "",
          path: "^\\/users\\/\\d+$",
          type: "path2",
        });
      });
    });

    describe("infoJson()", () => {
      it("should return a JSON representation of the condition", () => {
        const condition = new ContextConditionPath2(/^\/users\/\d+$/);

        expect(condition.infoJson()).to.deep.equal({
          path2: "^\\/users\\/\\d+$",
        });
      });
    });
  });
});

// // Add tests for ContextConditionPath2 and ContextConditionMethod in a similar manner

// describe("ConditionChain", () => {
//   it("should return true if all conditions in the chain apply", () => {
//     const condition1 = new ContextConditionPath("/users");
//     const condition2 = new ContextConditionMethod("GET");
//     const condition3 = new ContextConditionPath2(/^\/products\/\d+$/);

//     const chain = new ConditionChain([condition1, condition2, condition3]);

//     const req = {
//       method: "GET",
//       path: "/products/123",
//     };

//     expect(chain.appliesTo(req)).to.be.true;
//   });

//   it("should return false if any condition in the chain does not apply", () => {
//     const condition1 = new ContextConditionPath("/users");
//     const condition2 = new ContextConditionMethod("GET");
//     const condition3 = new ContextConditionPath2(/^\/products\/\d+$/);

//     const chain = new ConditionChain([condition1, condition2, condition3]);

//     const req = {
//       method: "POST",
//       path: "/products/abc",
//     };

//     expect(chain.appliesTo(req)).to.be.false;
//   });
// });
