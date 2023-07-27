/**
 * @file JSON Adapter
 * @module rster/database/adapters/json
 * @version 0.1.0
 *
 * A very primitive database adapter that just stores the database as JSON in memory.
 */

import {
  StringTypeInformation,
  AnyStringTypeInformation,
  NumberTypeInformation,
  AnyNumberTypeInformation,
  NumberRangeTypeInformation,
  BooleanTypeInformation,
  AnyBooleanTypeInformation,
} from "../../types";
import { DatabaseLevel0Adapter, DatabaseLevel0Object } from "../adapter";

function JSONAdapter(): DatabaseLevel0Adapter {
  const data: Record<string, DatabaseLevel0Object[]> = {};
  return {
    level: 0,
    nested: false,

    connect() {
      // Nothing to do
      return Promise.resolve();
    },

    disconnect() {
      // Nothing to do
      return Promise.resolve();
    },

    exists(table) {
      return Promise.resolve(data[table] !== undefined);
    },

    create(table: string, options) {
      if (!data[table]) {
        data[table] = [];
      }
      return Promise.resolve();
    },

    drop(table: string, options: { ifExists?: boolean | undefined }) {
      if (data[table]) {
        delete data[table];
      }
      return Promise.resolve();
    },

    get(table, search, options) {
      if (!data[table]) {
        throw new Error("Table does not exist");
      }

      const results: DatabaseLevel0Object[] = [];
      for (const row of data[table]) {
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
      if (!data[table]) {
        throw new Error("Table does not exist");
      }

      data[table]?.push(obj);
      return Promise.resolve();
    },

    update(table, search, obj, { limit }) {
      if (!data[table]) {
        throw new Error("Table does not exist");
      }

      let count = 0;

      for (const row of data[table]) {
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
          for (const key in data) {
            row[key] = obj[key];
          }
          count++;
        }
      }
      return Promise.resolve(count);
    },

    delete(table, search, { limit }) {
      if (!data[table]) {
        throw new Error("Table does not exist");
      }

      let count = 0;

      for (let i = 0; i < data[table].length; i++) {
        // Break if we've reached the limit
        if (limit && count >= limit) break;

        const row = data[table][i];
        let match = true;
        for (const key in search) {
          if (search[key] !== row[key]) {
            match = false;
            break;
          }
        }
        if (match) {
          data[table].splice(i, 1);
          count++;
        }
      }
      return Promise.resolve(count);
    },

    count(table, search, { limit }) {
      if (!data[table]) {
        throw new Error("Table does not exist");
      }

      let count = 0;
      for (const row of data[table]) {
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
  };
}
