/**
 * PassThrough is a special value that can be used in the schema to indicate that the value should be passed through to the next layer.
 * PassThrough is only valid if the next layer is an object and the key exists in the next layer.
 */
export const PassThrough = "$__passThrough__";

/**
 * Type for {@link PassThrough}
 */
export type PassThroughType = typeof PassThrough;

export type DeepMap<T, U> = {
  [P in keyof T]: T[P] extends object ? DeepMap<T[P], U> : U;
};

export type DeepMapOptional<T, U> = {
  [P in keyof T]?: T[P] extends object ? DeepMap<T[P], U> : U;
};

export type DataProcessingThis<
  NEXT_LAYER extends DataProcessingBaseSchema<any> | undefined | unknown
> = {
  nextLayer: NEXT_LAYER;
};

export type DataProcessingFunction<NEXT_LAYER> = (
  this: DataProcessingThis<NEXT_LAYER>,
  ...data: any
) => any;
export type DataProcessingFunctionExternal = (...data: any) => any;

export type Shift<T extends any[]> = ((...args: T) => void) extends (
  arg: any,
  ...rest: infer U
) => void
  ? U
  : never;

export type RemoveThisParam<T> = T extends (
  this: any,
  ...args: infer Args
) => infer R
  ? (...args: Args) => R
  : T;

export type DataProcessingFunctionToExternal<
  T extends DataProcessingFunction<any>
> = RemoveThisParam<T>;

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
}

// Example usage
type OriginalFunction = (this: any, a: number, b: string) => void;
type ModifiedFunction = RemoveThisParam<OriginalFunction>; //
