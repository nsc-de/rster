/**
 * @file JSON Adapter
 * @module rster/database/adapters/json
 * @version 0.1.0
 *
 * A very primitive database adapter that just stores the database as JSON in memory.
 */

import {
  string,
  number,
  nullType,
  boolean,
  NullTypeInformation,
  NumberType,
  StringType,
  BooleanType,
} from "@rster/types";
import { DatabaseAdapter, createDatabaseAdapter } from "../adapter";
import fs from "fs-extra";

export type JsonAdapterTypes =
  | StringType
  | NumberType
  | BooleanType
  | NullTypeInformation;
export interface JsonAdapterAdditionalData {
  __data: Record<string, any[]>;
  savePromise?: Promise<void>;
  savedPromise?: Promise<void>;
  waitingSaveProcess?: () => Promise<void>;
  save(): Promise<void>;
  doSave(): Promise<void>;
  __conected: boolean;
}
export type JsonAdapter = DatabaseAdapter<JsonAdapterTypes> &
  JsonAdapterAdditionalData;
export type JsonAdapterFactory = (path: string) => JsonAdapter;

export const JSONAdapter = createDatabaseAdapter<
  JsonAdapterAdditionalData,
  JsonAdapterTypes,
  JsonAdapter,
  JsonAdapterFactory
>((path) => {
  const fn: JsonAdapter = {
    __conected: false,
    __data: {},
    supportsNesting: true,
    supports: [string(), number(), boolean(), nullType()],

    savePromise: undefined,
    savedPromise: undefined,
    waitingSaveProcess: undefined,

    async doSave() {
      await fs.ensureFile(path);
      await fs.writeJSON(path, this.__data);

      this.savePromise = undefined;

      if (this.waitingSaveProcess) {
        console.log("Waiting save process");
        this.savePromise = this.waitingSaveProcess();
        this.waitingSaveProcess = undefined;
      }
    },

    async save() {
      if (this.savePromise) {
        if (this.waitingSaveProcess) {
          return await this.waitingSaveProcess();
        }
        const savedPromise = new Promise<void>((resolve) => {
          this.waitingSaveProcess = async () => {
            await this.doSave();
            resolve();
          };
        });
        await savedPromise;
        return;
      }

      this.savePromise = this.doSave();
      await this.savePromise;
    },

    async connect() {
      if (this.__conected) throw new Error("Already connected");
      this.__conected = true;

      if (await fs.pathExists(path)) {
        this.__data = await fs.readJSON(path);
        return;
      }

      this.__data = {};
    },

    async disconnect() {
      if (!this.__conected) throw new Error("Not connected");
      this.__conected = false;
      await this.save();
      this.__data = {};
    },

    exists(table) {
      if (!this.__conected) throw new Error("Not connected");
      return Promise.resolve(this.__data[table] !== undefined);
    },

    create(table: string) {
      if (!this.__conected) throw new Error("Not connected");
      if (!this.__data[table]) {
        this.__data[table] = [];
      }
      return Promise.resolve();
    },

    drop(table: string) {
      if (!this.__conected) throw new Error("Not connected");
      if (this.__data[table]) {
        delete this.__data[table];
      }
      return Promise.resolve();
    },

    get(table, search, { limit } = {}) {
      if (!this.__conected) throw new Error("Not connected");
      if (!this.__data[table]) {
        throw new Error("Table does not exist");
      }

      const results: any[] = [];
      for (const row of this.__data[table]) {
        // Break if we've reached the limit
        if (limit && results.length >= limit) break;
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

    insert(table, obj) {
      if (!this.__conected) throw new Error("Not connected");
      if (!this.__data[table]) {
        throw new Error("Table does not exist");
      }

      this.__data[table]?.push(obj);
      return Promise.resolve();
    },

    update(table, search, obj, { limit } = {}) {
      if (!this.__conected) throw new Error("Not connected");
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
          for (const key in obj) {
            row[key] = obj[key];
          }
          count++;
        }
      }
      return Promise.resolve(count);
    },

    delete(table, search, { limit } = {}) {
      if (!this.__conected) throw new Error("Not connected");
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
      if (!this.__conected) throw new Error("Not connected");
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
  };
  return fn;
});
