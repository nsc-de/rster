import { JsObject } from "./object";
import { AdapterTests } from "../adapter.test";

describe("JSObjectAdapter", () => {
  const adapter = JsObject();
  AdapterTests(adapter);
});
