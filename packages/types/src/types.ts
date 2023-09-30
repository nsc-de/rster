import { ConversionRegister } from "./conversion";

type RemoveProperty<TYPE, PROPERTY> = {
  [key in keyof TYPE as key extends PROPERTY ? never : key]: TYPE[key];
};

/**
 * Shortcut for AllowAnyTypeInformation
 */
export type AllowAnyTypeInformation = RemoveProperty<
  TypeInformation<any>,
  "check"
>; //  & {
//   check(value: unknown): boolean;
// };

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
      this.importFromString.bind(this) as (value: string) => PrimitiveType<this>
    );
  }

  /**
   * Checks if the given value is of the type defined by this type information
   *
   * @param value - The value to check
   */
  abstract check<U>(value: U): Extends<U, T>;

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
export type PrimitiveType<TYPE extends AllowAnyTypeInformation> =
  TYPE extends TypeInformation<infer T> ? T : never;

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

export type TypeInformationAccepting<TYPE> = TypeInformation<any> & {
  check(value: TYPE): true;
};

export type Extends<TYPE, EXTENDS> = TYPE extends EXTENDS ? true : false;
