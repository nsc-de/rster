/**
 * @file MongoDB Adapter
 * @module rster/database/adapters/mongodb
 * @version 0.1.0
 *
 * An adapter to use rster database with MongoDB.
 * @see {@link https://www.mongodb.com/}
 * @see {@link https://www.npmjs.com/package/mongodb}
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
} from "@rster/types";
import { DatabaseAdapter, createDatabaseAdapter } from "../adapter";
import { MongoClient, MongoClientOptions } from "mongodb";
import debug from "debug";

/**
 * MongoDB adapter debugger.
 */
const log = debug("rster:database:adapters:mongodb");

export type MongoDBAdapterTypes =
  | StringType
  | NumberType
  | BooleanType
  | NullTypeInformation
  | DateTypeInformation;

export type MongoDBConnectionOptions =
  | {
      host: string;
      port?: number;
      user: string;
      password: string;
      database: string;
      tablePrefix?: string;
      options?: MongoClientOptions;
    }
  | {
      url: string;
      database: string;
      tablePrefix?: string;
      options?: MongoClientOptions;
    };

export interface MongoDBAdapterAdditionalData {
  __db?: MongoClient;
  connection: MongoDBConnectionOptions;
  resolveTableName(table: string): string;
}

export type MongoDBAdapter = DatabaseAdapter<MongoDBAdapterTypes> &
  MongoDBAdapterAdditionalData;
export type MongoDBAdapterFactoryType = (
  connection: MongoDBConnectionOptions
) => MongoDBAdapter;

export const MongoDBAdapterFactory = createDatabaseAdapter<
  MongoDBAdapterAdditionalData,
  MongoDBAdapterTypes,
  MongoDBAdapter,
  MongoDBAdapterFactoryType
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

    resolveTableName(table) {
      if ("tablePrefix" in connection) {
        return connection.tablePrefix + table;
      }
      return table;
    },

    async connect() {
      if (this.__db) throw new Error("Already connected");

      if ("url" in connection) {
        log("Connecting to MongoDB server %s", connection.url);

        this.__db = new MongoClient(connection.url, connection.options);
        this.__db.connect();
        return;
      }

      log(
        "Connecting to MongoDB server %s:%s",
        connection.host,
        connection.port ?? 27017
      );
      log("Database %s with user %s", connection.database, connection.user);
      log("Options: %O", connection.options);

      this.__db = new MongoClient(
        `mongodb://${connection.host}${
          connection.port ? `:${connection.port}` : ""
        }`,
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

      if ("url" in connection) {
        log("Disconnecting from MongoDB server %s", connection.url);
      } else {
        log(
          "Disconnecting from MongoDB server %s:%s",
          connection.host,
          connection.port
        );
      }

      await this.__db.close();
      this.__db = undefined;
    },

    exists(table) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Checking if table %s exists", tableName);

      return this.__db
        .db(connection.database)
        .listCollections({ name: tableName })
        .hasNext();
    },

    async create(table: string) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Creating table %s", tableName);

      await this.__db.db(connection.database).createCollection(tableName);
      return;
    },

    async drop(table: string) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Dropping table %s", tableName);

      await this.__db.db(connection.database).dropCollection(tableName);
      return;
    },

    async get(table, search, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Getting data from table %s %O", tableName, {
        search,
        limit,
      });

      const response = await this.__db
        .db(connection.database)
        .collection(tableName)
        .find(search, { limit });
      return response.toArray();
    },

    async insert(table, obj) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Inserting data into table %s %O", tableName, obj);

      await this.__db
        .db(connection.database)
        .collection(tableName)
        .insertOne(obj);
    },

    async update(table, search, obj, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Updating data in table %s %O", tableName, {
        search,
        obj,
        limit,
      });

      if (limit) {
        // workaround: Search with filter and update in separate query

        log(
          "Limiting update to %s items, using limit workaround, because limit is not supported by MongoDB updateMany",
          limit
        );

        const result = await this.__db
          .db(connection.database)
          .collection(tableName)
          .find(search, { limit });

        const ids = await result.map((item) => item._id).toArray();

        return (
          await this.__db
            .db(connection.database)
            .collection(tableName)
            .updateMany({ _id: { $in: ids } }, { $set: obj })
        ).modifiedCount;
      }

      const result = await this.__db
        .db(connection.database)
        .collection(tableName)
        .updateMany(search, { $set: obj });

      return result.modifiedCount;
    },

    async delete(table, search, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Deleting data from table %s %O", tableName, {
        search,
        limit,
      });

      if (limit) {
        // workaround: Search with filter and delete in separate query

        log(
          "Limiting delete to %s items, using limit workaround, because limit is not supported by MongoDB deleteMany",
          limit
        );

        const result = await this.__db
          .db(connection.database)
          .collection(tableName)
          .find(search, { limit });

        const ids = await result.map((item) => item._id).toArray();

        return (
          await this.__db
            .db(connection.database)
            .collection(tableName)
            .deleteMany({ _id: { $in: ids } })
        ).deletedCount;
      }

      const result = await this.__db
        .db(connection.database)
        .collection(tableName)
        .deleteMany(search, {});

      return result.deletedCount;
    },

    async count(table, search, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      const tableName = this.resolveTableName(table);

      log("Counting data in table %s %O", tableName, {
        search,
        limit,
      });

      const result = await this.__db
        .db(connection.database)
        .collection(tableName)
        .countDocuments(search, { limit });
      return result;
    },
  };
  return fn;
});

export default MongoDBAdapterFactory;
