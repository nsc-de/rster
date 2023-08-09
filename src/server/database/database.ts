import {
  RsterApiBuilderContext,
  RsterApiMethodBuilderContext,
  RsterApiModuleBuilderContext,
  api,
  method,
  module,
} from "../builder";
import {
  AllowAnyTypeInformation,
  ObjectTypeInformation,
  PrimitiveType,
  object,
} from "../basic/types";
import { DatabaseAdapter } from "./adapter";

/**
 * Define a Database
 */
export interface DatabaseDefinition {
  /**
   * The tables in the database
   */
  tables: Record<
    string,
    ObjectTypeInformation<
      Record<
        string,
        {
          type: AllowAnyTypeInformation;
          required: boolean;
        }
      >
    >
  >;
}

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
  INPUT_TYPE = PrimitiveType<DATA_TYPE>,
  OUTPUT_TYPE = INPUT_TYPE,
  DATA extends PrimitiveType<DATA_TYPE> = PrimitiveType<DATA_TYPE>
> {
  transformInput(data: INPUT_TYPE): Promise<DATA> | DATA;
  transformOutput(data: DATA): Promise<OUTPUT_TYPE> | OUTPUT_TYPE;
}

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
> = DatabaseTransformer<DATA_TYPE>;

export type DatabaseTransformerMap<
  DATABASE_DEFINITION extends DatabaseDefinition
> = {
  [TABLE_NAME in keyof DATABASE_DEFINITION["tables"]]: DatabaseTransformer<
    DATABASE_DEFINITION["tables"][TABLE_NAME]
  >;
};

class $Database<
  DEF extends DatabaseDefinition,
  TRANSFORMER extends DatabaseTransformerMap<DEF> = DatabaseTransformerMap<DEF>
> {
  constructor(
    public readonly definition: DEF,
    public readonly adapter: DatabaseAdapter<AllowAnyTypeInformation>,
    public transformer: TRANSFORMER = {} as TRANSFORMER
  ) {}

  private getTransformer<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME
  ): TRANSFORMER[TABLE_NAME] {
    return this.transformer[table] as TRANSFORMER[TABLE_NAME];
  }

  private async transformInput<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: Parameters<TRANSFORMER[TABLE_NAME]["transformInput"]>[0]
  ): Promise<PrimitiveType<DEF["tables"][TABLE_NAME]>> {
    const fn = await this.getTransformer(table)?.transformInput;
    if (fn) return await fn(data);
    else return data as PrimitiveType<DEF["tables"][TABLE_NAME]>;
  }

  private async transformOutput<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>
  ): Promise<Parameters<TRANSFORMER[TABLE_NAME]["transformOutput"]>[0]> {
    const fn = await this.getTransformer(table)?.transformOutput;
    if (fn) return await fn(data);
    else
      return data as Parameters<TRANSFORMER[TABLE_NAME]["transformOutput"]>[0];
  }

  public async insert<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: Parameters<TRANSFORMER[TABLE_NAME]["transformInput"]>[0],
    options?: Record<string, never>
  ): Promise<void> {
    this.adapter.insert(
      table as string,
      await this.transformInput(table, data),
      options
    );
  }

  public async get<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: Parameters<TRANSFORMER[TABLE_NAME]["transformInput"]>[0],
    options?: Record<string, never>
  ): Promise<Parameters<TRANSFORMER[TABLE_NAME]["transformOutput"]>[0]> {
    const result = (await this.adapter.get(
      table as string,
      await this.transformInput(table, data),
      options
    )) as unknown as Promise<PrimitiveType<DEF["tables"][TABLE_NAME]>>;
    return await this.transformOutput(table, result);
  }

  public async update<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    search: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.adapter.update(
      table as string,
      await this.transformInput(table, search),
      await this.transformInput(table, data),
      options
    );
  }

  public async delete<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.adapter.delete(
      table as string,
      await this.transformInput(table, data),
      options
    );
  }

  public async count<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.adapter.count(
      table as string,
      await this.transformInput(table, data),
      options
    );
  }

  public async create<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    definition: {
      [key in keyof DEF["tables"][TABLE_NAME]]: DEF["tables"][TABLE_NAME][key];
    },
    options?: {
      ifNotExists?: boolean;
    }
  ): Promise<void> {
    return this.adapter.create(table as string, definition as any, options);
  }

  public async drop<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    options?: {
      ifExists?: boolean;
    }
  ): Promise<void> {
    return this.adapter.drop(table as string, options);
  }

  public async exists<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME
  ): Promise<boolean> {
    return this.adapter
      .count(table as string, {}, { limit: 1 })
      .then((count) => {
        return count > 0;
      });
  }

  public connect(): Promise<void> {
    return this.adapter.connect();
  }

  public disconnect(): Promise<void> {
    return this.adapter.disconnect();
  }

  public createRestApi<INCLUDE extends RsterDatabaseToApiInclude<DEF>>({
    name,
    description,
    include,
  }: {
    name: string;
    description: string[];
    include: INCLUDE;
  }): RsterDatabaseToApiBuilder<this, INCLUDE> {
    return api({
      name,
      description,
      modules: Object.entries(include).map(([table, include]) => {
        const types = Object.entries(include as Record<string, boolean>)
          .map(([key, value]) => [
            key,
            value
              ? this.definition.tables[table]["properties"][key]
              : undefined,
          ])
          .filter(([_key, value]) => value !== undefined);

        return module({
          name: table,
          description: [],
          httpPath: `/${table}`,
          methods: [
            method({
              name: "get",
              declaration: {
                returns: object(Object.fromEntries(types) as any),
                parameters: {
                  query: object(Object.fromEntries(types) as any),
                },
              },
            }) as any,
          ],
        });
      }),
    });
  }
}

