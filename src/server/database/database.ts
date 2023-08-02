import {
  AllowAnyTypeInformation,
  ObjectTypeInformation,
  PrimitiveType,
} from "../types";
import { DatabaseAdapter } from "./adapter";

/**
 * Define a Database
 */
export interface DatabaseDefinition<
  T extends Record<string, AllowAnyTypeInformation>
> {
  /**
   * The tables in the database
   */
  tables: Record<string, ObjectTypeInformation<T>>;
}

class $Database<
  DEF extends DatabaseDefinition<Record<string, AllowAnyTypeInformation>>
> {
  constructor(
    readonly definition: DEF,
    readonly adapter: DatabaseAdapter<AllowAnyTypeInformation>
  ) {}

  public async insert<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: Record<string, never>
  ): Promise<void> {
    this.adapter.insert(table as string, data, options);
  }

  public async get<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: Record<string, never>
  ): Promise<PrimitiveType<DEF["tables"][TABLE_NAME]>> {
    return this.adapter.get(table as string, data, options);
  }

  public async update<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    search: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.adapter.update(table as string, search, data, options);
  }

  public async delete<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.adapter.delete(table as string, data, options);
  }

  public async count<TABLE_NAME extends keyof DEF["tables"]>(
    table: TABLE_NAME,
    data: PrimitiveType<DEF["tables"][TABLE_NAME]>,
    options?: { limit?: number }
  ): Promise<number> {
    return this.adapter.count(table as string, data, options);
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
}

export class TableTool<
  DATABASE_DEFINITION extends DatabaseDefinition<
    Record<string, AllowAnyTypeInformation>
  >,
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

export type Database<
  DEF extends DatabaseDefinition<Record<string, AllowAnyTypeInformation>>
> = {
  [key in keyof DEF["tables"]]: TableTool<DEF, key, Database<DEF>>;
} & $Database<DEF>;

export function createDatabase<
  DEF extends DatabaseDefinition<Record<string, AllowAnyTypeInformation>>
>(
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
  return Object.assign(tables, database);
}
