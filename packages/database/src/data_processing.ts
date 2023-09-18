import { DeepMapOptional, RemoveThisParam } from "@rster/common";

class $$PASSTHROUGHCLASS {}

/**
 * PassThrough is a special value that can be used in the schema to indicate that the value should be passed through to the next layer.
 * PassThrough is only valid if the next layer is an object and the key exists in the next layer.
 */
export const PassThrough = new $$PASSTHROUGHCLASS();

/**
 * Type for {@link PassThrough}
 */
export type PassThroughType = $$PASSTHROUGHCLASS;

/**
 * The this object provided to the data processing functions.
 *
 * {@link NEXT_LAYER} is the next layer of the data processing schema. Available as `this.nextLayer`.
 */
export type DataProcessingThis<
  NEXT_LAYER extends DataProcessingBaseSchema<unknown> | undefined | unknown
> = {
  nextLayer: NEXT_LAYER;
};

/**
 * A data processing function.
 * @param this The this object provided to the data processing functions.
 * @param args the arguments passed to the function.
 */
export type DataProcessingFunction<NEXT_LAYER> = (
  this: DataProcessingThis<NEXT_LAYER>,
  ...args: unknown[]
) => unknown | Promise<unknown> | void | Promise<void>;

/**
 * A data processing function in external form. It's the same as {@link DataProcessingFunction} but without the this parameter.
 * The this parameter would cause issues on calling because typescript would find that the this parameter will not match it's type.
 */
export type DataProcessingFunctionExternal = (...data: unknown[]) => unknown;

/**
 * Converts a {@link DataProcessingFunction} to a {@link DataProcessingFunctionExternal}
 * @param func the function to convert
 * @returns the converted function
 */
export type DataProcessingFunctionToExternal<
  func extends DataProcessingFunction<unknown>
> = RemoveThisParam<func>;

/**
 * The base schema for data processing. It does not contain PassThrough, so it can be used for the base layer.
 * @param NEXT_LAYER the next layer of the data processing schema. Available as `this.nextLayer`.
 */
export type DataProcessingBaseSchema<
  NEXT_LAYER extends DataProcessingBaseSchema<unknown> | undefined | unknown
> = {
  [key: string]:
    | DataProcessingBaseSchema<NEXT_LAYER>
    | DataProcessingFunction<NEXT_LAYER>;
};

/**
 * The schema definition for data processing layers. Can contain PassThrough to pass the function/function map to the previous layer. (See {@link PassThrough})
 *
 * @param NEXT_LAYER the next layer of the data processing schema.
 * @param NEXT_SCHEMA the schema of the next layer. Automatically inferred from {@link NEXT_LAYER}.
 */
export type DataProcessingSchema<
  NEXT_LAYER extends DataProcessingBaseSchema<unknown> | undefined | unknown,
  NEXT_SCHEMA extends DataProcessingBaseSchema<NEXT_LAYER> = DataProcessingBaseSchema<NEXT_LAYER>
> =
  | DeepMapOptional<
      NEXT_SCHEMA,
      PassThroughType | DataProcessingBaseSchema<NEXT_LAYER> //TODO
    >
  | DataProcessingBaseSchema<NEXT_LAYER>;

/**
 * Deeply maps a DataProcessingSchema (recursively) to replace PassThrough with the equivalent value from the next layer.
 *
 * @param T the schema to map
 * @param EQUIVALENT the equivalent value from the next layer
 * @param NEXT_LAYER the next layer of the data processing schema (for PassThrough)
 */
export type DeepMapDataProcessingSchema<
  T,
  EQUIVALENT,
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown
> = {
  [P in keyof T]: T[P] extends PassThroughType
    ? P extends keyof EQUIVALENT
      ? EQUIVALENT[P]
      : never
    : T[P] extends (...args: any) => any
    ? T[P]
    : T[P] extends object
    ? DeepMapDataProcessingSchema<
        T[P],
        P extends keyof EQUIVALENT ? EQUIVALENT[P] : never,
        NEXT_LAYER
      >
    : T[P];
} & DataProcessingBaseSchema<NEXT_LAYER>;

/**
 * The DataProcessingSchema in its simple form (how the first layer should look like and how each layer should look like after PassThrough is replaced).
 */
export type DataProcessingSchemaExternal = {
  [key: string]: DataProcessingSchemaExternal | DataProcessingFunctionExternal;
};

/**
 * Deeply removes this parameter from functions in Object (recursively). Utility type to convert DataProcessingSchema to DataProcessingSchemaExternal.
 * (There would be issues with typescript if the this parameter is not removed, as we call the functions on a different object, but `this` is added via bind)
 */
