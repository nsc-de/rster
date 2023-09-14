import { undefinedType } from "@rster/types";
import { RsterApiMethod } from "./method";
import { RsterApiModule } from "./module";
import {
  ContextChildCondition,
  ContextConditionAnd,
  ContextConditionMethod,
  ContextConditionPath,
} from "@rster/basic";
import { RsterApi } from "./api";

describe("RsterApi", () => {
  describe("#constructor()", () => {
    it("should create a new RsterApi", () => {
      const module = new RsterApi("test", ["test"], {}, {});
      expect(module).toBeInstanceOf(RsterApi);
    });
  });

  describe("#json()", () => {
    it("should return the json representation of the module", () => {
      const module = new RsterApi("test", ["test"], {}, {});
      expect(module.json()).toEqual({
        name: "test",
        description: ["test"],
        modules: [],
        methods: [],
      });
    });

    it("should return the json representation of the module with submodules", () => {
      const module = new RsterApi(
        "test",
        ["test"],
        { test: new RsterApiModule("test", ["test"], {}, {}, "/test", "get") },
        {}
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
      });
    });

    it("should return the json representation of the module with methods", () => {
      const module = new RsterApi(
        "test",
        ["test"],
        {},
        {
          test: new RsterApiMethod(
            "test",
            ["test"],
            {
              returns: undefinedType(),
            },
            "/test",
            "get"
          ),
        }
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
      });
    });

    it("should return the json representation of the module with submodules and methods", () => {
      const module = new RsterApi(
        "test",
        ["test"],
        {
          test: new RsterApiModule("test", ["test"], {}, {}, "/test", "get"),
          test2: new RsterApiModule(
            "test2",
            ["test"],
            {},
            {
              test: new RsterApiMethod(
                "test",
                ["test"],
                {
                  returns: undefinedType(),
                },
                "/test",
                "get"
              ),
            },
            "/test",
            "get"
          ),
        },
        {}
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
            name: "test2",
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
      });
    });
  });

  describe("#rest()", () => {
    it("should create the rest representation of the module", () => {
      const it = new RsterApi("test", ["test"], {}, {});

      const api = it.rest();

      expect(api.children).toHaveLength(0);
      expect(api.description()).toEqual(["test"]);
    });

    it("should create the rest representation of the module with submodules", () => {
      const it = new RsterApi(
        "test",
        ["test"],
        { test: new RsterApiModule("test", ["test"], {}, {}, "/test", "get") },
        {}
      );

      const api = it.rest();

      expect(api.description()).toEqual(["test"]);

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

    it("should create the rest representation of the module with methods", () => {
      const it = new RsterApi(
        "test",
        ["test"],
        {},
        {
          test: new RsterApiMethod(
            "test",
            ["test"],
            {
              returns: undefinedType(),
            },
            "/test",
            "get"
          ),
        }
      );

      const api = it.rest();

      expect(api.description()).toEqual(["test"]);

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
      expect(ctx.children[0].type).toEqual("action");
      expect(ctx.description()).toEqual(["test"]);
    });
  });

  describe("#native()", () => {
    it("should return an empty object if no methods or submodules", () => {
      const module = new RsterApi("test", ["test"], {}, {});
      expect(module.native()).toEqual({});
    });

    it("should add all submodules to an object", () => {
      const module = new RsterApi(
        "test",
        ["test"],
        { test: new RsterApiModule("test", ["test"], {}, {}, "/test", "get") },
        {}
      );

      module.native();
      expect(module.native()).toEqual({
        test: {},
      });
    });

    it("should add all methods to an object", () => {
      const module = new RsterApi(
        "test",
        ["test"],
        {},
        {
          test: new RsterApiMethod(
            "test",
            ["test"],
            {
              returns: undefinedType(),
            },
            "/test",
            "get"
          ),
        }
      );
      const native = module.native();

      expect(native).toHaveProperty("test");
      expect(native.test).toBeInstanceOf(Function);
    });

    it("should add all submodules and methods to an object", () => {
      const module = new RsterApi(
        "test",
        ["test"],
        {
          test: new RsterApiModule("test", ["test"], {}, {}, "/test", "get"),
        },
        {
          test: new RsterApiMethod(
            "test",
            ["test"],
            {
              returns: undefinedType(),
            },
            "/test",
            "get"
          ),
        }
      );
      const native = module.native();

      expect(native).toHaveProperty("test");
      expect(native.test).toBeInstanceOf(Function);
    });

    it("should merge submodules and methods with the same name", () => {
      const module = new RsterApi(
        "test",
        ["test"],
        {
          test: new RsterApiModule(
            "test",
            ["test"],
            {
              test: new RsterApiModule(
                "test",
                ["test"],
                {},
                {},
                "/test",
                "get"
              ),
            },
            {},
            "/test",
            "get"
          ),
        },
        {
          test: new RsterApiMethod(
            "test",
            ["test"],
            {
              returns: undefinedType(),
            },
            "/test",
            "get",
            () => {}
          ),
        }
      );
      const native = module.native();

      expect(native).toHaveProperty("test");
      expect(native.test).toBeInstanceOf(Function);

      expect(native.test()).toEqual(undefined);

      expect(native.test.test).toEqual({});
    });
  });
});
