import {
  AllowAnyTypeInformation,
  AnyBooleanTypeInformation,
  AnyNumberTypeInformation,
  AnyStringTypeInformation,
  ArrayTypeInformation,
  BooleanTypeInformation,
  NumberRangeTypeInformation,
  NumberTypeInformation,
  ObjectTypeInformation,
  StringTypeInformation,
} from "../types";

/**
 * Level 0: string, number, boolean, null, undefined
 * Level 0 are very primitive databases like a json file
 * @see DatabaseLevel1
 * @see DatabaseLevel0Object
 * @see DatabaseLevel0NestedObject
 * @see DatabaseLevel0NestedArray
 */
export type DatabaseLevel0Value = string | number | boolean | null | undefined;

/**
 * Level 0 Database Object: {@link { [key: string]: DatabaseLevel0Value }}
 * Level 0 Databases are very primitive databases like a json file
 *
 * @see DatabaseLevel1
 * @see DatabaseLevel0
 * @see DatabaseLevel0NestedObject
 * @see DatabaseLevel0NestedArray
 */
export type DatabaseLevel0Object = Record<string, DatabaseLevel0Value>;

/**
 * Level 0 Nested Object: {@link { [key: string]: DatabaseLevel0Value | DatabaseLevel0Object | DatabaseLevel0Object }}
 * Level 0 Databases are very primitive databases like a json file. This type is used for databases that support nested objects.
 * @see DatabaseLevel1
 * @see DatabaseLevel0
 * @see DatabaseLevel0Object
 * @see DatabaseLevel0NestedArray
 */
export type DatabaseLevel0NestedObject = Record<
  string,
  DatabaseLevel0Value | DatabaseLevel0Object | DatabaseLevel0Object
>;

/**
 * Level 0 Nested Array: {@link DatabaseLevel0Value[]}
 * Level 0 Databases are very primitive databases like a json file. This type is used for databases that support nested arrays.
 * @see DatabaseLevel1
 * @see DatabaseLevel0
 * @see DatabaseLevel0Object
 * @see DatabaseLevel0NestedObject
 */
export type DatabaseLevel0NestedArray = (
  | DatabaseLevel0Value
  | DatabaseLevel0Object
  | DatabaseLevel0NestedObject
  | DatabaseLevel0NestedArray
)[];

/**
 * Level 1: Level 0 | Date
 * Level 1 are databases like MongoDB
 * @see DatabaseLevel0Value
 */
export type DatabaseLevel1Value = DatabaseLevel0Value | Date;

/**
 * Level 1 Database Object: {@link { [key: string]: DatabaseLevel1Value }}
 * Level 1 Databases are databases like MongoDB
 * @see DatabaseLevel0Object
 */
export type DatabaseLevel1Object = Record<string, DatabaseLevel1Value>;

/**
 * Level 1 Nested Object: {@link { [key: string]: DatabaseLevel1Value | DatabaseLevel1Object | DatabaseLevel1Object }}
 * Level 1 Databases are databases like MongoDB. This type is used for databases that support nested objects.
 * @see DatabaseLevel0NestedObject
 * @see DatabaseLevel1
 * @see DatabaseLevel1Object
 * @see DatabaseLevel1NestedArray
 * @see DatabaseLevel1NestedObject
 */
export type DatabaseLevel1NestedObject = Record<
  string,
  DatabaseLevel1Value | DatabaseLevel1Object | DatabaseLevel1Object
>;

/**
 * Level 1 Nested Array: {@link DatabaseLevel1Value[]}
 * Level 1 Databases are databases like MongoDB. This type is used for databases that support nested arrays.
 * @see DatabaseLevel0NestedArray
 * @see DatabaseLevel1
 * @see DatabaseLevel1Object
 * @see DatabaseLevel1NestedObject
 */
export type DatabaseLevel1NestedArray = (
  | DatabaseLevel1Value
  | DatabaseLevel1Object
  | DatabaseLevel1NestedObject
  | DatabaseLevel1NestedArray
)[];

export type ALL_OPTIONAL<T extends Record<string, any>> = {
  [key in keyof T]?: T[key] | undefined;
};