export type DeepMapRemoveThisParam<T> = T extends object
  ? {
      [P in keyof T]: T[P] extends (...args: any) => any
        ? RemoveThisParam<T[P]>
        : T[P] extends object
        ? DeepMapRemoveThisParam<T[P]>
        : T[P];
    }
  : T;

/**
 * Converts a DataProcessingSchema to a DataProcessingSchemaExternal
 */
export type DataProcessingSchemaToExternal<
  T extends DataProcessingSchema<any>,
  EQUIVALENT,
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown
> = DeepMapRemoveThisParam<
  DeepMapDataProcessingSchema<T, EQUIVALENT, NEXT_LAYER>
>;

/**
 * The DataProcessingLayer is the main class for data processing. It contains the functions and the schema.
 */
export class DataProcessingLayer<
  INPUT_SCHEMA extends DataProcessingSchema<NEXT_LAYER>,
  NEXT_LAYER extends DataProcessingBaseSchema<unknown> | undefined | unknown
> {
  constructor(
    /**
     * The next layer of the data processing schema.
     */
    public readonly nextLayer: NEXT_LAYER,

    /**
     * The schema of the data processing layer.
     */
    public readonly inputSchema: INPUT_SCHEMA
  ) {
    this.functions = this._createFunctionMap(
      this.inputSchema,
      this.nextLayer,
      []
    );
  }

  /**
   * The function map of the data processing layer (created from the schema)
   */
  public functions: DataProcessingSchemaToExternal<
    INPUT_SCHEMA,
    NEXT_LAYER,
    NEXT_LAYER
  >;

  private _createFunctionMap(
    inputSchema: Record<string, any>,
    nextLayer: DataProcessingBaseSchema<any> | undefined | unknown,
    path: string[]
  ): any {
    // This is a recursive function that creates the function map from the schema.
    // Its main purpose is to replace PassThrough with the equivalent value from the next layer.
    // Also we catch the coresponding path for error messages.

    const functions: Record<string, any> = {};
    const functionThis = { nextLayer: this.nextLayer };

    for (const [key, value] of Object.entries(inputSchema)) {
      if (value === PassThrough) {
        if (
          typeof nextLayer !== "object" ||
          nextLayer === null ||
          nextLayer === undefined ||
          !(key in nextLayer)
        ) {
          throw new Error(
            `Invalid schema, cannot passthrough key ${[...path, key].join(
              "."
            )} as it does not exist in next layer`
          );
        }

        functions[key] = (nextLayer as any)[key];
        continue;
      }
      if (typeof value === "function") {
        ((func: (...args: any) => any) => {
          functions[key] = (...data: any) => {
            return func.apply(functionThis, data);
          };
        })(value);
        continue;
      }
      if (typeof value === "object") {
        functions[key] = this._createFunctionMap(
          value,
          typeof nextLayer === "object" &&
            nextLayer !== null &&
            key in nextLayer
            ? (nextLayer as any)[key]
            : undefined,
          [...path, key]
        );
        continue;
      }
      throw new Error(
        `Invalid schema, key ${[...path, key].join(
          "."
        )} is not a function or object in path ${[...path, key].join(".")}`
      );
    }

    return functions;
  }

  /**
   * Stack a new layer on top of the current layer. (returns a new DataProcessingLayer)
   * @param inputSchema the schema of the new layer
   * @returns the new DataProcessingLayer
   */
  public layer<
    INPUT_SCHEMA extends DataProcessingSchema<typeof this.functions>
  >(inputSchema: INPUT_SCHEMA) {
    return new DataProcessingLayer(this.functions, inputSchema);
  }
}

/**
 * Creates a new DataProcessingLayer
 * @param nextLayer The next layer of the data processing schema
 * @param inputSchema The schema of the data processing layer
 * @returns a new DataProcessingLayer
 */
export function createDataProcessingLayer<
  INPUT_SCHEMA extends DataProcessingSchema<NEXT_LAYER>,
  NEXT_LAYER
>(
  nextLayer: NEXT_LAYER,
  inputSchema: INPUT_SCHEMA
): DataProcessingLayer<INPUT_SCHEMA, NEXT_LAYER>;

/**
 * Creates a new DataProcessingLayer
 * @param inputSchema The schema of the data processing layer
 * @returns a new DataProcessingLayer
 */
export function createDataProcessingLayer<
  INPUT_SCHEMA extends DataProcessingSchema<null>
>(inputSchema: INPUT_SCHEMA): DataProcessingLayer<INPUT_SCHEMA, null>;

export function createDataProcessingLayer(
  nextLayer: any,
  inputSchema?: any
): any {
  if (inputSchema === undefined) {
    return new DataProcessingLayer(null, nextLayer);
  }
  return new DataProcessingLayer(nextLayer, inputSchema);
}
