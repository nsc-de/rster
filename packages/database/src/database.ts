import {
  AllowAnyTypeInformation,
  ObjectTypeInformation,
  PrimitiveType,
  number,
  undefinedType,
} from "@rster/types";
import { DatabaseAdapter } from "./adapter";
import {
  DataProcessingLayer,
  DataProcessingSchema,
  PassThrough,
  createDataProcessingLayer,
} from "./data_processing";
import { $400 } from "@rster/basic";
import {
  DatabaseTransformer,
  DatabaseTransformerMap,
  GetTransformerInput,
  GetTransformerOutput,
} from "./data_transformer";

export type NoNever<TYPE, ALTERNATIVE> = TYPE extends never
  ? ALTERNATIVE
  : TYPE;

/**
 * Schema for defining a {@link Database}
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

class $Database<
  DEF extends DatabaseDefinition,
  TRANSFORMER extends DatabaseTransformerMap<DEF> = DatabaseTransformerMap<DEF>
> {
  public readonly tables: {
    [key in keyof DEF["tables"] & string]: TableTool<
      DEF,
      key,
      $Database<DEF>,
      DEF["tables"][key]
    >;
  };

  public readonly transformerInputTypes: {
    [key in keyof DEF["tables"]]: {
      [key2 in keyof DEF["tables"][key]]: GetTransformerInput<
        TRANSFORMER[key],
        PrimitiveType<DEF["tables"][key]>
      >[key2];
    };
  };

  public readonly transformerOutputTypes: {
    [key in keyof DEF["tables"]]: {
      [key2 in keyof DEF["tables"][key]]?: GetTransformerOutput<
        TRANSFORMER[key],
        PrimitiveType<DEF["tables"][key]>
      >[key2];
    };
  };

  public readonly inputTypes: {
    [key in keyof DEF["tables"]]: {
      [key2 in keyof DEF["tables"][key]]: GetTransformerInput<
        TRANSFORMER[key],
        PrimitiveType<DEF["tables"][key]>
      >[key2] extends never | undefined
        ? DEF["tables"][key][key2]
        : GetTransformerInput<
            TRANSFORMER[key],
            PrimitiveType<DEF["tables"][key]>
          >[key2];
    };
  };

  public readonly outputTypes: {
    [key in keyof DEF["tables"]]: {
      [key2 in keyof DEF["tables"][key]]: GetTransformerOutput<
        TRANSFORMER[key],
        PrimitiveType<DEF["tables"][key]>
      >[key2] extends never | undefined
        ? DEF["tables"][key][key2]
        : GetTransformerOutput<
            TRANSFORMER[key],
            PrimitiveType<DEF["tables"][key]>
          >[key2];
    };
  };

  constructor(
    public readonly definition: DEF,
    public readonly adapter: DatabaseAdapter<AllowAnyTypeInformation>,
    public transformer: TRANSFORMER = {} as TRANSFORMER
  ) {
    this.tables = Object.fromEntries(
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
      [key in keyof DEF["tables"] & string]: TableTool<
        DEF,
        key,
        $Database<DEF>,
        DEF["tables"][key]
      >;
    };

    this.transformerInputTypes = Object.fromEntries(
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

    this.transformerOutputTypes = Object.fromEntries(
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

    this.inputTypes = Object.fromEntries(
      Object.entries(this.definition.tables).map(([name, table]) => {
        return [
          name,
          this.transformerInputTypes?.[
            name as keyof typeof this.transformerInputTypes
          ] ?? table,
        ];
      })
    ) as {
      [key in keyof DEF["tables"]]: {
        [key2 in keyof DEF["tables"][key]]: GetTransformerInput<
          TRANSFORMER[key],
          PrimitiveType<DEF["tables"][key]>
        >[key2] extends never | undefined
          ? DEF["tables"][key][key2]
          : GetTransformerInput<
              TRANSFORMER[key],
              PrimitiveType<DEF["tables"][key]>
            >[key2];
      };
    };

    this.outputTypes = Object.fromEntries(
      Object.entries(this.definition.tables).map(([name, table]) => {
        return [
          name,
          this.transformerOutputTypes?.[
            name as keyof typeof this.transformerOutputTypes
          ] ?? table,
        ];
      })
    ) as {
      [key in keyof DEF["tables"]]: {
        [key2 in keyof DEF["tables"][key]]: GetTransformerOutput<
          TRANSFORMER[key],
          PrimitiveType<DEF["tables"][key]>
        >[key2] extends never | undefined
          ? DEF["tables"][key][key2]
          : GetTransformerOutput<
              TRANSFORMER[key],
              PrimitiveType<DEF["tables"][key]>
            >[key2];
      };
    };
  }

  private getTransformer<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME
  ): TRANSFORMER[TABLE_NAME] {
    return this.transformer[table] as TRANSFORMER[TABLE_NAME];
  }

  private async transformInput<TABLE_NAME extends keyof DEF["tables"] & string>(
    table: TABLE_NAME,
    data: Partial<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >
  ): Promise<PrimitiveType<DEF["tables"][TABLE_NAME]>> {
    const fn = await this.getTransformer(table)?.input?.transform;
    if (fn) {
      // Check the input data
      const inputType = this.transformerInputTypes[table];
      if (!inputType.check(data))
        throw $400(`Invalid input data: ${inputType.checkError(data)}`);
      const processed = await fn(data);
      // Check the output data
      const outputType = this.definition.tables[table as string];
      if (!outputType) throw new Error(`Table '${table}' does not exist.`);
      if (!outputType.check(processed))
        throw new Error(
          "Invalid data returned from transformer. This is propably a bug in the transformer."
        );

      return processed as PrimitiveType<DEF["tables"][TABLE_NAME]>; // TODO: Check if this cast is correct
    }
    // Check the input data
    const inputType = this.definition.tables[table as string];
    if (!inputType) throw new Error(`Table '${table}' does not exist.`);
    if (!inputType.check(data))
      throw $400(`Invalid input data: ${inputType.checkError(data)}`);
    return data as PrimitiveType<DEF["tables"][TABLE_NAME]>;
  }

  private async transformInputOptional<
    TABLE_NAME extends keyof DEF["tables"] & string
  >(
    table: TABLE_NAME,
    data: Partial<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >
  ): Promise<PrimitiveType<DEF["tables"][TABLE_NAME]>> {
    const fn = await this.getTransformer(table)?.input?.transform;
    if (fn) {
      // Check the input data
      const inputType = this.transformerInputTypes[table];
      if (!inputType.allOptional().check(data))
        throw $400(`Invalid input data: ${inputType.checkError(data)}`);
      const processed = await fn(data);
      // Check the output data
      const outputType = this.definition.tables[table as string];
      if (!outputType) throw new Error(`Table '${table}' does not exist.`);
      if (!outputType.allOptional().check(processed))
        throw new Error(
          "Invalid data returned from transformer. This is propably a bug in the transformer."
        );

      for (const key of Object.keys(processed)) {
        if (processed[key as keyof typeof processed] === undefined) {
          delete processed[key as keyof typeof processed];
        }
      }

      return processed as PrimitiveType<DEF["tables"][TABLE_NAME]>; // TODO: Check if this cast is correct
    }
    // Check the input data
    const inputType = this.definition.tables[table as string];
    if (!inputType) throw new Error(`Table '${table}' does not exist.`);
    if (!inputType.allOptional().check(data))
      throw $400(`Invalid input data: ${inputType.checkError(data)}`);
    return data as PrimitiveType<DEF["tables"][TABLE_NAME]>;
  }

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
      return (await fn(data as any)) as GetTransformerOutput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >;
    else
      return data as GetTransformerOutput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >;
  }

  public async insert<TABLE_NAME extends keyof DEF["tables"] & string>(
    table: TABLE_NAME,
    data: GetTransformerInput<
      TRANSFORMER[TABLE_NAME],
      PrimitiveType<DEF["tables"][TABLE_NAME]>
    >,
    options?: Record<string, never>
  ): Promise<void> {
    // Check the input data

    await this.adapter.insert(
      table as string,
      await this.transformInput(table, data),
      options
    );
  }

  public async get<TABLE_NAME extends keyof DEF["tables"] & string>(
    table: TABLE_NAME,
    data: Partial<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >,
    options?: Record<string, never>
  ) {
    const result = (await this.adapter.get(
      table as string,
      await this.transformInputOptional(table, data),
      options
    )) as PrimitiveType<DEF["tables"][TABLE_NAME]>[];
    return await Promise.all(result.map((r) => this.transformOutput(table, r)));
  }

  public async update<TABLE_NAME extends keyof DEF["tables"] & string>(
    table: TABLE_NAME,
    search: Partial<
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
    const transformedSearch = await this.transformInputOptional(table, search); // We allow partial search
    const transformedData = await this.transformInputOptional(table, data); // We allow partial data

    return await this.adapter.update(
      table,
      transformedSearch,
      transformedData,
      options
    );
  }

  public async delete<TABLE_NAME extends keyof DEF["tables"] & string>(
    table: TABLE_NAME,
    data: Partial<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >,
    options?: { limit?: number }
  ): Promise<number> {
    return await this.adapter.delete(
      table as string,
      await this.transformInputOptional(table, data),
      options
    );
  }

  public async count<TABLE_NAME extends keyof DEF["tables"] & string>(
    table: TABLE_NAME,
    data: Partial<
      GetTransformerInput<
        TRANSFORMER[TABLE_NAME],
        PrimitiveType<DEF["tables"][TABLE_NAME]>
      >
    >,
    options?: { limit?: number }
  ): Promise<number> {
    return await this.adapter.count(
      table as string,
      await this.transformInputOptional(table, data),
      options
    );
  }

  public async create<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    options?: {
      ifNotExists?: boolean;
    },
    definition?: {
      [key in keyof DEF["tables"][TABLE_NAME]]: DEF["tables"][TABLE_NAME][key];
    }
  ): Promise<void> {
    return this.adapter.create(
      table as string,
      definition ?? (this.definition.tables[table as string] as any),
      options
    );
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

  public layeringBase() {
    const { inputTypes, outputTypes } = this;

    return createDataProcessingLayer(
      Object.fromEntries(
        Object.entries(this.tables).map(([key, value]) => [
          key,
          {
            insert: (it: any) => value.insert(it),
            get: (it: any) => value.get(it),
            update: (it: any) => value.update(it),
            delete: (it: any) => value.delete(it),
            count: (it: any) => value.count(it),
            create: (it: any) => value.create(it),
            drop: (it: any) => value.drop(it),
            exists: () => value.exists(),
          },
        ])
      ) as unknown as {
        [key in keyof typeof this.tables]: {
          insert: (it: {
            data: (typeof inputTypes)[key];
            options?: Record<string, never>;
          }) => Promise<void>;

          get: (it: {
            search: (typeof inputTypes)[key]["allOptional"];
            options?: Record<string, never>;
          }) => Promise<(typeof outputTypes)[key]>;

          update: (it: {
            search: (typeof inputTypes)[key]["allOptional"];
            data: (typeof inputTypes)[key]["allOptional"];
            options?: { limit?: number };
          }) => Promise<number>;

          delete: (it: {
            search: (typeof inputTypes)[key]["allOptional"];
            options?: { limit?: number };
          }) => Promise<number>;

          count: (it: {
            search: (typeof inputTypes)[key]["allOptional"];
            options?: { limit?: number };
          }) => Promise<number>;

          create: (it: {
            options?: { ifNotExists?: boolean };
            definition?: (typeof inputTypes)[key];
          }) => Promise<void>;

          drop: (it: { options?: { ifExists?: boolean } }) => Promise<void>;

          exists: () => Promise<boolean>;
        };
      }
    );
  }

  public layer<
    INPUT_SCHEMA extends DataProcessingSchema<ReturnType<this["layeringBase"]>>
  >(inputSchema: INPUT_SCHEMA) {
    return createDataProcessingLayer(this.layeringBase(), inputSchema);
  }

  public build() {
    return this.layer(PassThrough).build(
      Object.fromEntries(
        Object.entries(this.tables).map(([key]) => [
          key,
          {
            insert: {
              returns: undefinedType(),
              bodyParameters: this.inputTypes[key],
            },
            get: {
              returns: this.outputTypes[key],
              bodyParameters: this.inputTypes[key].allOptional(),
            },
            update: {
              returns: undefinedType(),
              bodyParameters: this.inputTypes[key].allOptional(),
            },
            delete: {
              returns: undefinedType(),
              bodyParameters: this.inputTypes[key].allOptional(),
            },
            count: {
              returns: number(),
              bodyParameters: this.inputTypes[key].allOptional(),
            },
            create: {
              returns: undefinedType(),
              bodyParameters: this.definition.tables[key],
            },
            drop: {
              returns: undefinedType(),
            },
            exists: {
              returns: undefinedType(),
            },
          },
        ])
      ) as any
    );
  }
}

export class TableTool<
  DATABASE_DEFINITION extends DatabaseDefinition,
  TABLE_NAME extends keyof DATABASE_DEFINITION["tables"] & string,
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

  public async insert({
    data,
    options,
  }: {
    data: GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>;
    options?: Record<string, never>;
  }) {
    return this.database.insert(this.name, data, options);
  }

  public async get({
    search: data,
    options,
  }: {
    search: Partial<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >;
    options?: Record<string, never>;
  }) {
    return this.database.get(this.name, data, options);
  }

  public async update({
    search,
    data,
    options,
  }: {
    search: Partial<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >;
    data: GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>;
    options?: { limit?: number };
  }) {
    return this.database.update(this.name, search, data, options);
  }

  public async delete({
    search: data,
    options,
  }: {
    search: Partial<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >;
    options?: { limit?: number };
  }) {
    return this.database.delete(this.name, data, options);
  }

  public async count({
    search: data,
    options,
  }: {
    search: Partial<
      GetTransformerInput<TRANSFORMER, PrimitiveType<TABLE_DEFINITION>>
    >;
    options?: { limit?: number };
  }) {
    return this.database.count(this.name, data, options);
  }

  public async create({
    options,
  }: {
    options?: { ifNotExists?: boolean };
  } = {}): Promise<void> {
    return this.database.create(this.name, options, this.definition as any);
  }

  public async drop({
    options,
  }: {
    options?: { ifExists?: boolean };
  } = {}): Promise<void> {
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
  [key in keyof DEF["tables"] & string]: TableTool<
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
      [key in keyof DEF["tables"] & string]: TableTool<
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
  return Object.assign(database, tables) as Database<DEF, TRANSFORMER>;
}

export type RsterDatabaseToApiInclude<DEF extends DatabaseDefinition> = {
  [key in keyof DEF["tables"]]?: {
    [key2 in keyof DEF["tables"][key]["properties"]]?: boolean;
  };
};
