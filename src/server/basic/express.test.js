import { transformExpressRequest } from "./express";

describe("transformExpressRequest", () => {
  it("should transform express request", () => {
    const expressRequest = {
      baseUrl: "/api",
      body: {
        name: "John",
        age: 30,
      },
      cookies: {
        name: "John",
        age: 30,
      },
      headers: {
        "content-type": "application/json",
      },
      hostname: "localhost",
      ip: "192.168.178.1",
      ips: ["192.168.178.1"],
      method: "GET",
      originalUrl: "/api/users",
      params: {
        id: "123",
      },
      path: "/users",
      protocol: "http",
      query: {
        name: "John",
        age: 30,
      },
      route: {
        path: "/users",
        stack: [],
      },
      secure: false,
      signedCookies: {
        name: "John",
        age: 30,
      },
      stale: false,
      subdomains: ["john"],
      xhr: false,

      accepts: () => {
        return "application/json";
      },
      acceptsCharsets: () => {
        return "utf-8";
      },
      acceptsEncodings: () => {
        return "gzip";
      },
      acceptsLanguages: () => {
        return "en";
      },
      get: () => {
        return undefined;
      },
      is: () => {
        return "application/json";
      },
    };

    const request = transformExpressRequest(expressRequest);

    expect(request).toEqual({
      baseUrl: "/api",
      body: {
        name: "John",
        age: 30,
      },
      cookies: {
        name: "John",
        age: 30,
      },
      fresh: undefined,
      headers: {
        "content-type": "application/json",
      },
      hostname: "localhost",
      ip: "192.168.178.1",
      ips: ["192.168.178.1"],
      method: "GET",
      originalUrl: "/api/users",
      params: {
        id: "123",
      },
      path: "/users",
      fullApiPath: "/users",
      fullPath: "/users",
      protocol: "http",
      query: {
        name: "John",
        age: 30,
      },
      secure: false,
      signedCookies: {
        name: "John",
        age: 30,
      },
      stale: false,
      subdomains: ["john"],
      xhr: false,
      get: request.get,
      is: request.is,
      header: request.header,
      accepts: request.accepts,
      acceptsCharsets: request.acceptsCharsets,
      acceptsEncodings: request.acceptsEncodings,
      acceptsLanguages: request.acceptsLanguages,
    });

    expect(request.get("")).toEqual(undefined);
    expect(request.header("content-type")).toEqual("application/json");
    expect(request.accepts("application/json")).toEqual("application/json");
    expect(request.acceptsCharsets("utf-8")).toEqual("utf-8");
    expect(request.acceptsEncodings("gzip")).toEqual("gzip");
    expect(request.acceptsLanguages("en")).toEqual("en");
    expect(request.is("")).toEqual("application/json");
  });
});
