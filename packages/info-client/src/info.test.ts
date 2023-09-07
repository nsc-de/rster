import "@rster/info";
import "@rster/worker-express";
import express from "express";
import rest from "rster";
import { makeFetch } from "supertest-fetch";
import { InfoClient } from "./info";

const api = rest(function () {
  this.useInfo({ path: "/info" });
  this.usePing();

  this.description("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
  this.description("Nam eget aliquam leo, a pretium turpis.");
  this.description("Mauris vitae elementum justo.");
  this.field("version", "1.0.0");
  this.field("name", "Test API");

  this.get("/hello", function () {
    this.description(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );
    this.description("Nam eget aliquam leo, a pretium turpis.");
    this.description("Mauris vitae elementum justo.");
    this.field("message", "Hello World!");
    this.field("timestamp", new Date().toISOString());
    this.field("version", "1.0.0");
    this.field("name", "Test API");
    this.field("author", "John Doe");

    this.action(function (req, res) {
      res.send({
        message: this.message,
        timestamp: this.timestamp,
        version: this.version,
        name: this.name,
      });
    });
  });
});

const app = express();
app.use(api.express());

const server = app.listen();

const fetch = makeFetch(server);

describe("info", () => {
  const client = new InfoClient({
    basePath: "/info",
    url: "",
    customFetchFunction: fetch as unknown as (
      input: RequestInfo | URL,
      init?: RequestInit | undefined
    ) => Promise<Response>,
  });

  it("should return info", async () => {
    await expect(client.getIndex()).resolves.toEqual({
      path: "",
      method: "any",
      description: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Nam eget aliquam leo, a pretium turpis.",
        "Mauris vitae elementum justo.",
      ],
      map: [
        {
          path: "/info",
          method: "any",
          description: [
            "This module can be used to get information about the API",
            "Just call /info/[path] to get information about this module",
          ],
          map: [],
          absolutePath: "/info",
        },
        {
          path: "/ping",
          method: "any",
          description: [],
          map: [],
          absolutePath: "/ping",
        },
        {
          path: "/hello",
          method: "get",
          description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "Nam eget aliquam leo, a pretium turpis.",
            "Mauris vitae elementum justo.",
          ],
          map: [],
          absolutePath: "/hello",
        },
      ],
      fields: [
        { name: "version", value: "1.0.0" },
        { name: "name", value: "Test API" },
      ],
      absolutePath: "",
    });
  });

  it("should return info for /hello", async () => {
    await expect(client.getInfo("/hello")).resolves.toEqual({
      path: "/hello",
      method: "get",
      description: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Nam eget aliquam leo, a pretium turpis.",
        "Mauris vitae elementum justo.",
      ],
      map: [],
      fields: [
        { name: "message", value: "Hello World!" },
        { name: "timestamp", value: expect.any(String) },
        { name: "version", value: "1.0.0" },
        { name: "name", value: "Test API" },
        { name: "author", value: "John Doe" },
      ],
      absolutePath: "/hello",
    });
  });

  afterAll(() => {
    server.close();
  });
});
