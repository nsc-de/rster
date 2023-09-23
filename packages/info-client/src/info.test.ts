import "@rster/info";
import "@rster/worker-express";
import express, { Express } from "express";
import rest, { basic } from "rster";
import { InfoClient } from "./info";
import { rest as Proxy } from "@rster/proxy";

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

function createExpressApp(api: basic.RestfulApi) {
  if (!(api instanceof basic.RestfulApi))
    throw new Error(
      `Api must be an instance of RestfulApi, but got ${typeof api} (${api}})`
    );

  return new Promise<{
    app: Express;
    port: number;
    server: ReturnType<Express["listen"]>;
  }>((resolve, reject) => {
    const app = express();
    app.use(express.json());
    app.use("/api", api.express());
    const server = app.listen(0, () => {
      const address = server.address();
      if (address == null || typeof address === "string") {
        return reject(new Error("Server address is not available"));
      }

      resolve({
        app,
        port: address.port,
        server,
      });
    });
  });
}

describe("info", () => {
  let app: Express,
    port: number,
    server: ReturnType<Express["listen"]>,
    proxyApp: Express,
    proxyPort: number,
    proxyServer: ReturnType<Express["listen"]>;

  beforeAll(async () => {
    const {
      app: _app,
      port: _port,
      server: _server,
    } = await createExpressApp(api);
    const {
      app: _ProxyApp,
      port: _proxyPort,
      server: _proxyServer,
    } = await createExpressApp(Proxy);
    app = _app;
    port = _port;
    server = _server;
    proxyApp = _ProxyApp;
    proxyPort = _proxyPort;
    proxyServer = _proxyServer;
  });

  describe("info without proxy", () => {
    it("should return info", async () => {
      const client = new InfoClient({
        basePath: "/api/info",
        url: `http://localhost:${port}`,
      });

      const index = await client.getIndex();

      await expect(index.path).resolves.toBe("");
      await expect(index.method).resolves.toBe("any");
      await expect(index.description).resolves.toEqual([
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Nam eget aliquam leo, a pretium turpis.",
        "Mauris vitae elementum justo.",
      ]);
      await expect(index.absolutePath).resolves.toBe("/api/info");
      await expect(index.parent).resolves.toBeUndefined();
    });

    it("should return info for /hello", async () => {
      const client = new InfoClient({
        basePath: "/api/info",
        url: `http://localhost:${port}`,
      });

      const hello = await client.getInfo("/hello");

      await expect(hello.path).resolves.toBe("/hello");
      await expect(hello.method).resolves.toBe("get");
      await expect(hello.description).resolves.toEqual([
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Nam eget aliquam leo, a pretium turpis.",
        "Mauris vitae elementum justo.",
      ]);
      await expect(hello.absolutePath).resolves.toBe("/api/info/hello");
      await expect(hello.path).resolves.toBe("/hello");
    });
  });

  describe("info with proxy", () => {
    it("should return info", async () => {
      const client = new InfoClient({
        basePath: "/api/info",
        proxy: `http://localhost:${proxyPort}/api/proxy/request`,
        url: `http://localhost:${port}`,
      });

      const index = await client.getIndex();

      await expect(index.path).resolves.toBe("");
      await expect(index.method).resolves.toBe("any");
      await expect(index.description).resolves.toEqual([
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Nam eget aliquam leo, a pretium turpis.",
        "Mauris vitae elementum justo.",
      ]);
      await expect(index.absolutePath).resolves.toBe("/api/info");
      await expect(index.parent).resolves.toBeUndefined();
    });

    it("should return info for /hello", async () => {
      const client = new InfoClient({
        basePath: "/api/info",
        proxy: `http://localhost:${proxyPort}/api/proxy/request`,o
        url: `http://localhost:${port}`,
      });

      const hello = await client.getInfo("/hello");

      await expect(hello.path).resolves.toBe("/hello");
      await expect(hello.method).resolves.toBe("get");
      await expect(hello.description).resolves.toEqual([
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Nam eget aliquam leo, a pretium turpis.",
        "Mauris vitae elementum justo.",
      ]);
      await expect(hello.absolutePath).resolves.toBe("/api/info/hello");
      await expect(hello.path).resolves.toBe("/hello");
    });
  });

  afterAll(() => {
    server.close();
    proxyServer.close();
  });
});