export class TableTool<
  DATABASE_DEFINITION extends DatabaseDefinition,
  TABLE_NAME extends keyof DATABASE_DEFINITION["tables"],
  DATABASE extends Database<DATABASE_DEFINITION>,
  TABLE_DEFINITION extends DATABASE_DEFINITION["tables"][TABLE_NAME] = DATABASE_DEFINITION["tables"][TABLE_NAME]
> {
  constructor(
    public readonly definition: TABLE_DEFINITION,
    public readonly name: TABLE_NAME,
    public readonly database: DATABASE
  ) {}

  public async insert(
    data: PrimitiveType<TABLE_DEFINITION>,
    options?: Record<string, never>
  ): Promise<void> {
    return this.database.insert(this.name, data, options);
  }

  public async get(
    data: PrimitiveType<TABLE_DEFINITION>,
    options?: Record<string, never>
  ): Promise<PrimitiveType<TABLE_DEFINITION>> {
    return this.database.get(this.name, data, options);
  }

  public async update(
    search: PrimitiveType<TABLE_DEFINITION>,
    data: PrimitiveType<TABLE_DEFINITION>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.database.update(this.name, search, data, options);
  }

  public async delete(
    data: PrimitiveType<TABLE_DEFINITION>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.database.delete(this.name, data, options);
  }

  public async count(
    data: PrimitiveType<TABLE_DEFINITION>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.database.count(this.name, data, options);
  }

  public async create(options?: { ifNotExists?: boolean }): Promise<void> {
    return this.database.create(this.name, this.definition as any, options);
  }

  public async drop(options?: { ifExists?: boolean }): Promise<void> {
    return this.database.drop(this.name, options);
  }

  public async exists(): Promise<boolean> {
    return this.database.exists(this.name);
  }
}

export type Database<DEF extends DatabaseDefinition> = {
  [key in keyof DEF["tables"]]: TableTool<DEF, key, Database<DEF>>;
} & $Database<DEF>;

export function createDatabase<DEF extends DatabaseDefinition>(
  definition: DEF,
  adapter: DatabaseAdapter<AllowAnyTypeInformation>
): Database<DEF> {
  const database = new $Database(
    definition,
    adapter
  ) as unknown as Database<DEF>;
  const tables = {} as Record<string, TableTool<DEF, string, Database<DEF>>>;
  for (const key in definition.tables) {
    tables[key] = new TableTool<DEF, string, Database<DEF>>(
      definition.tables[key] as any,
      key,
      database
    );
  }
  return Object.assign(database, tables);
}

export type RsterDatabaseToApiInclude<DEF extends DatabaseDefinition> = {
  [key in keyof DEF["tables"]]?: {
    [key2 in keyof DEF["tables"][key]["properties"]]?: boolean;
  };
};

export type RsterDatabaseToApiBuilder<
  DB extends $Database<any>,
  INCLUDE extends RsterDatabaseToApiInclude<DB["definition"]>
> = RsterApiBuilderContext<
  {
    [key in keyof INCLUDE]: RsterApiModuleBuilderContext<
      Record<string, never>,
      {
        get: RsterApiMethodBuilderContext<{
          returns: {
            [key2 in keyof INCLUDE[key]]: INCLUDE[key][key2] extends true
              ? key extends keyof DB["definition"]["tables"] // This is a hack to make sure that the key is a valid table name. It should always be true.
                ? key2 extends keyof DB["definition"]["tables"][key]["properties"] // This is a hack to make sure that the key2 is a valid property name. It should always be true.
                  ? {
                      type: DB["definition"]["tables"][key]["properties"][key2];
                      required: true;
                    }
                  : never
                : never
              : never;
          };

          expectBody: {
            [key2 in keyof INCLUDE[key]]: INCLUDE[key][key2] extends true
              ? key extends keyof DB["definition"]["tables"] // This is a hack to make sure that the key is a valid table name. It should always be true.
                ? key2 extends keyof DB["definition"]["tables"][key]["properties"] // This is a hack to make sure that the key2 is a valid property name. It should always be true.
                  ? {
                      type: DB["definition"]["tables"][key]["properties"][key2];
                      required: false;
                    }
                  : never
                : never
              : never;
          };
        }>;
      }
    >;
  },
  Record<string, never>
>;
