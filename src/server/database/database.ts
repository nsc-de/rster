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
  TypeInformationFor,
  object,
} from "../basic/types";
import { DatabaseAdapter } from "./adapter";
import {
  DataProcessingLayer,
  DataProcessingSchema,
  createDataProcessingLayer,
} from "./data_processing";

export type NoNever<TYPE, ALTERNATIVE> = TYPE extends never
  ? ALTERNATIVE
  : TYPE;

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
  INPUT_TYPE,
  OUTPUT_TYPE,
  DATA extends PrimitiveType<DATA_TYPE> = PrimitiveType<DATA_TYPE>
> {
  input?: {
    transform(data: INPUT_TYPE): Promise<DATA> | DATA;
    type: TypeInformationFor<INPUT_TYPE>;
  };
  output?: {
    transform(data: DATA): Promise<OUTPUT_TYPE> | OUTPUT_TYPE;
    type: TypeInformationFor<OUTPUT_TYPE>;
  };
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
> = DatabaseTransformer<DATA_TYPE, DATA_TYPE, DATA_TYPE>;

export type DatabaseTransformerMap<
  DATABASE_DEFINITION extends DatabaseDefinition
> = {
  [TABLE_NAME in keyof DATABASE_DEFINITION["tables"]]?: DatabaseTransformer<
    DATABASE_DEFINITION["tables"][TABLE_NAME],
    any,
    any
  >;
};

export type GetTransformerInput<
  TRANSFORMER extends DatabaseTransformer<any, any, any> | undefined,
  ALT = never
> = TRANSFORMER extends DatabaseTransformer<any, infer DATA_TYPE, any>
  ? DATA_TYPE
  : ALT;

export type GetTransformerOutput<
  TRANSFORMER extends DatabaseTransformer<any, any, any> | undefined,
  ALT = never
> = TRANSFORMER extends DatabaseTransformer<any, any, infer OUTPUT_TYPE>
  ? OUTPUT_TYPE
  : ALT;

export type AllOptional<TYPE extends object> = {
  [key in keyof TYPE]?: TYPE[key];
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

  public readonly tables = Object.fromEntries(
    Object.entries(this.definition.tables).map(([name, table]) => {
      return [
        name,
        new TableTool<DEF, string, $Database<DEF>>(
          table as DEF["tables"][typeof name],
          name,
          this
        ),
      ];
    })
  ) as {
    [key in keyof DEF["tables"]]: TableTool<
      DEF,
      key,
      $Database<DEF>,
      DEF["tables"][key]
    >;
  };

  private getTransformer<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME
  ): TRANSFORMER[TABLE_NAME] {
    return this.transformer[table] as TRANSFORMER[TABLE_NAME];
  }

  private async transformInput<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: AllOptional<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >
  ): Promise<PrimitiveType<DEF["tables"][TABLE_NAME]>> {
    const fn = await this.getTransformer(table)?.input?.transform;
    if (fn) return await fn(data);
    else return data as PrimitiveType<DEF["tables"][TABLE_NAME]>;
  }

  public readonly inputTypes = Object.fromEntries(
    Object.entries(this.transformer).map(([key, value]) => [
      key,
      value?.input?.type ?? this.definition.tables[key],
    ])
  ) as {
    [key in keyof DEF["tables"]]: {
      [key2 in keyof DEF["tables"][key]]: GetTransformerInput<
        TRANSFORMER[key],
        PrimitiveType<DEF["tables"][key]>
      >[key2];
    };
  };

  public readonly outputTypes = Object.fromEntries(
    Object.entries(this.transformer).map(([key, value]) => [
      key,
      value?.output?.type ?? this.definition.tables[key],
    ])
  ) as {
    [key in keyof DEF["tables"]]: {
      [key2 in keyof DEF["tables"][key]]: GetTransformerOutput<
        TRANSFORMER[key],
        PrimitiveType<DEF["tables"][key]>
      >[key2];
    };
  };

  private async transformOutput<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>
  ): Promise<
    GetTransformerOutput<
      TRANSFORMER[TABLE_NAME],
      PrimitiveType<DEF["tables"][TABLE_NAME]>
    >
  > {
    const fn = await this.getTransformer(table)?.output?.transform;
    if (fn)
      return (await fn(data)) as GetTransformerOutput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >;
    else
      return data as GetTransformerOutput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >;
  }

  public async insert<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: GetTransformerInput<
      TRANSFORMER[TABLE_NAME],
      PrimitiveType<DEF["tables"][TABLE_NAME]>
    >,
    options?: Record<string, never>
  ): Promise<void> {
    await this.adapter.insert(
      table as string,
      await this.transformInput(table, data),
      options
    );
  }

  public async get<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: AllOptional<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >,
    options?: Record<string, never>
  ) {
    const result = (await this.adapter.get(
      table as string,
      await this.transformInput(table, data),
      options
    )) as unknown as Promise<PrimitiveType<DEF["tables"][TABLE_NAME]>>;
    return await this.transformOutput(table, result);
  }

  public async update<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    search: AllOptional<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >,
    data: GetTransformerInput<
      TRANSFORMER[TABLE_NAME],
      PrimitiveType<DEF["tables"][TABLE_NAME]>
    >,
    options?: { limit?: number }
  ): Promise<number> {
    return await this.adapter.update(
      table as string,
      await this.transformInput(table, search),
      await this.transformInput(table, data),
      options
    );
  }

  public async delete<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: AllOptional<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >,
    options?: { limit?: number }
  ): Promise<number> {
    return await this.adapter.delete(
      table as string,
      await this.transformInput(table, data),
      options
    );
  }

  public async count<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: AllOptional<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >,
    options?: { limit?: number }
  ): Promise<number> {
    return await this.adapter.count(
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
    return this.adapter.exists(table as string);
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const db = this;
    return api({
      name,
      description,
      modules: Object.entries(include).map(([table, include]) => {
        const tableInputTypes = db.inputTypes[table as keyof DEF["tables"]];
        const tableOutputTypes = db.outputTypes[table as keyof DEF["tables"]];

        const inputTypes = Object.entries(include as Record<string, boolean>)
          .map(([key, value]) => {
            return [
              key,
              value
                ? tableInputTypes[key as keyof typeof tableInputTypes]
                : undefined,
            ];
          })
          .map(([key, value]) => [key, value])
          .filter(([_key, value]) => value !== undefined) as [
          string,
          (typeof tableInputTypes)[keyof typeof tableInputTypes]
        ][];

        const outputTypes = Object.entries(include)
          .map(([key, value]) => [
            key,
            value
              ? tableOutputTypes[key as keyof typeof tableOutputTypes]
              : undefined,
          ])
          .filter(([_key, value]) => value !== undefined) as [
          string,
          (typeof tableOutputTypes)[keyof typeof tableOutputTypes]
        ][];

        return module({
          name: table,
          description: [],
          httpPath: `/${table}`,
          methods: [
            method({
              name: "get",
              declaration: {
                returns: object(
                  Object.fromEntries(
                    outputTypes.map(([key, value]) => [
                      key,
                      { type: value, required: true },
                    ])
                  )
                ),
                expectBody: {
                  query: object(
                    Object.fromEntries(
                      inputTypes.map(([key, value]) => [
                        key,
                        { type: value, required: false },
                      ])
                    )
                  ),
                },
              },
              httpPath: "/get",
              action: async ({ query }) => {
                return await db.get(table, query);
              },
            }) as any,
          ],
        });
      }),
    });
  }

  public layer<INPUT_SCHEMA extends DataProcessingSchema<typeof this>>(
    inputSchema: INPUT_SCHEMA
  ) {
    return createDataProcessingLayer(this.tables, inputSchema);
  }
}

