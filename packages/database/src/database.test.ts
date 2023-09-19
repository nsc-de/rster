import { number, object, string } from "@rster/types";
import { createDatabase } from "./database";
import { JsObject } from "./adapters/object";

describe("createDatabase", () => {
  it("should be defined", () => {
    expect(createDatabase).toBeDefined();
  });

  it("should create a database", () => {
    const database = createDatabase(
      {
        tables: {},
      },
      JsObject()
    );

    expect(database).toBeDefined();
    expect(database.tables).toBeDefined();
    expect(database.tables).toEqual({});
  });

  it("should create a database with tables", () => {
    const database = createDatabase(
      {
        tables: {
          users: object({
            id: { required: true, type: number() },
            name: { required: true, type: string() },
          }),
        },
      },
      JsObject()
    );

    expect(database).toBeDefined();
    expect(database.tables).toBeDefined();
  });
});

describe("database", () => {
  describe("create", () => {
    it("should create a table", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: number() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter
      );

      await database.create("users");
      expect(adapter.__data).toEqual({ users: [] });
    });

    describe("drop", () => {
      it("should drop a table", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
          adapter
        );

        adapter.__data = { users: [] };

        await database.drop("users");
        expect(adapter.__data).toEqual({});
      });
    });

    describe("insert", () => {
      it("should insert a row", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
          adapter
        );

        adapter.__data = { users: [] };

        await database.insert("users", { id: 1, name: "test" });
        expect(adapter.__data).toEqual({ users: [{ id: 1, name: "test" }] });
      });
    });
  });
});
