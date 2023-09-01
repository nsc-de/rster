import { RestfulApi } from "./rster";
import { createSyntheticContext } from "@rster/common";
import { $400 } from "./error";

describe("RestfulApi", () => {
  describe("constructor", () => {
    it("Should create a new instance of RestfulApi", () => {
      const restfulApi = new RestfulApi();
      expect(restfulApi).toBeInstanceOf(RestfulApi);
    });

    it("Should create a new instance of RestfulApi with options", () => {
      const restfulApi = new RestfulApi({
        debug: true,
      });
      expect(restfulApi).toBeInstanceOf(RestfulApi);
      expect(restfulApi._options).toEqual({
        debug: true,
      });
    });
  });

  describe("handle", () => {
    it("Should handle a given request", async () => {
      const restfulApi = new RestfulApi();

      restfulApi.get("/", function () {
        this.action((req, res) => {
          res.send("Hello World");
        });
      });

      const { promise, pass } = createSyntheticContext({});

      restfulApi.handle(...pass);

      const result = await promise;
      expect(result).toEqual({
        code: 200,
        data: "Hello World",
        headers: {},
        sendFile: undefined,
      });
    });

    it("Should throw 404 error if no route is found", async () => {
      const restfulApi = new RestfulApi();

      restfulApi.get("/aaa", function () {
        this.action((req, res) => {
          res.send("Hello World");
        });
      });

      const { promise, pass } = createSyntheticContext({
        path: "/test",
      });

      restfulApi.handle(...pass);

      const result = await promise;
      expect(result).toEqual({
        code: 404,
        data: '{"message":"Not Found","path":"/test","api_path":"/test","method":"GET"}',
        headers: { "Content-Type": "application/json" },
        sendFile: undefined,
      });
    });

    it("Should passthrough thrown http errors", async () => {
      const restfulApi = new RestfulApi();

      restfulApi.get("/aaa", function () {
        this.action((req, res) => {
          throw $400("Bad Request");
        });
      });

      const { promise, pass } = createSyntheticContext({
        path: "/aaa",
      });

      restfulApi.handle(...pass);

      const result = await promise;
      expect(result).toEqual({
        code: 400,
        data: '{"error":{"status":400,"message":"Bad Request"}}',
        headers: { "Content-Type": "application/json" },
        sendFile: undefined,
      });
    });

    it("Should catch thrown errors and return 500", async () => {
      const restfulApi = new RestfulApi();

      restfulApi.get("/aaa", function () {
        this.action((req, res) => {
          throw new Error("Bad Request");
        });
      });

      const { promise, pass } = createSyntheticContext({
        path: "/aaa",
      });

      restfulApi.handle(...pass);

      const result = await promise;
      expect(result).toEqual({
        code: 500,
        data: '{"message":"Internal server error"}',
        headers: { "Content-Type": "application/json" },
        sendFile: undefined,
      });
    });
  });
});
