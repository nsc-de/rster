import { DatabaseLevel1Adapter, DatabaseLevel0Adapter } from "../adapter";
import {
  convertLevel0ToLevel1,
  convertLevel1ToLevel0,
  convertLevel1ToLevel0InfoMap,
} from "../converter";

/**
 * Conversion Adapter
 * This adapter takes Level 1 inputs, converts them to Level 0, and provides them to the given Level 0 adapter.
 * It also recreates Level 0 values back into Level 1 values.
 */
export class ConversionAdapter implements DatabaseLevel1Adapter {
  private level0Adapter: DatabaseLevel0Adapter;

  readonly level = 1;
  readonly nested = false;

  constructor(level0Adapter: DatabaseLevel0Adapter) {
    this.level0Adapter = level0Adapter;
  }

  async connect(): Promise<void> {
    await this.level0Adapter.connect();
  }

  async disconnect(): Promise<void> {
    await this.level0Adapter.disconnect();
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's exists method
  async exists(table: string): Promise<boolean> {
    return await this.level0Adapter.exists(table);
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's create method
  async create(
    table: string,
    options: { ifNotExists?: boolean; definition: Record<string, any> }
  ): Promise<void> {
    const level0Table = convertLevel1ToLevel0InfoMap(options.definition);
    await this.level0Adapter.create(table, {
      ...options,
      definition: level0Table,
    });
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's drop method
  async drop(table: string, options: { ifExists?: boolean }): Promise<void> {
    await this.level0Adapter.drop(table, options);
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's get method,
  // then convert the Level 0 result back to Level 1 before returning
  async get(
    table: string,
    search: Record<string, any>,
    options: { limit?: number }
  ): Promise<Record<string, any>[]> {
    const level0Search = convertLevel1ToLevel0(search);
    const level0Result = await this.level0Adapter.get(
      table,
      level0Search,
      options
    );
    return level0Result.map((item) => convertLevel0ToLevel1(item));
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's insert method
  async insert(
    table: string,
    data: Record<string, any>,
    options: { limit?: number }
  ): Promise<void> {
    const level0Data = convertLevel1ToLevel0(data);
    await this.level0Adapter.insert(table, level0Data, options);
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's update method
  async update(
    table: string,
    search: Record<string, any>,
    data: Record<string, any>,
    options: { limit?: number }
  ): Promise<number> {
    const level0Search = convertLevel1ToLevel0(search);
    const level0Data = convertLevel1ToLevel0(data);
    return await this.level0Adapter.update(
      table,
      level0Search,
      level0Data,
      options
    );
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's delete method
  async delete(
    table: string,
    search: Record<string, any>,
    options: { limit?: number }
  ): Promise<number> {
    const level0Search = convertLevel1ToLevel0(search);
    return await this.level0Adapter.delete(table, level0Search, options);
  }

  // Convert Level 1 input to Level 0 and call the Level 0 adapter's count method
  async count(
    table: string,
    search: Record<string, any>,
    options: { limit?: number }
  ): Promise<number> {
    const level0Search = convertLevel1ToLevel0(search);
    return await this.level0Adapter.count(table, level0Search, options);
  }
}
