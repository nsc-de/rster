import { createSyntheticRequest } from "@rster/common";
import {
  ContextConditionAnd,
  ContextConditionPath,
  ContextConditionPath2,
  ContextConditionMethod,
  ConditionChain,
} from "./condition";

describe("ContextCondition", () => {
  describe("and()", () => {
    it("should return a ContextConditionAnd instance", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition = condition1.and(condition2);

      expect(andCondition).toBeInstanceOf(ContextConditionAnd);
    });
  });

  describe("chain()", () => {
    it("should return a ConditionChain instance", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const chain = condition1.chain(condition2);

      expect(chain).toBeInstanceOf(ConditionChain);
    });
  });
});

describe("ContextConditionAnd", () => {
  describe("appliesTo()", () => {
    it("should return true if all conditions apply", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      const req = createSyntheticRequest({
        method: "get",
        path: "/users/123",
      });

      expect(andCondition.appliesTo(req)).toBe(true);
    });

    it("should return false if any condition does not apply", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      const req = createSyntheticRequest({
        method: "post",
        path: "/users/123",
      });

      expect(andCondition.appliesTo(req)).toBe(false);
    });

    it("should return true if no conditions are specified", () => {
      const andCondition = new ContextConditionAnd([]);

      const req = createSyntheticRequest({
        method: "POST",
        path: "/users/123",
      });

      expect(andCondition.appliesTo(req)).toBe(true);
    });
  });

  describe("subRequest()", () => {
    const condition1 = new ContextConditionPath("/users");
    const condition2 = new ContextConditionMethod("get");
    const andCondition = new ContextConditionAnd([condition1, condition2]);

    const req = createSyntheticRequest({
      method: "get",
      path: "/users/123",
    });
    const subReq = andCondition.subRequest(req);

    it("should return a sub request with the same method", () => {
      expect(subReq.method).toEqual(req.method);
    });

    it("should return a sub request the path starting from the part checked for", () => {
      expect(subReq.path).toEqual("/123");
    });
  });

  describe("and()", () => {
    it("should return a ContextConditionAnd instance", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const condition3 = new ContextConditionPath2(/^\/products\/\d+$/);
      const andCondition = condition1.and(condition2);
      const andCondition2 = andCondition.and(condition3);

      expect(andCondition2).toBeInstanceOf(ContextConditionAnd);
      expect(andCondition2.conditions).toHaveLength(3);
    });
  });

  describe("info()", () => {
    it("should return a Object info representation of the condition", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition.info()).toEqual({
        method: "get",
        path: "/users",
      });
    });
  });

  describe("toJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition.toJson()).toEqual({
        type: "and",
        conditions: [
          {
            type: "path",
            path: "/users",
          },
          {
            type: "method",
            method: "get",
          },
        ],
      });
    });
  });

  describe("infoJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition.infoJson()).toEqual({
        method: "get",
        path: "/users",
      });
    });
  });

  describe("equals()", () => {
    it("should return false if condition is not an instance of ContextConditionAnd", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition.equals(condition1)).toBe(false);
    });

    it("should return false if length of conditions is not equal", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition1 = new ContextConditionAnd([condition1, condition2]);
      const andCondition2 = new ContextConditionAnd([condition1]);

      expect(andCondition1.equals(andCondition2)).toBe(false);
    });

    it("should return true if the conditions are equal", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const andCondition1 = new ContextConditionAnd([condition1, condition2]);
      const andCondition2 = new ContextConditionAnd([condition1, condition2]);

      expect(andCondition1.equals(andCondition2)).toBe(true);
    });

    it("should return false if the conditions are not equal", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");
      const condition3 = new ContextConditionPath2(/^\/products\/\d+$/);
      const andCondition1 = new ContextConditionAnd([condition1, condition2]);
      const andCondition2 = new ContextConditionAnd([condition1, condition3]);

      expect(andCondition1.equals(andCondition2)).toBe(false);
    });
  });
});

