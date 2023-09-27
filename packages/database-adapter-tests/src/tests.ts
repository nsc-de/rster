import { DatabaseAdapter } from "@rster/database";
import { AllowAnyTypeInformation, string } from "@rster/types";

export function AdapterTests(
  adapter:
    | DatabaseAdapter<AllowAnyTypeInformation>
    | Promise<DatabaseAdapter<AllowAnyTypeInformation>>
) {
  let realAdapter: DatabaseAdapter<AllowAnyTypeInformation>;

  beforeAll(async () => {
    realAdapter = await adapter;
  });

  describe("connection", () => {
    it("should connect to the database", async () => {
      await realAdapter.connect();
    });
    it("should disconnect from the database", async () => {
      await realAdapter.disconnect();
    });
  });

  describe("functions", () => {
    beforeAll(async () => {
      await realAdapter.connect();
    });

    describe("table creation", () => {
      it("should create a table", async () => {
        await realAdapter.create("test", {
          id: string(),
          name: string(),
        });
      });

      it("should check if a table exists", async () => {
        expect(await realAdapter.exists("test")).toBe(true);
        expect(await realAdapter.exists("test2")).toBe(false);
      });

      it("should drop a table", async () => {
        await realAdapter.drop("test");
      });
    });

    describe("table operations", () => {
      beforeAll(async () => {
        await realAdapter.create("test", {
          id: string(),
          name: string(),
        });
      });

      it("should insert a row", async () => {
        await realAdapter.insert("test", {
          id: "1",
          name: "hello",
        });

        await realAdapter.insert("test", {
          id: "2",
          name: "world",
        });

        await realAdapter.insert("test", {
          id: "3",
          name: "Helllllooooo",
        });

        await realAdapter.insert("test", {
          id: "4",
          name: "WOOOOOORLDDD",
        });
      });

      it("should get a row", async () => {
        const rows = await realAdapter.get("test", {
          id: "1",
        });
        expect(rows).toHaveLength(1);
        expect(rows[0].id).toBe("1");
        expect(rows[0].name).toBe("hello");

        const rows2 = await realAdapter.get("test", {});
        expect(rows2).toHaveLength(4);

        const rows3 = await realAdapter.get(
          "test",
          {},
          {
            limit: 2,
          }
        );
        expect(rows3).toHaveLength(2);
      });

      it("should update a row", async () => {
        await realAdapter.update(
          "test",
          {
            id: "1",
          },
          {
            name: "hello world",
          }
        );

        const rows = await realAdapter.get("test", {
          id: "1",
        });

        expect(rows).toHaveLength(1);
        expect(rows[0].id).toBe("1");
        expect(rows[0].name).toBe("hello world");
      });

      it("should delete a row", async () => {
        await realAdapter.delete("test", {
          id: "1",
        });

        const rows = await realAdapter.get("test", {
          id: "1",
        });

        expect(rows).toHaveLength(0);
      });

      it("should count rows", async () => {
        const count = await realAdapter.count("test", {});
        expect(count).toBe(3);

        const count2 = await realAdapter.count("test", {
          name: "hello",
        });

        expect(count2).toBe(0);
      });

      afterAll(async () => {
        await realAdapter.drop("test");
      });
    });

    afterAll(async () => {
      await realAdapter.disconnect();
    });
  });
}
