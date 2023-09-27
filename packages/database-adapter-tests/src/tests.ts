import { DatabaseAdapter } from "@rster/database";
import { AllowAnyTypeInformation, string } from "@rster/types";

export function AdapterTests(
  adapter: DatabaseAdapter<AllowAnyTypeInformation>
) {
  describe("connection", () => {
    it("should connect to the database", async () => {
      await adapter.connect();
    });
    it("should disconnect from the database", async () => {
      await adapter.disconnect();
    });
  });

  describe("functions", () => {
    beforeAll(async () => {
      await adapter.connect();
    });

    describe("table creation", () => {
      it("should create a table", async () => {
        await adapter.create("test", {
          id: string(),
          name: string(),
        });
      });

      it("should check if a table exists", async () => {
        expect(await adapter.exists("test")).toBe(true);
        expect(await adapter.exists("test2")).toBe(false);
      });

      it("should drop a table", async () => {
        await adapter.drop("test");
      });
    });

    describe("table operations", () => {
      beforeAll(async () => {
        await adapter.create("test", {
          id: string(),
          name: string(),
        });
      });

      it("should insert a row", async () => {
        await adapter.insert("test", {
          id: "1",
          name: "hello",
        });

        await adapter.insert("test", {
          id: "2",
          name: "world",
        });

        await adapter.insert("test", {
          id: "3",
          name: "Helllllooooo",
        });

        await adapter.insert("test", {
          id: "4",
          name: "WOOOOOORLDDD",
        });
      });

      it("should get a row", async () => {
        const rows = await adapter.get("test", {
          id: "1",
        });
        expect(rows).toHaveLength(1);
        expect(rows[0].id).toBe("1");
        expect(rows[0].name).toBe("hello");

        const rows2 = await adapter.get("test", {});
        expect(rows2).toHaveLength(4);

        const rows3 = await adapter.get(
          "test",
          {},
          {
            limit: 2,
          }
        );
        expect(rows3).toHaveLength(2);
      });

      it("should update a row", async () => {
        await adapter.update(
          "test",
          {
            id: "1",
          },
          {
            name: "hello world",
          }
        );

        const rows = await adapter.get("test", {
          id: "1",
        });

        expect(rows).toHaveLength(1);
        expect(rows[0].id).toBe("1");
        expect(rows[0].name).toBe("hello world");
      });

      it("should delete a row", async () => {
        await adapter.delete("test", {
          id: "1",
        });

        const rows = await adapter.get("test", {
          id: "1",
        });

        expect(rows).toHaveLength(0);
      });

      it("should count rows", async () => {
        const count = await adapter.count("test", {});
        expect(count).toBe(3);

        const count2 = await adapter.count("test", {
          name: "hello",
        });

        expect(count2).toBe(0);
      });

      afterAll(async () => {
        await adapter.drop("test");
      });
    });

    afterAll(async () => {
      await adapter.disconnect();
    });
  });
}
