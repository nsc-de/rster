import { ObjectTypeInformation, PrimitiveType } from "../types";
import { DatabaseLevel0Adapter } from "./adapter";

/**
 * Define a Database
 */
export interface DatabaseDefinition {
  /**
   * The tables in the database
   */
  tables: Record<string, ObjectTypeInformation<Record<string, any>>>;
}

class $Database {
  readonly definition: DatabaseDefinition;
  constructor(
    definition: DatabaseDefinition,
    readonly adapter: DatabaseLevel0Adapter
  ) {
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
