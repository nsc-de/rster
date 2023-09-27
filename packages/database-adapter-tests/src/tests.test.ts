import { JsObject } from "@rster/database/lib/adapters/object";
import { JSONAdapter } from "@rster/database/lib/adapters/json";
import { AdapterTests } from "./tests";
import { tmpdir } from "os";
import path from "path";

describe("AdapterTests", () => {
  describe("test on object adapter", () => {
    const adapter = JsObject();
    AdapterTests(adapter);
  });

  describe("test on json adapter", () => {
    const dir = tmpdir();
    const file = path.join(dir, "test.json");
    const adapter = JSONAdapter(file);
    AdapterTests(adapter);
  });
});
