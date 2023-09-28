import { number } from "@rster/types";
import {
  DataProcessingLayer,
  PassThrough,
  createDataProcessingLayer,
} from "./data_processing";

describe("DataProcessingLayer", () => {
  it("should create a DataProcessingLayer", () => {
    const layer = new DataProcessingLayer(null, {});
    expect(layer).toBeDefined();
  });
  it("should create a DataProcessingLayer with a next layer", () => {
    const layer = new DataProcessingLayer({}, {});
    expect(layer).toBeDefined();
  });

  it("should work with function schemas", () => {
    const layer = new DataProcessingLayer(
      {},
      {
        a: () => {
          return 1;
        },
      }
    );
    expect(layer.functions.a).toBeInstanceOf(Function);
    expect(layer.functions.a()).toBe(1);
  });

  it("test PassThrough to copy next layer", () => {
    const layer = new DataProcessingLayer(
      {
        a: () => {
          return 1;
        },
      },
      PassThrough
    );

    expect(layer.functions.a).toBeInstanceOf(Function);
    expect(layer.functions.a()).toBe(1);
  });

  it("test PassThrough to copy next layer without a next layer", () => {
    expect(() => new DataProcessingLayer(null, PassThrough)).toThrowError(
      "Invalid schema, cannot passthrough in path  as there is no next layer"
    );

    expect(() => new DataProcessingLayer(undefined, PassThrough)).toThrowError(
      "Invalid schema, cannot passthrough in path  as there is no next layer"
    );
  });

  it("should work with object schemas", () => {
    const layer = new DataProcessingLayer(
      {},
      {
        a: {
          b: () => {
            return 1;
          },
        },
      }
    );
    expect(layer.functions.a.b).toBeInstanceOf(Function);
    expect(layer.functions.a.b()).toBe(1);
  });

  it("should throw an error if the schema is invalid", () => {
    expect(() => new DataProcessingLayer(null, { a: 1 })).toThrowError(
      "Invalid schema, key a is not a function or object"
    );
  });

  it("should passthrough a function if passthrough is given", () => {
    const layer = new DataProcessingLayer(
      {
        a: () => {
          return 1;
        },
      },
      { a: PassThrough }
    );
    expect(layer.functions.a).toBeInstanceOf(Function);
    expect(layer.functions.a()).toBe(1);
  });

  it("should passthrough an object if passthrough is given", () => {
    const layer = new DataProcessingLayer(
      {
        a: {
          b: () => {
            return 1;
          },
        },
      },
      { a: { b: PassThrough } }
    );
    expect(layer.functions.a.b).toBeInstanceOf(Function);
    expect(layer.functions.a.b()).toBe(1);
  });

  it("should throw an error if passthrough is given but the function is not available in next layer", () => {
    expect(
      () =>
        new DataProcessingLayer(
          {},
          {
            a: PassThrough,
          }
        )
    ).toThrowError(
      "Invalid schema, cannot passthrough key a as it does not exist in next layer"
    );
  });

  it("test #layer() to put another layer on top of the current one", () => {
    const layer = new DataProcessingLayer(
      {
        a: () => {
          return 1;
        },
      },
      { a: PassThrough }
    );
    const layer2 = layer.layer({ b: () => 2, a: PassThrough });
    expect(layer2.functions.a).toBeInstanceOf(Function);
    expect(layer2.functions.b).toBeInstanceOf(Function);
    expect(layer2.functions.a()).toBe(1);
    expect(layer2.functions.b()).toBe(2);
  });

  it("test this.nextLayer to get the next layer", () => {
    const layer = new DataProcessingLayer(
      {
        a: () => {
          return 1;
        },
      },
      {
        a: PassThrough,
        b: function () {
          return this.nextLayer.a();
        },
      }
    );
    expect(layer.nextLayer).toBeDefined();
    expect(layer.functions.a).toBeInstanceOf(Function);
    expect(layer.functions.a()).toBe(1);
    expect(layer.functions.b).toBeInstanceOf(Function);
    expect(layer.functions.b()).toBe(1);
  });

  it("test arguments", () => {
    const layer = new DataProcessingLayer(
      {},
      {
        add: function (a: number, b: number) {
          return a + b;
        },
      }
    );
    expect(layer.functions.add).toBeInstanceOf(Function);
    expect(layer.functions.add(1, 2)).toBe(3);
  });

  it("Test .layer(Passthrough) for a copy of the layer", () => {
    const layer = new DataProcessingLayer(
      {
        a: () => {
          return 1;
        },
      },
      { a: PassThrough }
    );
    const layer2 = layer.layer(PassThrough);
    expect(layer2.functions.a).toBeInstanceOf(Function);
    expect(layer2.functions.a()).toBe(1);
  });

  describe("#build()", () => {
    it("should build an rster builder api from the layer", () => {
      const layer = new DataProcessingLayer(
        {
          a: () => {
            return 1;
          },
        },
        { a: PassThrough }
      );
      const builder = layer.build({
        a: {
          returns: number(),
        },
      });
      expect(builder).toBeDefined();
      expect(builder.a).toBeInstanceOf(Function);
      expect(builder.a()).toBe(1);
      2;
    });
  });
});

describe("createDataProcessingLayer", () => {
  it("should create a DataProcessingLayer", () => {
    const layer = createDataProcessingLayer({
      a: () => {
        return 1;
      },
    });
    expect(layer).toBeDefined();
    expect(layer.functions.a).toBeInstanceOf(Function);
    expect(layer.functions.a()).toBe(1);
  });

  it("should create a DataProcessingLayer with a next layer", () => {
    const layer = createDataProcessingLayer(
      {
        a: () => {
          return 1;
        },
      },
      {
        b: () => {
          return 2;
        },
        a: PassThrough,
      }
    );
    expect(layer).toBeDefined();
    expect(layer.functions.a).toBeInstanceOf(Function);
    expect(layer.functions.a()).toBe(1);
    expect(layer.functions.b).toBeInstanceOf(Function);
    expect(layer.functions.b()).toBe(2);
  });
});
