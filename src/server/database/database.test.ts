import * as database from "./database";
import { JSONAdapter } from "./adapters/json";
import { number, object, string } from "../types";
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
  JSONAdapter()
);

describe("database", () => {
  it("should create", async () => {
    const create = await db.users.create();
    db.users.insert({  });
    expect(create).to.be.undefined;
    expect(await db.users.exists()).to.be.true;
  });
});

object({
  id: { type: number(), required: true },
  name: { type: string(), required: true },
}).properties.