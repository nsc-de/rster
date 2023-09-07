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
    const index = await client.getIndex();

    await expect(index.path).resolves.toBe("");
    await expect(index.method).resolves.toBe("any");
    await expect(index.description).resolves.toEqual([
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Nam eget aliquam leo, a pretium turpis.",
      "Mauris vitae elementum justo.",
    ]);
    await expect(index.absolutePath).resolves.toBe("/info");
    await expect(index.parent).resolves.toBeUndefined();
  });

  afterAll(() => {
    server.close();
  });
});
