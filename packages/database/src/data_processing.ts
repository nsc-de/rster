import { DeepMapOptional, RemoveThisParam } from "@rster/common";

/**
 * PassThrough is a special value that can be used in the schema to indicate that the value should be passed through to the next layer.
 * PassThrough is only valid if the next layer is an object and the key exists in the next layer.
 */
export const PassThrough = "$__passThrough__";

/**
 * Type for {@link PassThrough}
 */
export type PassThroughType = typeof PassThrough;

/**
 * The this object provided to the data processing functions.
 *
 * {@link NEXT_LAYER} is the next layer of the data processing schema. Available as `this.nextLayer`.
 */
export type DataProcessingThis<
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown
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
  ...args: any
) => any;

/**
 * A data processing function in external form. It's the same as {@link DataProcessingFunction} but without the this parameter.
 * The this parameter would cause issues on calling because typescript would find that the this parameter will not match it's type.
 */
export type DataProcessingFunctionExternal = (...data: any) => any;

/**
 * Converts a {@link DataProcessingFunction} to a {@link DataProcessingFunctionExternal}
 * @param func the function to convert
 * @returns the converted function
 */
export type DataProcessingFunctionToExternal<
  func extends DataProcessingFunction<any>
> = RemoveThisParam<func>;

/**
 * The base schema for data processing. It does not contain PassThrough, so it can be used for the base layer.
 * @param NEXT_LAYER the next layer of the data processing schema. Available as `this.nextLayer`.
 */
export type DataProcessingBaseSchema<
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown
> = {
  [key: string]:
    | DataProcessingBaseSchema<NEXT_LAYER>
    | DataProcessingFunction<NEXT_LAYER>;
};

export type DataProcessingSchema<
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown,
  NEXT_SCHEMA extends DataProcessingBaseSchema<NEXT_LAYER> = DataProcessingBaseSchema<NEXT_LAYER>
> =
  | DeepMapOptional<
      NEXT_SCHEMA,
      PassThroughType | DataProcessingBaseSchema<NEXT_LAYER> //TODO
    >
  | DataProcessingBaseSchema<NEXT_LAYER>;

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
    : undefined;
} & DataProcessingBaseSchema<NEXT_LAYER>;

export type DataProcessingSchemaExternal = {
  [key: string]: DataProcessingSchemaExternal | DataProcessingFunctionExternal;
};

export type DeepMapRemoveThisParam<T> = T extends object
  ? {
      [P in keyof T]: T[P] extends (...args: any) => any
        ? RemoveThisParam<T[P]>
        : T[P] extends object
        ? DeepMapRemoveThisParam<T[P]>
        : T[P];
    }
  : T;

export type DataProcessingSchemaToExternal<
  T extends DataProcessingSchema<any>,
  EQUIVALENT,
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown
> = DeepMapRemoveThisParam<
  DeepMapDataProcessingSchema<T, EQUIVALENT, NEXT_LAYER>
>;

export class DataProcessingLayer<
  INPUT_SCHEMA extends DataProcessingSchema<NEXT_LAYER>,
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown
> {
  constructor(
    public readonly nextLayer: NEXT_LAYER,
    public readonly inputSchema: INPUT_SCHEMA
  ) {}

  public functions: DataProcessingSchemaToExternal<
    INPUT_SCHEMA,
    NEXT_LAYER,
    NEXT_LAYER
  > = this._createFunctionMap(this.inputSchema, this.nextLayer, []);

  private _createFunctionMap(
    inputSchema: Record<string, any>,
    outputSchema: DataProcessingBaseSchema<any> | undefined | unknown,
    path: string[]
  ): any {
    const functions: Record<string, any> = {};
    const functionThis = { nextLayer: this.nextLayer };

    for (const [key, value] of Object.entries(inputSchema)) {
      if (value === PassThrough) {
        if (typeof outputSchema !== "object" || outputSchema === null) {
          throw new Error(
            `Invalid schema, cannot passthrough if output layer is not existent`
          );
        }
        if (outputSchema === undefined || !(key in outputSchema)) {
          throw new Error(
            `Invalid schema, cannot passthrough key ${[...path, key].join(
              "."
            )} as it does not exist in output layer`
          );
        }

        functions[key] = (outputSchema as any)[key];
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
          typeof outputSchema === "object" &&
            outputSchema !== null &&
            key in outputSchema
            ? (outputSchema as any)[key]
            : undefined,
          [...path, key]
        );
        continue;
      }
      throw new Error(
        `Invalid schema, key ${[...path, key].join(
          "."
        )} is not a function or object`
      );
    }

    return functions;
  }

  public layer<
    INPUT_SCHEMA extends DataProcessingSchema<typeof this.functions>
  >(inputSchema: INPUT_SCHEMA) {
    return new DataProcessingLayer(this.functions, inputSchema);
  }
}

export function createDataProcessingLayer<
  INPUT_SCHEMA extends DataProcessingSchema<NEXT_LAYER>,
  NEXT_LAYER
>(nextLayer: NEXT_LAYER, inputSchema: INPUT_SCHEMA) {
  return new DataProcessingLayer(nextLayer, inputSchema);
}