export type Level0TypeInformation =
  | StringTypeInformation<string>
  | AnyStringTypeInformation
  | NumberTypeInformation<number>
  | AnyNumberTypeInformation
  | NumberRangeTypeInformation<number, number>
  | BooleanTypeInformation<boolean>
  | AnyBooleanTypeInformation;

export type Level0TypeInformationNested =
  | Level0TypeInformation
  | ObjectTypeInformation<Record<string, AllowAnyTypeInformation>> // TODO: Is there a better way to do this?
  | ArrayTypeInformation<AllowAnyTypeInformation>;

/**
 * Database Adapter
 * @see DatabaseLevel0
 */
export interface DatabaseLevel0Adapter {
  readonly level: 0;
  readonly nested: false;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  exists(table: string): Promise<boolean>;
  create(
    table: string,
    options: {
      ifNotExists?: boolean;
      table: Record<
        string,
        | StringTypeInformation<string>
        | AnyStringTypeInformation
        | NumberTypeInformation<number>
        | AnyNumberTypeInformation
        | NumberRangeTypeInformation<number, number>
        | BooleanTypeInformation<boolean>
        | AnyBooleanTypeInformation
      >;
    }
  ): Promise<void>;
  drop(
    table: string,
    options: {
      ifExists?: boolean;
    }
  ): Promise<void>;
  get(
    table: string,
    search: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<DatabaseLevel0Object[]>;

  insert(
    table: string,
    data: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<void>;

  update(
    table: string,
    search: DatabaseLevel0Object,
    data: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  delete(
    table: string,
    search: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  count(
    table: string,
    search: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;
}

/**
 * Database Adapter Level 0 with nesting support
 */
export interface DatabaseLevel0AdapterNested {
  readonly level: 0;
  readonly nested: true;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  exists(table: string): Promise<boolean>;
  create(
    table: string,
    options: {
      ifNotExists?: boolean;
      table: Record<
        string,
        | StringTypeInformation<string>
        | AnyStringTypeInformation
        | NumberTypeInformation<number>
        | AnyNumberTypeInformation
        | NumberRangeTypeInformation<number, number>
        | BooleanTypeInformation<boolean>
        | AnyBooleanTypeInformation
      >;
    }
  ): Promise<void>;
  drop(
    table: string,
    options: {
      ifExists?: boolean;
    }
  ): Promise<void>;
  get(
    table: string,
    search: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<DatabaseLevel0Object[]>;

  insert(
    table: string,
    data: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<void>;

  update(
    table: string,
    search: DatabaseLevel0Object,
    data: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  delete(
    table: string,
    search: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  count(
    table: string,
    search: DatabaseLevel0Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;
}

/**
 * Database Adapter Level 1
 * @see DatabaseLevel1
 */
export interface DatabaseLevel1Adapter {
  readonly level: 1;
  readonly nested: false;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  exists(table: string): Promise<boolean>;
  create(
    table: string,
    options: {
      ifNotExists?: boolean;
      table: Record<string, Level0TypeInformationNested>;
    }
  ): Promise<void>;
  drop(
    table: string,
    options: {
      ifExists?: boolean;
    }
  ): Promise<void>;
  get(
    table: string,
    search: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<DatabaseLevel1Object[]>;

  insert(
    table: string,
    data: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<void>;

  update(
    table: string,
    search: DatabaseLevel1Object,
    data: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  delete(
    table: string,
    search: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  count(
    table: string,
    search: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;
}

/**
 * Database Adapter Level 1 with nesting support
 */
export interface DatabaseLevel1AdapterNested {
  readonly level: 1;
  readonly nested: true;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  exists(table: string): Promise<boolean>;
  create(
    table: string,
    options: {
      ifNotExists?: boolean;
      table: Record<string, Level0TypeInformationNested>;
    }
  ): Promise<void>;
  drop(
    table: string,
    options: {
      ifExists?: boolean;
    }
  ): Promise<void>;
  get(
    table: string,
    search: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<DatabaseLevel1Object[]>;

  insert(
    table: string,
    data: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<void>;

  update(
    table: string,
    search: DatabaseLevel1Object,
    data: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  delete(
    table: string,
    search: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  count(
    table: string,
    search: DatabaseLevel1Object,
    options: {
      limit?: number;
    }
  ): Promise<number>;
}
