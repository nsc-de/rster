import { undefinedType } from "@rster/types";
import { RsterApiMethod } from "./method";
import { RsterApiModule } from "./module";
import rest, {
  ContextChildCondition,
  ContextConditionAnd,
  ContextConditionMethod,
  ContextConditionPath,
} from "@rster/basic";

describe("RsterApiModule", () => {
  describe("#constructor()", () => {
    it("should create a new RsterApiModule", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [],
        "/test",
        "get"
      );
      expect(module).toBeInstanceOf(RsterApiModule);
    });
  });

  describe("#json()", () => {
    it("should return the json representation of the module", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [],
        "/test",
        "get"
      );
      expect(module.json()).toEqual({
        name: "test",
        description: ["test"],
        modules: [],
        methods: [],
        httpPath: "/test",
        httpMethod: "get",
      });
    });

    it("should return the json representation of the module with submodules", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [new RsterApiModule("test", ["test"], [], [], "/test", "get")],
        [],
        "/test",
        "get"
      );
      expect(module.json()).toEqual({
        name: "test",
        description: ["test"],
        modules: [
          {
            name: "test",
            description: ["test"],
            modules: [],
            methods: [],
            httpPath: "/test",
            httpMethod: "get",
          },
        ],
        methods: [],
        httpPath: "/test",
        httpMethod: "get",
      });
    });

    it("should return the json representation of the module with methods", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [
          new RsterApiMethod(
            "test",
            ["test"],
            {
              returns: undefinedType(),
            },
            "/test",
            "get"
          ),
        ],
        "/test",
        "get"
      );

      expect(module.json()).toEqual({
        name: "test",
        description: ["test"],
        modules: [],
        methods: [
          {
            declaration: {
              expectBody: undefined,
              expectParams: undefined,
              expectQuery: undefined,
              returns: {
                type: "undefined",
              },
            },
            description: ["test"],
            httpMethod: "get",
            httpPath: "/test",
            name: "test",
          },
        ],
        httpPath: "/test",
        httpMethod: "get",
      });
    });

    it("should return the json representation of the module with submodules and methods", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [
          new RsterApiModule("test", ["test"], [], [], "/test", "get"),
          new RsterApiModule(
            "test",
            ["test"],
            [],
            [
              new RsterApiMethod(
                "test",
                ["test"],
                {
                  returns: undefinedType(),
                },
                "/test",
                "get"
              ),
            ],
            "/test",
            "get"
          ),
        ],
        [],
        "/test",
        "get"
      );
      expect(module.json()).toEqual({
        name: "test",
        description: ["test"],
        modules: [
          {
            name: "test",
            description: ["test"],
            modules: [],
            methods: [],
            httpPath: "/test",
            httpMethod: "get",
          },
          {
            name: "test",
            description: ["test"],
            modules: [],
            methods: [
              {
                declaration: {
                  expectBody: undefined,
                  expectParams: undefined,
                  expectQuery: undefined,
                  returns: {
                    type: "undefined",
                  },
                },
                description: ["test"],
                httpMethod: "get",
                httpPath: "/test",
                name: "test",
              },
            ],
            httpPath: "/test",
            httpMethod: "get",
          },
        ],
        methods: [],
        httpPath: "/test",
        httpMethod: "get",
      });
    });
  });

  describe("#rest()", () => {
    it("should create the rest representation of the module", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [],
        "/test",
        "get"
      );

      const api = rest(function (ctx) {
        module.rest(ctx);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toEqual("condition");
      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionAnd);
      const condition = child.condition as ContextConditionAnd;
      expect(condition.conditions).toHaveLength(2);
      expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
      const pathCondition = condition.conditions[0] as ContextConditionPath;
      expect(pathCondition.path).toEqual("/test");
      expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
      const methodCondition = condition.conditions[1] as ContextConditionMethod;
      expect(methodCondition.method.toLowerCase()).toEqual("get");

      const ctx = child.context;

      expect(ctx.children).toHaveLength(0);
      expect(ctx.description()).toEqual(["test"]);
    });

    it("should create the rest representation of the module with submodules", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [new RsterApiModule("test", ["test"], [], [], "/test", "get")],
        [],
        "/test",
        "get"
      );

      const api = rest(function (ctx) {
        module.rest(ctx);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toEqual("condition");
      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionAnd);
      const condition = child.condition as ContextConditionAnd;
      expect(condition.conditions).toHaveLength(2);
      expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
      const pathCondition = condition.conditions[0] as ContextConditionPath;
      expect(pathCondition.path).toEqual("/test");
      expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
      const methodCondition = condition.conditions[1] as ContextConditionMethod;
      expect(methodCondition.method.toLowerCase()).toEqual("get");

      const ctx = child.context;

      expect(ctx.children).toHaveLength(1);
      expect(ctx.children[0].type).toEqual("condition");
      const child2 = ctx.children[0] as ContextChildCondition;
      expect(child2.condition).toBeInstanceOf(ContextConditionAnd);
      const condition2 = child2.condition as ContextConditionAnd;
      expect(condition2.conditions).toHaveLength(2);
      expect(condition2.conditions[0]).toBeInstanceOf(ContextConditionPath);
      const pathCondition2 = condition2.conditions[0] as ContextConditionPath;
      expect(pathCondition2.path).toEqual("/test");
      expect(condition2.conditions[1]).toBeInstanceOf(ContextConditionMethod);
      const methodCondition2 = condition2
        .conditions[1] as ContextConditionMethod;
      expect(methodCondition2.method.toLowerCase()).toEqual("get");

      const ctx2 = child2.context;

      expect(ctx2.children).toHaveLength(0);
      expect(ctx2.description()).toEqual(["test"]);
    });

    it("should create the rest representation of the module with methods", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [
          new RsterApiMethod(
            "test",
            ["test"],
            {
              returns: undefinedType(),
            },
            "/test",
            "get"
          ),
        ],
        "/test",
        "get"
      );

      const api = rest(function (ctx) {
        module.rest(ctx);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toEqual("condition");
      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionAnd);
      const condition = child.condition as ContextConditionAnd;
      expect(condition.conditions).toHaveLength(2);
      expect(condition.conditions[0]).toBeInstanceOf(ContextConditionPath);
      const pathCondition = condition.conditions[0] as ContextConditionPath;
      expect(pathCondition.path).toEqual("/test");
      expect(condition.conditions[1]).toBeInstanceOf(ContextConditionMethod);
      const methodCondition = condition.conditions[1] as ContextConditionMethod;
      expect(methodCondition.method.toLowerCase()).toEqual("get");

      const ctx = child.context;

      expect(ctx.children).toHaveLength(1);
      expect(ctx.children[0].type).toEqual("condition");
      const child2 = ctx.children[0] as ContextChildCondition;
      expect(child2.condition).toBeInstanceOf(ContextConditionAnd);
      const condition2 = child2.condition as ContextConditionAnd;
      expect(condition2.conditions).toHaveLength(2);
      expect(condition2.conditions[0]).toBeInstanceOf(ContextConditionPath);
      const pathCondition2 = condition2.conditions[0] as ContextConditionPath;
      expect(pathCondition2.path).toEqual("/test");
      expect(condition2.conditions[1]).toBeInstanceOf(ContextConditionMethod);
      const methodCondition2 = condition2
        .conditions[1] as ContextConditionMethod;
      expect(methodCondition2.method.toLowerCase()).toEqual("get");

      const ctx2 = child2.context;

      expect(ctx2.children).toHaveLength(1);
      expect(ctx2.children[0].type).toEqual("action");
      expect(ctx2.description()).toEqual(["test"]);
    });

    it("test rest without httpPath", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [],
        undefined,
        "get"
      );

      const api = rest(function (ctx) {
        module.rest(ctx);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toEqual("condition");
      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionMethod);
      const condition = child.condition as ContextConditionMethod;
      expect(condition.method.toLowerCase()).toEqual("get");

      const ctx = child.context;

      expect(ctx.children).toHaveLength(0);
      expect(ctx.description()).toEqual(["test"]);
    });

    it("test rest without httpMethod", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [],
        "/test",
        undefined
      );

      const api = rest(function (ctx) {
        module.rest(ctx);
      });

      expect(api.children).toHaveLength(1);
      expect(api.children[0].type).toEqual("condition");
      const child = api.children[0] as ContextChildCondition;
      expect(child.condition).toBeInstanceOf(ContextConditionPath);
      const condition = child.condition as ContextConditionPath;
      expect(condition.path).toEqual("/test");

      const ctx = child.context;

      expect(ctx.children).toHaveLength(0);
      expect(ctx.description()).toEqual(["test"]);
    });

    it("test rest without httpPath and httpMethod", () => {
      const module = new RsterApiModule(
        "test",
        ["test"],
        [],
        [],
        undefined,
        undefined
      );

      const api = rest(function (ctx) {
        module.rest(ctx);
      });

      expect(api.children).toHaveLength(0);
      expect(api.description()).toEqual(["test"]);
    });
  });
});