export class TableTool<
  DATABASE_DEFINITION extends DatabaseDefinition,
  TABLE_NAME extends keyof DATABASE_DEFINITION["tables"],
  DATABASE extends $Database<DATABASE_DEFINITION>,
  TABLE_DEFINITION extends DATABASE_DEFINITION["tables"][TABLE_NAME] = DATABASE_DEFINITION["tables"][TABLE_NAME],
  TRANSFORMER extends
    | DatabaseTransformer<DATABASE_DEFINITION["tables"][TABLE_NAME], any, any>
    | undefined = DatabaseTransformer<
    DATABASE_DEFINITION["tables"][TABLE_NAME],
    any,
    any
  >
> {
  constructor(
    public readonly definition: TABLE_DEFINITION,
    public readonly name: TABLE_NAME,
    public readonly database: DATABASE
  ) {}

  public async insert(
    data: GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>,
    options?: Record<string, never>
  ) {
    return this.database.insert(this.name, data, options);
  }

  public async get(
    data: AllOptional<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >,
    options?: Record<string, never>
  ) {
    return this.database.get(this.name, data, options);
  }

  public async update(
    search: AllOptional<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >,
    data: GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>,
    options?: { limit?: number }
  ) {
    return this.database.update(this.name, search, data, options);
  }

  public async delete(
    data: AllOptional<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >,
    options?: { limit?: number }
  ) {
    return this.database.delete(this.name, data, options);
  }

  public async count(
    data: AllOptional<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >,
    options?: { limit?: number }
  ) {
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

export type Database<
  DEF extends DatabaseDefinition,
  TRANSFORMER extends DatabaseTransformerMap<DEF> = DatabaseTransformerMap<DEF>
> = {
  [key in keyof DEF["tables"]]: TableTool<
    DEF,
    key,
    Database<DEF>,
    DEF["tables"][key],
    TRANSFORMER[key]
  >;
} & $Database<DEF, TRANSFORMER> & {
    layer<INPUT_SCHEMA extends DataProcessingSchema<Database<DEF>>>(
      inputSchema: INPUT_SCHEMA
    ): DataProcessingLayer<INPUT_SCHEMA, Database<DEF>>;
    tables: {
      [key in keyof DEF["tables"]]: TableTool<
        DEF,
        key,
        Database<DEF>,
        DEF["tables"][key],
        TRANSFORMER[key]
      >;
    };
  };

export function createDatabase<
  DEF extends DatabaseDefinition,
  TRANSFORMER extends DatabaseTransformerMap<DEF>
>(
  definition: DEF,
  adapter: DatabaseAdapter<AllowAnyTypeInformation>,
  transformer?: TRANSFORMER
): Database<DEF, TRANSFORMER> {
  const database = new $Database<DEF, TRANSFORMER>(
    definition,
    adapter,
    transformer
  ) as unknown as Database<DEF>;
  const tables = database.tables;
  console.log(tables);
  return Object.assign(database, tables) as Database<DEF, TRANSFORMER>;
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
