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

  describe("exists", () => {
    it("should check if a table exists (on non-existing table)", async () => {
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

      const exists = await database.exists("users");
      expect(exists).toEqual(false);
    });

    it("should check if a table exists (on existing table)", async () => {
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

      const exists = await database.exists("users");
      expect(exists).toEqual(true);
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

      it("should update multiple rows", async () => {
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

        adapter.__data = {
          users: [
            { id: 1, name: "test" },
            { id: 2, name: "test" },
          ],
        };

        await database.update("users", { name: "test" }, { name: "test2" });
        expect(adapter.__data).toEqual({
          users: [
            { id: 1, name: "test2" },
            { id: 2, name: "test2" },
          ],
        });
      });

      it("should update multiple rows with a limit", async () => {
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

        adapter.__data = {
          users: [
            { id: 1, name: "test" },
            { id: 2, name: "test" },
            { id: 3, name: "test" },
          ],
        };

        await database.update(
          "users",
          { name: "test" },
          { name: "test2" },
          {
            limit: 2,
          }
        );
        expect(adapter.__data).toEqual({
          users: [
            { id: 1, name: "test2" },
            { id: 2, name: "test2" },
            { id: 3, name: "test" },
          ],
        });
      });
    });

    describe("delete", () => {
      it("should delete a row", async () => {
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

        await database.delete("users", { id: 1 });
        expect(adapter.__data).toEqual({ users: [] });
      });

      it("should delete multiple rows", async () => {
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

        adapter.__data = {
          users: [
            { id: 1, name: "test" },
            { id: 2, name: "test" },
          ],
        };

        await database.delete("users", { name: "test" });
        expect(adapter.__data).toEqual({ users: [] });
      });

      it("should delete multiple rows with a limit", async () => {
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

        adapter.__data = {
          users: [
            { id: 1, name: "test" },
            { id: 2, name: "test" },
            { id: 3, name: "test" },
          ],
        };

        await database.delete("users", { name: "test" }, { limit: 2 });
        expect(adapter.__data).toEqual({ users: [{ id: 3, name: "test" }] });
      });
    });

    describe("get", () => {
      it("should search rows", async () => {
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

        const rows = await database.get("users", { id: 1 });
        expect(rows).toEqual([{ id: 1, name: "test" }]);
      });
    });

    describe("count", () => {
      it("should count rows matching filter", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: number() },
              }),
            },
          },
          adapter
        );

        adapter.__data = {
          users: [{ id: 1 }, { id: 2 }],
        };

        const count = await database.count("users", { id: 1 });
        expect(count).toEqual(1);
      });

      it("test on multiple rows", async () => {
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

        adapter.__data = {
          users: [
            { id: 1, name: "test" },
            { id: 2, name: "test" },
            { id: 3, name: "test2" },
          ],
        };

        const count = await database.count("users", { name: "test" });
        expect(count).toEqual(2);
      });

      it("test on multiple rows with a limit", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                name: { required: true, type: string() },
              }),
            },
          },
          adapter
        );

        adapter.__data = {
          users: [{ name: "test" }, { name: "test" }, { name: "test" }],
        };

        const count = await database.count(
          "users",
          { name: "test" },
          { limit: 2 }
        );
        expect(count).toEqual(2);
      });
    });

    describe("tables", () => {
      describe("exists", () => {
        it("should check if a table exists (on non-existing table)", async () => {
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

          adapter.__data = {};

          const exists = await database.tables.users.exists();
          expect(exists).toEqual(false);
        });

        it("should check if a table exists (on existing table)", async () => {
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

          const exists = await database.tables.users.exists();
          expect(exists).toEqual(true);
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

          await database.tables.users.create();
          expect(adapter.__data).toEqual({ users: [] });
        });
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

          await database.tables.users.drop();
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

          await database.tables.users.insert({ id: 1, name: "test" });
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

          await database.tables.users.update({ id: 1 }, { name: "test2" });
          expect(adapter.__data).toEqual({
            users: [{ id: 1, name: "test2" }],
          });
        });

        it("should update multiple rows", async () => {
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

          adapter.__data = {
            users: [
              { id: 1, name: "test" },
              { id: 2, name: "test" },
            ],
          };

          await database.tables.users.update(
            { name: "test" },
            { name: "test2" }
          );
          expect(adapter.__data).toEqual({
            users: [
              { id: 1, name: "test2" },
              { id: 2, name: "test2" },
            ],
          });
        });

        it("should update multiple rows with a limit", async () => {
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

          adapter.__data = {
            users: [
              { id: 1, name: "test" },
              { id: 2, name: "test" },
              { id: 3, name: "test" },
            ],
          };

          await database.tables.users.update(
            { name: "test" },
            { name: "test2" },
            {
              limit: 2,
            }
          );
          expect(adapter.__data).toEqual({
            users: [
              { id: 1, name: "test2" },
              { id: 2, name: "test2" },
              { id: 3, name: "test" },
            ],
          });
        });
      });

      describe("delete", () => {
        it("should delete a row", async () => {
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

          await database.tables.users.delete({ id: 1 });
          expect(adapter.__data).toEqual({ users: [] });
        });

        it("should delete multiple rows", async () => {
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

          adapter.__data = {
            users: [
              { id: 1, name: "test" },
              { id: 2, name: "test" },
            ],
          };

          await database.tables.users.delete({ name: "test" });
          expect(adapter.__data).toEqual({ users: [] });
        });

        it("should delete multiple rows with a limit", async () => {
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

          adapter.__data = {
            users: [
              { id: 1, name: "test" },
              { id: 2, name: "test" },
              { id: 3, name: "test" },
            ],
          };

          await database.tables.users.delete({ name: "test" }, { limit: 2 });
          expect(adapter.__data).toEqual({ users: [{ id: 3, name: "test" }] });
        });
      });

      describe("get", () => {
        it("should search rows", async () => {
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

          const rows = await database.tables.users.get({ id: 1 });
          expect(rows).toEqual([{ id: 1, name: "test" }]);
        });
      });
    });
  });
});
