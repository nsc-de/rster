import { ConversionRegister } from "./conversion";

/**
 * Shortcut for AllowAnyTypeInformation
 */
export type AllowAnyTypeInformation = TypeInformation<any>;

/**
 * Type for destructed type information
 */
export type DestructedType =
  | string
  | number
  | boolean
  | null
  | undefined
  | DestructedType[]
  | { [key: string]: DestructedType };

/**
 * Different ways to send data to the server
 *
 * query: Send data as query parameters
 * body: Send data as JSON in the body
 * param: Send data as a path parameter
 */
export type SendMethod = "param" | "body" | "query";

export interface JsonCompatibleObject {
  [key: string]: JsonCompatible;
}

export type JsonCompatibleArray = JsonCompatible[];

export type JsonCompatible =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonCompatibleArray
  | JsonCompatibleObject;

export abstract class TypeInformation<T> {
  constructor() {
    // Register the type in the conversion register
    this.__registerType();
  }

  private __registerType() {
    // Register the type in the conversion register
    ConversionRegister.instance.register(
      this,
      this.identifier,
      this.exportToString.bind(this),
      this.importFromString.bind(this)
    );
  }

  /**
   * Checks if the given value is of the type defined by this type information
   *
   * @param value - The value to check
   */
  abstract check(value: any): value is T;

  /**
   * Get a list of methods that can be used to send this type to the server
   */
  abstract sendableVia(): SendMethod[];

  /**
   * Checks if the given method can be used to send this type to the server
   *
   * @param m - The method to check
   */
  abstract sendableVia(m: SendMethod): boolean;

  /**
   * This is not a real property, but a hack to get the type of the type information
   * This is used to get the type of the type information for typescript to infer
   * It's return type should represent the typescript type of the type information
   * It can return or do basically anything, as it will never be called by the API and
   * SHOULD NOT be called by the user, only using `typeof` operator
   *
   * @readonly This is not a real property, but a hack to get the type of the type information
   * @abstract This is not a real property, but a hack to get the type of the type information
   * @type {T} This is the important part, it should represent the typescript type of the type information
   * @memberof TypeInformation This is not a real property, but a hack to get the type of the type information
   */
  abstract get type(): T;

  abstract get identifier(): string;
  abstract exportToString(value: T): string;
  abstract importFromString(value: string): T;
  abstract exportToJson(value: T): JsonCompatible;
  abstract importFromJson(value: JsonCompatible): T;

  abstract json(): unknown;
}

/**
 * Type utility for converting a type to not include undefined
 */
export type NoUndefined<TYPE, ALTERNATIVE> = TYPE extends undefined
  ? ALTERNATIVE
  : TYPE;

/**
 * Type utility for converting a type a type information to it's typescript equivalent
 * @typeParam TYPE - The type information to convert
 * @see TypeInformation
 * @see TypeInformation.type
 * @see MapToPrimitiveType
 * @see TypeInformationFor
 */
export type PrimitiveType<TYPE extends AllowAnyTypeInformation> = TYPE["type"];

/**
 * Type utility for converting typescript types to type information
 * @typeParam TYPE - The type to convert
 * @see TypeInformation
 * @see TypeInformation.type
 * @see PrimitiveType
 */
export type TypeInformationFor<TYPE> = TypeInformation<TYPE>;

/**
 * Type utility for converting a map of type information to their typescript equivalents
 * @typeParam TYPE - The map of type information to convert
 * @see TypeInformation
 * @see TypeInformation.type
 * @see PrimitiveType
 */
export type MapToPrimitiveType<
  TYPE extends Record<string, { type: AllowAnyTypeInformation }>
> = {
  [key in keyof TYPE]: PrimitiveType<TYPE[key]["type"]>;
};
