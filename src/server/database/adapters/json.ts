/**
 * @file JSON Adapter
 * @module rster/database/adapters/json
 * @version 0.1.0
 *
 * A very primitive database adapter that just stores the database as JSON in memory.
 */

import {
  StringType,
  NumberType,
  BooleanType,
  NullTypeInformation,
  string,
  number,
  nullType,
  boolean,
} from "../../types";
import { createDatabaseAdapter } from "../adapter";

export const JSONAdapter = createDatabaseAdapter<
  { __data: Record<string, any[]> },
  StringType | NumberType | BooleanType | NullTypeInformation
>({
  __data: {},
  supportsNesting: true,
  supports: [string(), number(), boolean(), nullType()],
  connect() {
    // Nothing to do
    return Promise.resolve();
  },

  disconnect() {
    // Nothing to do
    return Promise.resolve();
  },

  exists(table) {
    return Promise.resolve(this.__data[table] !== undefined);
  },

  create(table: string, options) {
    if (!this.__data[table]) {
      this.__data[table] = [];
    }
    return Promise.resolve();
  },

  drop(table: string, options: { ifExists?: boolean | undefined }) {
    if (this.__data[table]) {
      delete this.__data[table];
    }
    return Promise.resolve();
  },

  get(table, search, options) {
    if (!this.__data[table]) {
      throw new Error("Table does not exist");
    }

    const results: any[] = [];
    for (const row of this.__data[table]) {
      let match = true;
      for (const key in search) {
        if (search[key] !== row[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        results.push(row);
      }
    }
    return Promise.resolve(results);
  },

  insert(table, obj, options) {
    if (!this.__data[table]) {
      throw new Error("Table does not exist");
    }

    this.__data[table]?.push(obj);
    return Promise.resolve();
  },

  update(table, search, obj, { limit } = {}) {
    if (!this.__data[table]) {
      throw new Error("Table does not exist");
    }

    let count = 0;

    for (const row of this.__data[table]) {
      // Break if we've reached the limit
      if (limit && count >= limit) break;

      let match = true;
      for (const key in search) {
        if (search[key] !== row[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        for (const key in this.__data) {
          row[key] = obj[key];
        }
        count++;
      }
    }
    return Promise.resolve(count);
  },

  delete(table, search, { limit } = {}) {
    if (!this.__data[table]) {
      throw new Error("Table does not exist");
    }

    let count = 0;

    for (let i = 0; i < this.__data[table].length; i++) {
      // Break if we've reached the limit
      if (limit && count >= limit) break;

      const row = this.__data[table][i];
      let match = true;
      for (const key in search) {
        if (search[key] !== row[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        this.__data[table].splice(i, 1);
        count++;
      }
    }
    return Promise.resolve(count);
  },

  count(table, search, { limit } = {}) {
    if (!this.__data[table]) {
      throw new Error("Table does not exist");
    }

    let count = 0;
    for (const row of this.__data[table]) {
      // Break if we've reached the limit
      if (limit && count >= limit) break;

      let match = true;
      for (const key in search) {
        if (search[key] !== row[key]) {
          match = false;
        }
      }
      if (match) {
        count++;
      }
    }
    return Promise.resolve(count);
  },
});
