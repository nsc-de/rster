import { buildRsterApi } from "./builder.js";

console.log(
  JSON.stringify(
    buildRsterApi(function () {
      this.name("test");
      this.description("Just a simple test API");

      this.module("test", function () {
        this.httpPath("/test");

        this.description("Just a simple test module");
        this.method("ping", function () {
          this.httpMethod("get");
          this.httpPath("/ping");

          this.description("Just a simple test method");
        });
      });
    })
      .rest()
      .toJson(),
    null,
    2
  )
);
