import { api } from "./api";
import { module } from "./module";

api(
  "test",
  ["test"],
  {
    test: module("test", ["test"], {}, {}, "/test", "get"),
    test2: module("test2", ["test"], {}, {}, "/test", "get"),
  },
  {}
);
