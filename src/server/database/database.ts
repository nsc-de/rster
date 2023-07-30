import {
  AllowAnyTypeInformation,
  ObjectTypeInformation,
  PrimitiveType,
} from "../types";
import { DatabaseAdapter } from "./adapter";

/**
 * Define a Database
 */
export interface DatabaseDefinition {
  /**
   * The tables in the database
   */
  tables: Record<string, ObjectTypeInformation<Record<string, any>>>;
}

class $Database<DEF extends DatabaseDefinition> {
  constructor(
    readonly definition: DEF,
    readonly adapter: DatabaseAdapter<AllowAnyTypeInformation>
  ) {}
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

  public async insert(data: PrimitiveType<TABLE_DEFINITION>): Promise<void> {
    throw new Error("Not implemented");
  }
}

export type Database<DEF extends DatabaseDefinition> = {
  [key in keyof DEF["tables"]]: TableTool<DEF, key, Database<DEF>>;
} & {
  readonly definition: DEF;
  readonly tables: DEF["tables"];
};

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
  return Object.assign(tables, database);
}
