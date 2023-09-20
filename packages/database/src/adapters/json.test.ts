import { JSONAdapter } from "./json";
import { AdapterTests } from "../adapter.test";
import { tmpdir } from "os";
import path from "path";

describe("JsonAdapter", () => {
  const dir = tmpdir();
  const file = path.join(dir, "test.json");
  const adapter = JSONAdapter(file);
  AdapterTests(adapter);
});
