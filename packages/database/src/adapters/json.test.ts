import { JSONAdapter } from "./json";
import { AdapterTests } from "../adapter.test";
import { tmpdir } from "os";
import path from "path";
import fs from "fs-extra";

describe("JsonAdapter", () => {
  const dir = tmpdir();
  const file = path.join(dir, "test.json");
  const adapter = JSONAdapter(file);
  AdapterTests(adapter);

  describe("save", () => {
    const file = path.join(dir, "test2.json");
    const adapter = JSONAdapter(file);
    beforeAll(async () => {
      await adapter.connect();
    });

    it("test double save", async () => {
      const p1 = adapter.save();
      adapter.__data = {
        test: [
          {
            id: "test",
            name: "test",
          },
        ],
      };
      const p2 = adapter.save();
      await Promise.all([p1, p2]);

      await expect(fs.readFile(file, "utf8").then(JSON.parse)).resolves.toEqual(
        {
          test: [
            {
              id: "test",
              name: "test",
            },
          ],
        }
      );
    });

    afterAll(async () => {
      await adapter.disconnect();
    });
  });
});
