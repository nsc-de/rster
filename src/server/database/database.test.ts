import * as database from "./database";
import { JSONAdapter } from "./adapters/json";
import {
  PrimitiveType,
  TypeInformation,
  number,
  object,
  string,
} from "../basic/types";
import crypto from "crypto";

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

describe("database", () => {
  it("should create table", async () => {
    await db.connect();
    const create = await db.users.create();
    db.users.insert({ id: 1, name: "test", password: "test" });
    expect(create).toBe(undefined);
    expect(await db.users.exists()).toBe(true);
  });
  it("should insert into table", async () => {
    const insert = await db.users.insert({
      id: 2,
      name: "test2",
      password: "test2",
      salt: "test",
    });
    expect(insert).toBe(undefined);
    expect(await db.users.exists()).toBe(true);
  });
});

db
  .createRestApi({
    name: "Test Database",
    description: ["This is a test database."],
    include: {
      users: {
        id: true,
        name: true,
      },
    },
  })
  .generate().modules.users.methods.get;
