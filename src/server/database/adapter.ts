import { AllowAnyTypeInformation } from "../types";

/**
 * Database Adapter Level 1 with nesting support
 */
export interface DatabaseAdapter<T extends AllowAnyTypeInformation> {
  readonly supports: T[];
  readonly supportsNesting: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  exists(table: string): Promise<boolean>;
  create(
    table: string,
    options: {
      ifNotExists?: boolean;
      definition: Record<string, T>;
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
    search: Record<string, T>,
    options: {
      limit?: number;
    }
  ): Promise<Record<string, T>[]>;

  insert(
    table: string,
    data: Record<string, T>,
    options: {
      limit?: number;
    }
  ): Promise<void>;

  update(
    table: string,
    search: Record<string, T>,
    data: Record<string, T>,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  delete(
    table: string,
    search: Record<string, T>,
    options: {
      limit?: number;
    }
  ): Promise<number>;

  count(
    table: string,
    search: Record<string, T>,
    options: {
      limit?: number;
    }
  ): Promise<number>;
}

export function createDatabaseAdapter<S, T extends AllowAnyTypeInformation>(
  adapter: DatabaseAdapter<T> & S
) {
  return () => adapter;
}
