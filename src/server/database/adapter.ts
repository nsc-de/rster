import { AllowAnyTypeInformation } from "../basic/types";

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

export function createDatabaseAdapter<
  ADDITIONAL,
  SUPPORTED_TYPES extends AllowAnyTypeInformation
>(
  adapter: DatabaseAdapter<SUPPORTED_TYPES> & ADDITIONAL
): () => DatabaseAdapter<SUPPORTED_TYPES> & ADDITIONAL;
export function createDatabaseAdapter<
  ADDITIONAL,
  SUPPORTED_TYPES extends AllowAnyTypeInformation,
  A extends DatabaseAdapter<SUPPORTED_TYPES> & ADDITIONAL,
  FACTORY extends (...args: any[]) => A
>(factory: FACTORY): FACTORY;
export function createDatabaseAdapter<
  ADDITIONAL,
  SUPPORTED_TYPES extends AllowAnyTypeInformation,
  A extends DatabaseAdapter<SUPPORTED_TYPES> & ADDITIONAL,
  FACTORY extends (...args: any[]) => A
>(adapter: FACTORY | A): (...args: unknown[]) => A {
  return (...args: unknown[]) => {
    const instance = typeof adapter === "function" ? adapter(...args) : adapter;
    return instance;
  };
}
