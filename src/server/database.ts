import { ObjectTypeInformation, PrimitiveType } from "./types";

/**
 * Define a Database
 */
interface DatabaseDefinition {
  /**
   * The tables in the database
   */
  tables: Record<string, ObjectTypeInformation<Record<string, any>>>;
}

/**
 * Level 0: string, number, boolean, null, undefined
 * Level 0 are very primitive databases like a json file
 * @see DatabaseLevel1
 * @see DatabaseLevel0Object
 * @see DatabaseLevel0NestedObject
 * @see DatabaseLevel0NestedArray
 */
type DatabaseLevel0Value = string | number | boolean | null | undefined;

/**
 * Level 0 Database Object: {@link { [key: string]: DatabaseLevel0Value }}
 * Level 0 Databases are very primitive databases like a json file
 *
 * @see DatabaseLevel1
 * @see DatabaseLevel0
 * @see DatabaseLevel0NestedObject
 * @see DatabaseLevel0NestedArray
 */
type DatabaseLevel0Object = Record<string, DatabaseLevel0Value>;

/**
 * Level 0 Nested Object: {@link { [key: string]: DatabaseLevel0Value | DatabaseLevel0Object | DatabaseLevel0Object }}
 * Level 0 Databases are very primitive databases like a json file. This type is used for databases that support nested objects.
 * @see DatabaseLevel1
 * @see DatabaseLevel0
 * @see DatabaseLevel0Object
 * @see DatabaseLevel0NestedArray
 */
type DatabaseLevel0NestedObject = Record<
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
type DatabaseLevel0NestedArray = (
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
type DatabaseLevel1Value = DatabaseLevel0Value | Date;

/**
 * Level 1 Database Object: {@link { [key: string]: DatabaseLevel1Value }}
 * Level 1 Databases are databases like MongoDB
 * @see DatabaseLevel0Object
 */
type DatabaseLevel1Object = Record<string, DatabaseLevel1Value>;

/**
 * Level 1 Nested Object: {@link { [key: string]: DatabaseLevel1Value | DatabaseLevel1Object | DatabaseLevel1Object }}
 * Level 1 Databases are databases like MongoDB. This type is used for databases that support nested objects.
 * @see DatabaseLevel0NestedObject
 * @see DatabaseLevel1
 * @see DatabaseLevel1Object
 * @see DatabaseLevel1NestedArray
 * @see DatabaseLevel1NestedObject
 */
type DatabaseLevel1NestedObject = Record<
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
type DatabaseLevel1NestedArray = (
  | DatabaseLevel1Value
  | DatabaseLevel1Object
  | DatabaseLevel1NestedObject
  | DatabaseLevel1NestedArray
)[];

type ALL_OPTIONAL<T extends Record<string, any>> = {
  [key in keyof T]?: T[key] | undefined;
};

/**
 * Database Adapter
 * @see DatabaseLevel0
 * @see DatabaseLevel1
 */
interface DatabaseAdapter<
  LEVEL extends 0 | 1,
  NESTED extends boolean = false,
  VALUE extends LEVEL extends 0
    ? DatabaseLevel0Value
    : DatabaseLevel1Value = LEVEL extends 0
    ? DatabaseLevel0Value
    : DatabaseLevel1Value,
  _$OBJECT extends LEVEL extends 0
    ? DatabaseLevel0Object
    : DatabaseLevel1Object = LEVEL extends 0
    ? DatabaseLevel0Object
    : DatabaseLevel1Object,
  _$NESTED_OBJECT extends LEVEL extends 0
    ? DatabaseLevel0NestedObject
    : DatabaseLevel1NestedObject = LEVEL extends 0
    ? DatabaseLevel0NestedObject
    : DatabaseLevel1NestedObject,
  _$NESTED_ARRAY extends LEVEL extends 0
    ? DatabaseLevel0NestedArray
    : DatabaseLevel1NestedArray = LEVEL extends 0
    ? DatabaseLevel0NestedArray
    : DatabaseLevel1NestedArray,
  OBJECT extends NESTED extends true
    ? _$NESTED_OBJECT
    : _$OBJECT = NESTED extends true ? _$NESTED_OBJECT : _$OBJECT
> {
  readonly level: LEVEL;
  readonly nested: NESTED;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  exists(table: string): Promise<boolean>;
  create(table: string): Promise<void>;
  get(
    table: string,
    search: ALL_OPTIONAL<OBJECT>,
    options: {
      limit?: number;
    }
  ): Promise<OBJECT[]>;

  insert(
    table: string,
    data: ALL_OPTIONAL<OBJECT>,
    options: {
      limit?: number;
    }
  ): Promise<OBJECT[]>;

  update(
    table: string,
    search: ALL_OPTIONAL<OBJECT>,
    data: ALL_OPTIONAL<OBJECT>,
    options: {
      limit?: number;
    }
  ): Promise<OBJECT[]>;
}

class $Database {
  readonly definition: DatabaseDefinition;
  constructor(definition: DatabaseDefinition) {
    this.definition = definition;
  }
}

export class TableTool<
  TD extends ObjectTypeInformation<Record<string, any>>,
  DB extends Database<DatabaseDefinition>
> {
  constructor(
    public readonly definition: TD,
    public readonly name: string,
    public readonly database: DB
  ) {}

  public async insert(data: PrimitiveType<TD>): Promise<void> {
    throw new Error("Not Implemented");
  }
}

export type Database<DEF extends DatabaseDefinition> = {
  [key in keyof DEF["tables"]]: TableTool<DEF["tables"][key], Database<DEF>>;
} & {
  readonly definition: DEF;
  readonly tables: DEF["tables"];
};
