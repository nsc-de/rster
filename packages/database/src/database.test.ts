import { number, object, string } from "@rster/types";
import { createDatabase } from "./database";
import { JsObject } from "./adapters/object";
import { DataProcessingLayer, PassThrough } from "./data_processing";

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

    it("should work with transformers", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      adapter.__data = { users: [] };

      await database.insert("users", { id: 1, name: "test" });
      expect(adapter.__data).toEqual({ users: [{ id: "1", name: "test" }] });
    });

    it("should throw on non-existing table", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter
      );

      await expect(
        // @ts-ignore
        database.insert("users", { id: 1, name: "test" })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data", async () => {
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

      await expect(
        database.insert("users", { id: "1", name: "test" })
      ).rejects.toThrow("Invalid input data");
    });

    it("should throw on non-existing table (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(
        // @ts-ignore
        database.insert("users", { id: 1, name: "test" })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(
        database.insert("users", { id: "1", name: "test" })
      ).rejects.toThrow("Invalid input data");
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

    it("should work with transformers", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      adapter.__data = { users: [{ id: "1", name: "test" }] };

      await database.update("users", { id: 1 }, { name: "test2" });
      expect(adapter.__data).toEqual({ users: [{ id: "1", name: "test2" }] });
    });

    it("should throw on non-existing table", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter
      );

      await expect(
        // @ts-ignore
        database.update("users", { id: 1 }, { name: "test2" })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data", async () => {
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

      await expect(
        database.update("users", { id: "1" }, { name: "test2" })
      ).rejects.toThrow("Invalid input data");
    });

    it("should throw on non-existing table (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(
        // @ts-ignore
        database.update("users", { id: 1 }, { name: "test2" })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(
        database.update("users", { id: "1" }, { name: "test2" })
      ).rejects.toThrow("Invalid input data");
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

    it("should work with transformers", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      adapter.__data = { users: [{ id: "1", name: "test" }] };

      await database.delete("users", { id: 1 });
      expect(adapter.__data).toEqual({ users: [] });
    });

    it("should throw on non-existing table", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter
      );

      await expect(
        // @ts-ignore
        database.delete("users", { id: 1 })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data", async () => {
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

      await expect(database.delete("users", { id: "1" })).rejects.toThrow(
        "Invalid input data"
      );
    });

    it("should throw on non-existing table (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(
        // @ts-ignore
        database.delete("users", { id: 1 })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(database.delete("users", { id: "1" })).rejects.toThrow(
        "Invalid input data"
      );
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

    it("should work with transformers", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      adapter.__data = { users: [{ id: "1", name: "test" }] };

      const rows = await database.get("users", { id: 1 });
      expect(rows).toEqual([{ id: 1, name: "test" }]);
    });

    it("should throw on non-existing table", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter
      );

      await expect(
        // @ts-ignore
        database.get("users", { id: 1 })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data", async () => {
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

      await expect(database.get("users", { id: "1" })).rejects.toThrow(
        "Invalid input data"
      );
    });

    it("should throw on non-existing table (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(
        // @ts-ignore
        database.get("users", { id: 1 })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
              name: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id, name }) => ({ id: id?.toString(), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },

            output: {
              transform: ({ id, name }) => ({ id: parseInt(id), name }),
              type: object({
                id: { required: true, type: number() },
                name: { required: true, type: string() },
              }),
            },
          },
        }
      );

      await expect(database.get("users", { id: "1" })).rejects.toThrow(
        "Invalid input data"
      );
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

    it("should work with transformers", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { required: true, type: string() },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id }) => ({ id: id?.toString() }),
              type: object({
                id: { required: true, type: number() },
              }),
            },

            output: {
              transform: ({ id }) => ({ id: parseInt(id) }),
              type: object({
                id: { required: true, type: number() },
              }),
            },
          },
        }
      );

      adapter.__data = {
        users: [{ id: "1" }, { id: "2" }],
      };

      const count = await database.count("users", { id: 1 });
      expect(count).toEqual(1);
    });

    it("should throw on non-existing table", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter
      );

      await expect(
        // @ts-ignore
        database.count("users", { id: 1 })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { type: number(), required: true },
            }),
          },
        },
        adapter
      );

      await expect(database.count("users", { id: "1" })).rejects.toThrow(
        "Invalid input data"
      );
    });

    it("should throw on non-existing table (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {},
        },
        adapter,
        {
          users: {
            input: {
              transform: ({ id }) => ({ id: id?.toString() }),
              type: object({
                id: { required: true, type: number() },
              }),
            },

            output: {
              transform: ({ id }) => ({ id: parseInt(id) }),
              type: object({
                id: { required: true, type: number() },
              }),
            },
          },
        }
      );

      await expect(
        // @ts-ignore
        database.count("users", { id: 1 })
      ).rejects.toThrow("Table 'users' does not exist");
    });

    it("should throw on invalid data (transformers)", async () => {
      const adapter = JsObject();
      const database = createDatabase(
        {
          tables: {
            users: object({
              id: { type: string(), required: true },
            }),
          },
        },
        adapter,
        {
          users: {
            input: {
              type: object({
                id: { required: true, type: number() },
              }),
              transform: ({ id }) => ({ id: id?.toString() }),
            },

            output: {
              transform: ({ id }) => ({ id: parseInt(id) }),
              type: object({
                id: { required: true, type: number() },
              }),
            },
          },
        }
      );

      await expect(database.count("users", { id: "1" })).rejects.toThrow(
        "Invalid input data"
      );
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

      it("should insert a row with a transformer", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: string() },
                name: { required: true, type: string() },
              }),
            },
          },
          adapter,
          {
            users: {
              input: {
                transform: ({ id, name }) => ({ id: id?.toString(), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },

              output: {
                transform: ({ id, name }) => ({ id: parseInt(id), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },
            },
          }
        );

        adapter.__data = { users: [] };

        await database.tables.users.insert({ id: 1, name: "test" });
        expect(adapter.__data).toEqual({ users: [{ id: "1", name: "test" }] });
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

        await database.tables.users.update({ name: "test" }, { name: "test2" });
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

      it("should work with transformers", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: string() },
                name: { required: true, type: string() },
              }),
            },
          },
          adapter,
          {
            users: {
              input: {
                transform: ({ id, name }) => ({ id: id?.toString(), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },

              output: {
                transform: ({ id, name }) => ({ id: parseInt(id), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },
            },
          }
        );

        adapter.__data = { users: [{ id: "1", name: "test" }] };

        await database.tables.users.update({ id: 1 }, { name: "test2" });
        expect(adapter.__data).toEqual({
          users: [{ id: "1", name: "test2" }],
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

      it("should work with transformers", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: string() },
                name: { required: true, type: string() },
              }),
            },
          },
          adapter,
          {
            users: {
              input: {
                transform: ({ id, name }) => ({ id: id?.toString(), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },

              output: {
                transform: ({ id, name }) => ({ id: parseInt(id), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },
            },
          }
        );

        adapter.__data = { users: [{ id: "1", name: "test" }] };

        await database.tables.users.delete({ id: 1 });
        expect(adapter.__data).toEqual({ users: [] });
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

      it("should work with transformers", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: string() },
                name: { required: true, type: string() },
              }),
            },
          },
          adapter,
          {
            users: {
              input: {
                transform: ({ id, name }) => ({ id: id?.toString(), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },

              output: {
                transform: ({ id, name }) => ({ id: parseInt(id), name }),
                type: object({
                  id: { required: true, type: number() },
                  name: { required: true, type: string() },
                }),
              },
            },
          }
        );

        adapter.__data = { users: [{ id: "1", name: "test" }] };

        const rows = await database.tables.users.get({ id: 1 });
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

        const count = await database.tables.users.count({ id: 1 });
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

        const count = await database.tables.users.count({ name: "test" });
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

        const count = await database.tables.users.count(
          { name: "test" },
          { limit: 2 }
        );
        expect(count).toEqual(2);
      });

      it("should work with transformers", async () => {
        const adapter = JsObject();
        const database = createDatabase(
          {
            tables: {
              users: object({
                id: { required: true, type: string() },
              }),
            },
          },
          adapter,
          {
            users: {
              input: {
                transform: ({ id }) => ({ id: id?.toString() }),
                type: object({
                  id: { required: true, type: number() },
                }),
              },

              output: {
                transform: ({ id }) => ({ id: parseInt(id) }),
                type: object({
                  id: { required: true, type: number() },
                }),
              },
            },
          }
        );

        adapter.__data = {
          users: [{ id: "1" }, { id: "2" }],
        };

        const count = await database.tables.users.count({ id: 1 });
        expect(count).toEqual(1);
      });
    });
  });

  describe("#layer()", () => {
    it("should create a DataProcessingLayer", async () => {
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

      const layer = database.layer(PassThrough);
      expect(layer).toBeInstanceOf(DataProcessingLayer);
    });
  });
});
