import * as database from "./database";
import { JSONAdapter } from "./adapters/json";
import { PrimitiveType, number, object, string } from "../basic/types";
import { expect } from "chai";

const db = database.createDatabase(
  {
    tables: {
      users: object({
        id: { type: number(), required: true },
        name: { type: string(), required: true },
      }),
    },
  },
  JSONAdapter("./test.json")
);

describe("database", () => {
  it("should create", async () => {
    await db.connect();
    const create = await db.users.create();
    db.users.insert({ id: 1, name: "test" });
    expect(create).to.be.undefined;
    expect(await db.users.exists()).to.be.true;
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