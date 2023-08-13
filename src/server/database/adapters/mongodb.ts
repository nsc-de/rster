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
} from "../../basic/types";
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

    async connect() {
      if (this.__db) throw new Error("Already connected");

      log(
        "Connecting to MongoDB server %s:%s",
        connection.host,
        connection.port
      );
      log("Database %s with user %s", connection.database, connection.user);
      log("Options: %O", connection.options);

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

      log(
        "Disconnecting from MongoDB server %s:%s",
        connection.host,
        connection.port
      );

      await this.__db.close();
      this.__db = undefined;
    },

    exists(table) {
      if (!this.__db) throw new Error("Not connected");

      log("Checking if table %s exists", table);

      return this.__db
        .db(connection.database)
        .listCollections({ name: table })
        .hasNext();
    },

    async create(table: string) {
      if (!this.__db) throw new Error("Not connected");

      log("Creating table %s", table);

      await this.__db.db(connection.database).createCollection(table);
      return;
    },

    async drop(table: string) {
      if (!this.__db) throw new Error("Not connected");

      log("Dropping table %s", table);

      await this.__db.db(connection.database).dropCollection(table);
      return;
    },

    async get(table, search, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      log("Getting data from table %s %O", table, {
        search,
        limit,
      });

      const response = await this.__db
        .db(connection.database)
        .collection(table)
        .find(search, { limit });
      return response.toArray();
    },

    async insert(table, obj) {
      if (!this.__db) throw new Error("Not connected");

      log("Inserting data into table %s %O", table, obj);

      this.__db.db(connection.database).collection(table).insertOne(obj);
    },

    async update(table, search, obj, { limit } = {}) {
      if (!this.__db) throw new Error("Not connected");

      log("Updating data in table %s %O", table, {
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

      log("Deleting data from table %s %O", table, {
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

      log("Counting data in table %s %O", table, {
        search,
        limit,
      });

      const result = await this.__db
        .db(connection.database)
        .collection(table)
        .countDocuments(search, { limit });
      return result;
    },
  };
  return fn;
});

export default MongoDBAdapterFactory;
