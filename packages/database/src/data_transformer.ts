import {
  AllowAnyTypeInformation,
  ObjectTypeInformation,
  PrimitiveType,
  TypeInformationFor,
} from "@rster/types";
import { DatabaseDefinition } from "./database";

/**
 * Transformer for data that is read from or written to the database.
 * (For example you could hash passwords when writing to the database)
 *
 * @template DATA_TYPE The type of the data in the database
 * @template INPUT_TYPE The type of the data that is read from the database
 * @template OUTPUT_TYPE The type of the data that is written to the database
 * @template DATA The primitive type of the data in the database
 */
export interface DatabaseTransformer<
  DATA_TYPE extends ObjectTypeInformation<
    Record<
      string,
      {
        type: AllowAnyTypeInformation;
        required: boolean;
      }
    >
  >,
  INPUT_TYPE,
  OUTPUT_TYPE,
  DATA extends PrimitiveType<DATA_TYPE> = PrimitiveType<DATA_TYPE>
> {
  /**
   * Transfomer for data that is written to the database.
   */
  readonly input?: {
    /**
     * Transform function that transforms the data before it is written to the database
     * @param data The data that is written to the database
     */
    transform(data: INPUT_TYPE): Promise<DATA> | DATA;

    /**
     * The type information of the data that is written to the database
     * (This is used to validate the data before it is written to the database)
     */
    type: TypeInformationFor<INPUT_TYPE>;
  };

  /**
   * Transformer for data that is read from the database
   */
  readonly output?: {
    /**
     * Transform function that transforms the data after it is read from the database
     * @param data The data that is read from the database
     */
    transform(data: DATA): Promise<OUTPUT_TYPE> | OUTPUT_TYPE;

    /**
     * The type information of the data that is read from the database
     * (This is used to validate the data after it is read from the database)
     */
    type: TypeInformationFor<OUTPUT_TYPE>;
  };
}

/**
 * The default transformer type that does not transform the data
 */
export type NoTransformer<
  DATA_TYPE extends ObjectTypeInformation<
    Record<
      string,
      {
        type: AllowAnyTypeInformation;
        required: boolean;
      }
    >
  >
> = DatabaseTransformer<DATA_TYPE, DATA_TYPE, DATA_TYPE>;

/**
 * A map of transformers for each table in the database
 * @template DATABASE_DEFINITION The database definition
 */
export type DatabaseTransformerMap<
  DATABASE_DEFINITION extends DatabaseDefinition
> = {
  /**
   * The transformer for the table
   */
  [TABLE_NAME in keyof DATABASE_DEFINITION["tables"]]?: DatabaseTransformer<
    DATABASE_DEFINITION["tables"][TABLE_NAME],
    any,
    any
  >;
};

/**
 * Get the input type of a transformer
 * @template TRANSFORMER The transformer
 * @template ALT The type that is returned if the transformer is undefined
 */
export type GetTransformerInput<
  TRANSFORMER extends DatabaseTransformer<any, any, any> | undefined,
  ALT = never
> = TRANSFORMER extends DatabaseTransformer<any, infer DATA_TYPE, any>
  ? DATA_TYPE
  : ALT;

/**
 * Get the output type of a transformer
 * @template TRANSFORMER The transformer
 * @template ALT The type that is returned if the transformer is undefined
 */
export type GetTransformerOutput<
  TRANSFORMER extends DatabaseTransformer<any, any, any> | undefined,
  ALT = never
> = TRANSFORMER extends DatabaseTransformer<any, any, infer OUTPUT_TYPE>
  ? OUTPUT_TYPE
  : ALT;
