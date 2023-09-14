import * as database from "./database";
import { JSONAdapter } from "./adapters/json";
import { number, object, string } from "@rster/types";
import crypto from "crypto";
import { PassThrough, createDataProcessingLayer } from "./data_processing";

const db = database.createDatabase(
  {
    tables: {
      users: object({
        id: { type: number(), required: true },
        name: { type: string(), required: true },
        password: { type: string(), required: true },
      }),
    },
  },
  JSONAdapter("./test.json"),
  {
    users: {
      input: {
        transform(data: {
          id: number;
          name: string;
          password: string;
          salt?: string;
        }) {
          const salt = data.salt ?? crypto.randomBytes(16).toString("hex");

          return {
            id: data.id,
            name: data.name,
            password:
              btoa(salt) +
              ":" +
              crypto
                .createHash("sha512", {})
                .update(data.password)
                .update(salt)
                .digest("hex"),
          };
        },
        type: object({
          id: { type: number(), required: true },
          name: { type: string(), required: true },
          password: { type: string(), required: true },
          salt: { type: string(), required: false },
        }),
      },

      output: {
        transform(data: { id: number; name: string; password: string }) {
          const [salt, hash] = data.password.split(":");

          return {
            id: data.id,
            name: data.name,
            password: hash,
            salt: atob(salt),
          };
        },
        type: object({
          id: { type: number(), required: true },
          name: { type: string(), required: true },
          password: { type: string(), required: true },
          salt: { type: string(), required: true },
        }),
      },
    },
  }
);

const exitLayer = createDataProcessingLayer(db, {
  users: {
    get(search: { id: number }) {
      return db.users.get(search);
    },
  },
}).layer({
  users: {
    get: PassThrough,
    // a: PassThrough,
  },
}).functions.users.get;

describe("[]", () => {
  it("[]", () => {
    expect(exitLayer).toBeDefined();
  });
});
