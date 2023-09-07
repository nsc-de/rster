import express from "express";
import rest from "rster";
import { makeFetch } from "supertest-fetch";
import "@rster/worker-express";

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
  it("should return info", async () => {
    await fetch("/info/").expect(200, {
      description: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Nam eget aliquam leo, a pretium turpis.",
        "Mauris vitae elementum justo.",
      ],
      fields: [
        { name: "version", value: "1.0.0" },
        { name: "name", value: "Test API" },
      ],
      map: [
        {
          description: [
            "This module can be used to get information about the API",
            "Just call /info/[path] to get information about this module",
          ],
          method: "any",
          path: "/info",
        },
        { description: [], method: "any", path: "/ping" },
        {
          description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "Nam eget aliquam leo, a pretium turpis.",
            "Mauris vitae elementum justo.",
          ],
          method: "get",
          path: "/hello",
        },
      ],
      path: "/",
    });
  });

  afterAll(() => {
    server.close();
  });
});
