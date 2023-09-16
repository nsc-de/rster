import { DataProcessingLayer, PassThrough } from "./data_processing";

describe("DataProcessingLayer", () => {
  it("should create a DataProcessingLayer", () => {
    const layer = new DataProcessingLayer(null, {});
    expect(layer).toBeDefined();
  });
  it("should create a DataProcessingLayer with a next layer", () => {
    const layer = new DataProcessingLayer({}, {});
    expect(layer).toBeDefined();
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

  it("should throw an error if passthrough is given but the function is not available", () => {
    expect(
      () =>
        new DataProcessingLayer(
          {},
          {
            a: PassThrough,
          }
        )
    ).toThrowError(
      "Invalid schema, cannot passthrough key a as it does not exist in output layer"
    );
  });
});
