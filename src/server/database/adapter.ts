import { AllowAnyTypeInformation } from "../types";

/**
 * Database Adapter Level 1 with nesting support
 */
export interface DatabaseAdapter<T extends AllowAnyTypeInformation> {
  readonly supports: T[];
  readonly supportsNesting: boolean;
  get(
    table: string,
    search: Record<string, T>,
    options?: {
      limit?: number;
    }
  ): Promise<Record<string, T>[]>;

  insert(
    table: string,
    data: Record<string, T>,
    options?: Record<string, never>
  ): Promise<void>;

  update(
    table: string,
    search: Record<string, T>,
    data: Record<string, T>,
    options?: {
      limit?: number;
    }
  ): Promise<number>;

  delete(
    table: string,
    search: Record<string, T>,
    options?: {
      limit?: number;
    }
  ): Promise<number>;

  count(
    table: string,
    search: Record<string, T>,
    options?: {
      limit?: number;
    }
  ): Promise<number>;

  connect(): Promise<void>;

  disconnect(): Promise<void>;

  exists(table: string): Promise<boolean>;

  create(
    table: string,
    definition: Record<string, T>,
    options?: {
      ifNotExists?: boolean;
    }
  ): Promise<void>;

  drop(
    table: string,
    options?: {
      ifExists?: boolean;
    }
  ): Promise<void>;
}

export function createDatabaseAdapter<S, T extends AllowAnyTypeInformation>(
  adapter: DatabaseAdapter<T> & S
) {
  return () => adapter;
}