describe("ContextConditionPath", () => {
  describe("appliesTo()", () => {
    it("should return true if the request path starts with the specified path", () => {
      const condition = new ContextConditionPath("/users");

      const req = createSyntheticRequest({
        method: "get",
        path: "/users/123",
      });

      expect(condition.appliesTo(req)).toBe(true);
    });

    it("should return false if the request path does not start with the specified path", () => {
      const condition = new ContextConditionPath("/users");

      const req = createSyntheticRequest({
        method: "get",
        path: "/products/123",
      });

      expect(condition.appliesTo(req)).toBe(false);
    });
  });

  describe("subRequest()", () => {
    it("should return a sub request with the same method", () => {
      const condition = new ContextConditionPath("/users");

      const req = createSyntheticRequest({
          method: "get",
          path: "/users/123",
        }),
        subReq = condition.subRequest(req);
      expect(subReq.method).toEqual(req.method);
    });

    it("should return a sub request the path starting from the part checked for", () => {
      const condition = new ContextConditionPath("/users");

      const req = createSyntheticRequest({
          method: "get",
          path: "/users/123",
        }),
        subReq = condition.subRequest(req);
      expect(subReq.path).toEqual("/123");
    });

    it("should return a sub request with the same query", () => {
      const condition = new ContextConditionPath("/users");

      const req = createSyntheticRequest({
          method: "get",
          path: "/users/123",
          query: { a: "b" },
        }),
        subReq = condition.subRequest(req);
      expect(subReq.query).toEqual(req.query);
    });

    it("should return a sub-request with updated params", () => {
      const condition = new ContextConditionPath("/users/:id/posts/:postId");

      const req = createSyntheticRequest({
          method: "get",
          path: "/users/123/posts/456",
        }),
        subReq = condition.subRequest(req);
      expect(subReq.params).toHaveProperty("id", "123");
      expect(subReq.params).toHaveProperty("postId", "456");
    });
  });

  describe("parse()", () => {
    describe("applies", () => {
      it("should return true if the request path starts with the specified path", () => {
        const condition = new ContextConditionPath("/users");

        const req = createSyntheticRequest({
          method: "get",
          path: "/users/123",
        });

        expect(condition.parse(req).applies).toBe(true);
      });

      it("should return false if the request path does not start with the specified path", () => {
        const condition = new ContextConditionPath("/users");

        const req = createSyntheticRequest({
          method: "get",
          path: "/products/123",
        });

        expect(condition.parse(req).applies).toBe(false);
      });
    });

    describe("subRequest()", () => {
      it("should return a sub request with the same method", () => {
        const condition = new ContextConditionPath("/users");

        const req = createSyntheticRequest({
            method: "get",
            path: "/users/123",
          }),
          subReq = condition.parse(req).subRequest(req);
        expect(subReq.method).toEqual(req.method);
      });

      it("should return a sub request the path starting from the part checked for", () => {
        const condition = new ContextConditionPath("/users");

        const req = createSyntheticRequest({
            method: "get",
            path: "/users/123",
          }),
          subReq = condition.parse(req).subRequest(req);
        expect(subReq.path).toEqual("/123");
      });

      it("should return a sub request with the same query", () => {
        const condition = new ContextConditionPath("/users");

        const req = createSyntheticRequest({
            method: "get",
            path: "/users/123",
            query: { a: "b" },
          }),
          subReq = condition.parse(req).subRequest(req);
        expect(subReq.query).toEqual(req.query);
      });

      it("should return a sub-request with updated params", () => {
        const condition = new ContextConditionPath("/users/:id/posts/:postId");

        const req = createSyntheticRequest({
            method: "get",
            path: "/users/123/posts/456",
          }),
          subReq = condition.parse(req).subRequest(req);
        expect(subReq.params).toHaveProperty("id", "123");
        expect(subReq.params).toHaveProperty("postId", "456");
      });
    });

    describe("parameters()", () => {
      it("should return a object with the parameters", () => {
        const condition = new ContextConditionPath("/users/:id/posts/:postId");

        const req = createSyntheticRequest({
          method: "get",
          path: "/users/123/posts/456",
        });

        expect(condition.parse(req).parameters()).toHaveProperty("id", "123");
        expect(condition.parse(req).parameters()).toHaveProperty(
          "postId",
          "456"
        );
      });
    });
  });

  describe("info()", () => {
    it("should return a Object info representation of the condition", () => {
      const condition = new ContextConditionPath("/users");

      expect(condition.info()).toEqual({
        path: "/users",
      });
    });
  });

  describe("toJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition = new ContextConditionPath("/users");

      expect(condition.toJson()).toEqual({
        type: "path",
        path: "/users",
      });
    });
  });

  describe("infoJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition = new ContextConditionPath("/users");

      expect(condition.infoJson()).toEqual({
        path: "/users",
      });
    });
  });

  describe("equals()", () => {
    it("should return false if condition is not an instance of ContextConditionPath", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionMethod("get");

      expect(condition1.equals(condition2)).toBe(false);
    });

    it("should return true if the paths are equal", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionPath("/users");

      expect(condition1.equals(condition2)).toBe(true);
    });

    it("should return false if the paths are not equal", () => {
      const condition1 = new ContextConditionPath("/users");
      const condition2 = new ContextConditionPath("/products");

      expect(condition1.equals(condition2)).toBe(false);
    });
  });
});

