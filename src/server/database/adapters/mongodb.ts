/**
 * @file MongoDB Adapter
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
  DateTypeInformation,
} from "../../basic/types";
import { DatabaseAdapter, createDatabaseAdapter } from "../adapter";
import { MongoClient, MongoClientOptions } from "mongodb";

export type MongoDBAdapterTypes =
  | StringType
  | NumberType
  | BooleanType
  | NullTypeInformation
  | DateTypeInformation;

export interface MongoDBConnectionOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  tablePrefix?: string;
  options?: MongoClientOptions;
}

export interface MongoDBAdapterAdditionalData {
  __db?: MongoClient;
  connection: MongoDBConnectionOptions;
}

export type MongoDBAdapter = DatabaseAdapter<MongoDBAdapterTypes> &
  MongoDBAdapterAdditionalData;
export type MongoDBAdapterFactory = (
  connection: MongoDBConnectionOptions
) => MongoDBAdapter;

export const JSONAdapter = createDatabaseAdapter<
  MongoDBAdapterAdditionalData,
  MongoDBAdapterTypes,
  MongoDBAdapter,
  MongoDBAdapterFactory
>((connection: MongoDBConnectionOptions) => {
  const fn: MongoDBAdapter = {
    connection: connection,
    __db: undefined,
    supportsNesting: true,
    supports: [
      string(),
      number(),
      boolean(),
      nullType(),
      new DateTypeInformation(),
    ],

    async connect() {
      if (this.__db) throw new Error("Already connected");
      this.__db = new MongoClient(
        `mongodb://${connection.host}:${connection.port}`,
        {
          auth: {
            username: connection.user,
            password: connection.password,
          },

          authSource: connection.database,

          ...connection.options,
        }
      );
    },

    async disconnect() {
      if (!this.__db) throw new Error("Not connected");
      await this.__db.close();
      this.__db = undefined;
    },

    exists(table) {
      if (!this.__db) throw new Error("Not connected");
      return this.__db
        .db(connection.database)
        .listCollections({ name: table })
        .hasNext();
    },

    async create(table: string) {
      if (!this.__db) throw new Error("Not connected");
      await this.__db.db(connection.database).createCollection(table);
      return;
    },

    async drop(table: string) {
      if (!this.__db) throw new Error("Not connected");
      await this.__db.db(connection.database).dropCollection(table);
      return;
    },

    async get(table, search, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");
      const response = await this.__db
        .db(connection.database)
        .collection(table)
        .find(search, { limit });
      return response.toArray();
    },

    async insert(table, obj) {
      if (!this.__db) throw new Error("Not connected");
      this.__db.db(connection.database).collection(table).insertOne(obj);
    },

    async update(table, search, obj, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      if (limit) {
        // workaround: Search with filter and update in separate query
        const result = await this.__db
          .db(connection.database)
          .collection(table)
          .find(search, { limit });

        const ids = await result.map((item) => item._id).toArray();

        return (
          await this.__db
            .db(connection.database)
            .collection(table)
            .updateMany({ _id: { $in: ids } }, { $set: obj })
        ).modifiedCount;
      }

      const result = await this.__db
        .db(connection.database)
        .collection(table)
        .updateMany(search, { $set: obj });

      return result.modifiedCount;
    },

    async delete(table, search, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      if (limit) {
        // workaround: Search with filter and delete in separate query
        const result = await this.__db
          .db(connection.database)
          .collection(table)
          .find(search, { limit });

        const ids = await result.map((item) => item._id).toArray();

        return (
          await this.__db
            .db(connection.database)
            .collection(table)
            .deleteMany({ _id: { $in: ids } })
        ).deletedCount;
      }

      const result = await this.__db
        .db(connection.database)
        .collection(table)
        .deleteMany(search, {});

      return result.deletedCount;
    },

    async count(table, search, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");
      const result = await this.__db
        .db(connection.database)
        .collection(table)
        .countDocuments(search, { limit });
      return result;
    },
  };
  return fn;
});
