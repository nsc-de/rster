import rest, { basic } from "rster";
import fetch from "cross-fetch";
import express, { Express } from "express";
import "@rster/worker-express";
import { rest as Proxy } from "./index";
import { RestfulApi } from "@rster/basic";
// We will create a sample api

const api = rest(function () {
  this.usePing();
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

describe("proxy", () => {
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

  it("test api should work", async () => {
    const response = await fetch(`http://localhost:${port}/api/ping`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Pong! 🏓",
    });
  });

  it("proxy should redirect my request", async () => {
    const response = await fetch(
      `http://localhost:${proxyPort}/api/proxy/request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: `http://localhost:${port}/api/ping`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: "",
        }),
      }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      body: "pong",
      headers: {
        "content-length": ["4"],
        "content-type": ["text/plain; charset=utf-8"],
      },
      statusCode: 200,
    });
  });

  afterAll(() => {
    app.removeAllListeners();
    proxyApp.removeAllListeners();
    server.close();
    proxyServer.close();
  });
});