describe("ContextConditionPath2", () => {
  describe("appliesTo()", () => {
    it("should return true if the request path starts with the specified path", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      const req = createSyntheticRequest({
        method: "get",
        path: "/users/123",
      });

      expect(condition.appliesTo(req)).toBe(true);
    });

    it("should return false if the request path does not start with the specified path", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      const req = createSyntheticRequest({
        method: "get",
        path: "/products/123",
      });

      expect(condition.appliesTo(req)).toBe(false);
    });
  });

  describe("subRequest()", () => {
    const condition = new ContextConditionPath2(/^\/users\/\d/);

    const req = createSyntheticRequest({
        method: "get",
        path: "/users/123",
      }),
      subReq = condition.subRequest(req);

    it("should return a sub request with the same method", () => {
      expect(subReq.method).toEqual(req.method);
    });

    it("should return a sub request the path starting from the part checked for", () => {
      expect(subReq.path).toEqual("23");
    });

    it("should return a sub request with the same query", () => {
      const req = createSyntheticRequest({
          method: "get",
          path: "/users/123",
          query: { a: "b" },
        }),
        subReq = condition.subRequest(req);
      expect(subReq.query).toEqual(req.query);
    });

    it("should return a sub-request with updated params", () => {
      const condition = new ContextConditionPath2(
        /^\/users\/(?<id>\d+)\/posts\/(?<postId>\d+)$/
      );

      const req = createSyntheticRequest({
          method: "get",
          path: "/users/123/posts/456",
        }),
        subReq = condition.subRequest(req);
      expect(subReq.params).toHaveProperty("id", "123");
      expect(subReq.params).toHaveProperty("postId", "456");
    });
  });

  describe("parse()", () => {
    describe("applies", () => {
      it("should return true if the request path starts with the specified path", () => {
        const condition = new ContextConditionPath2(/^\/users\/\d+$/);

        const req = createSyntheticRequest({
          method: "get",
          path: "/users/123",
        });

        expect(condition.parse(req).applies).toBe(true);
      });

      it("should return false if the request path does not start with the specified path", () => {
        const condition = new ContextConditionPath2(/^\/users\/\d+$/);

        const req = createSyntheticRequest({
          method: "get",
          path: "/products/123",
        });

        expect(condition.parse(req).applies).toBe(false);
      });
    });

    describe("subRequest()", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d/);

      const req = createSyntheticRequest({
          method: "get",
          path: "/users/123",
        }),
        subReq = condition.parse(req).subRequest(req);

      it("should return a sub request with the same method", () => {
        expect(subReq.method).toEqual(req.method);
      });

      it("should return a sub request the path starting from the part checked for", () => {
        expect(subReq.path).toEqual("23");
      });

      it("should return a sub request with the same query", () => {
        const req = createSyntheticRequest({
            method: "get",
            path: "/users/123",
            query: { a: "b" },
          }),
          subReq = condition.parse(req).subRequest(req);
        expect(subReq.query).toEqual(req.query);
      });

      it("should return a sub-request with updated params", () => {
        const condition = new ContextConditionPath2(
          /^\/users\/(?<id>\d+)\/posts\/(?<postId>\d+)$/
        );

        const req = createSyntheticRequest({
            method: "get",
            path: "/users/123/posts/456",
          }),
          subReq = condition.parse(req).subRequest(req);
        expect(subReq.params).toHaveProperty("id", "123");
        expect(subReq.params).toHaveProperty("postId", "456");
      });
    });

    describe("parameters()", () => {
      const condition = new ContextConditionPath2(
        /^\/users\/(?<id>\d+)\/posts\/(?<postId>\d+)$/
      );

      const req = createSyntheticRequest({
        method: "get",
        path: "/users/123/posts/456",
      });

      it("should return a object with the parameters", () => {
        expect(condition.parse(req).parameters()).toEqual({
          id: "123",
          postId: "456",
        });
      });
    });
  });

  describe("info()", () => {
    it("should return a Object info representation of the condition", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      expect(condition.info()).toEqual({
        path: "[^\\/users\\/\\d+$]",
      });
    });
  });

  describe("toJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      expect(condition.toJson()).toEqual({
        flags: "",
        path: "^\\/users\\/\\d+$",
        type: "path2",
      });
    });
  });

  describe("infoJson()", () => {
    it("should return a JSON representation of the condition", () => {
      const condition = new ContextConditionPath2(/^\/users\/\d+$/);

      expect(condition.infoJson()).toEqual({
        path2: "^\\/users\\/\\d+$",
      });
    });
  });

  describe("equals()", () => {
    it("should return false if condition is not an instance of ContextConditionPath2", () => {
      const condition1 = new ContextConditionPath2(/^\/users\/\d+$/);
      const condition2 = new ContextConditionMethod("get");

      expect(condition1.equals(condition2)).toBe(false);
    });

    it("should return true if the paths are equal", () => {
      const condition1 = new ContextConditionPath2(/^\/users\/\d+$/);
      const condition2 = new ContextConditionPath2(/^\/users\/\d+$/);

      expect(condition1.equals(condition2)).toBe(true);
    });

    it("should return false if the paths are not equal", () => {
      const condition1 = new ContextConditionPath2(/^\/users\/\d+$/);
      const condition2 = new ContextConditionPath2(/^\/products\/\d+$/);

      expect(condition1.equals(condition2)).toBe(false);
    });

    it("should return true if the flags are equal", () => {
      const condition1 = new ContextConditionPath2(/^\/users\/\d+$/);
      const condition2 = new ContextConditionPath2(/^\/users\/\d+$/);

      expect(condition1.equals(condition2)).toBe(true);
    });
  });
});

// // Add tests for ContextConditionPath2 and ContextConditionMethod in a similar manner

// describe("ConditionChain", () => {
//   it("should return true if all conditions in the chain apply", () => {
//     const condition1 = new ContextConditionPath("/users");
//     const condition2 = new ContextConditionMethod("get");
//     const condition3 = new ContextConditionPath2(/^\/products\/\d+$/);

//     const chain = new ConditionChain([condition1, condition2, condition3]);

//     const req = {
//       method: "get",
//       path: "/products/123",
//     };

//     expect(chain.appliesTo(req)).toBe(true);
//   });

//   it("should return false if any condition in the chain does not apply", () => {
//     const condition1 = new ContextConditionPath("/users");
//     const condition2 = new ContextConditionMethod("get");
//     const condition3 = new ContextConditionPath2(/^\/products\/\d+$/);

//     const chain = new ConditionChain([condition1, condition2, condition3]);

//     const req = {
//       method: "POST",
//       path: "/products/abc",
//     };

//     expect(chain.appliesTo(req)).toBe(false);
//   });
// });
