import { number, object, string } from "@rster/types";
import { createDatabase } from "./database";
import { JsObject } from "./adapters/object";
import { DatabaseAdapter } from "./adapter";

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
  describe("connect", () => {
    it("should connect", async () => {
      const connect = jest.fn().mockResolvedValue(undefined);

      const database = createDatabase(
        {
          tables: {},
        },
        // @ts-ignore
        { connect }
      );

      await database.connect();
      expect(connect).toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("should disconnect", async () => {
      const disconnect = jest.fn().mockResolvedValue(undefined);

      const database = createDatabase(
        {
          tables: {},
        },
        // @ts-ignore
        { disconnect }
      );

      await database.disconnect();
      expect(disconnect).toHaveBeenCalled();
    });
  });

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

    describe("update", () => {
      it("should update a row", async () => {
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

        adapter.__data = { users: [{ id: 1, name: "test" }] };

        await database.update("users", { id: 1 }, { name: "test2" });
        expect(adapter.__data).toEqual({ users: [{ id: 1, name: "test2" }] });
      });
    });
  });
});
