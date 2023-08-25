import { createSyntheticRequest, getLocalIP } from "./common";

describe("createSyntheticRequest", () => {
  it("should create a synthetic with all default parameters", () => {
    const request = createSyntheticRequest();
    expect(request.accepts).toEqual(["application/json"]);
    expect(request.acceptsCharsets).toEqual(["utf-8"]);
    expect(request.acceptsEncodings).toEqual(["identity"]);
    expect(request.acceptsLanguages).toEqual(["en"]);
    expect(request.body).toEqual({});
    expect(request.cookies).toEqual({});
    expect(request.fresh).toEqual(false);
    expect(request.hostname).toEqual("localhost");
    expect(request.ip).toEqual(getLocalIP());
    expect(request.ips).toEqual([getLocalIP()]);
    expect(request.method).toEqual("GET");
    expect(request.originalUrl).toEqual("/");
    expect(request.params).toEqual({});
    expect(request.path).toEqual("/");
    expect(request.protocol).toEqual("http");
    expect(request.query).toEqual({});
    expect(request.baseUrl).toEqual("/");
    expect(request.fullApiPath).toEqual("/");
    expect(request.fullPath).toEqual("/");
    expect(request.secure).toEqual(false);
    expect(request.signedCookies).toEqual({});
    expect(request.stale).toEqual(false);
    expect(request.subdomains).toEqual([]);
    expect(request.xhr).toEqual(false);

    expect(request.get("host")).toEqual("localhost");
    expect(request.get("Host")).toEqual("localhost");

    expect(request.header("host")).toEqual("localhost");
    expect(request.header("Host")).toEqual("localhost");

    expect(request.headers).toEqual({
      accept: "application/json",
      host: "localhost",
    });

    expect(request.is("html")).toEqual(false);
    expect(request.is("json")).toEqual(false);
    expect(request.is("application/json")).toEqual(false);
  });

  it("should create a synthetic with all parameters", () => {
    const request = createSyntheticRequest({
      accepts: ["text/html"],
      acceptsCharsets: ["utf-8", "utf-16"],
      acceptsEncodings: ["identity", "gzip", "deflate"],
      acceptsLanguages: ["en", "fr"],
      body: { name: "John Doe" },
      cookies: { name: "John Doe" },
      fresh: true,
      hostname: "example.com",
      ip: "example.com",
      ips: ["example.com"],
      method: "POST",
      originalUrl: "/aaa",
      params: { id: 1 },
      path: "/aaa",
      protocol: "https",
      query: { id: 1 },
      baseUrl: "/aaa",
      fullApiPath: "/aaa",
      fullPath: "/aaa",
      secure: true,
      signedCookies: { name: "John Doe" },
      stale: true,
      subdomains: ["example"],
      xhr: true,
      headers: {
        accept: "application/json",
        host: "example.com",
      },
    });

    expect(request.accepts).toEqual(["text/html"]);
    expect(request.acceptsCharsets).toEqual(["utf-8", "utf-16"]);
    expect(request.acceptsEncodings).toEqual(["identity", "gzip", "deflate"]);
    expect(request.acceptsLanguages).toEqual(["en", "fr"]);
    expect(request.body).toEqual({ name: "John Doe" });
    expect(request.cookies).toEqual({ name: "John Doe" });
    expect(request.fresh).toEqual(true);
    expect(request.hostname).toEqual("example.com");
    expect(request.ip).toEqual("example.com");
    expect(request.ips).toEqual(["example.com"]);
    expect(request.method).toEqual("POST");
    expect(request.originalUrl).toEqual("/aaa");
    expect(request.params).toEqual({ id: 1 });
    expect(request.path).toEqual("/aaa");
    expect(request.protocol).toEqual("https");
    expect(request.query).toEqual({ id: 1 });
    expect(request.baseUrl).toEqual("/aaa");
    expect(request.fullApiPath).toEqual("/aaa");
    expect(request.fullPath).toEqual("/aaa");
    expect(request.secure).toEqual(true);
    expect(request.signedCookies).toEqual({ name: "John Doe" });
    expect(request.stale).toEqual(true);
    expect(request.subdomains).toEqual(["example"]);
    expect(request.xhr).toEqual(true);

    expect(request.get("host")).toEqual("example.com");
    expect(request.get("Host")).toEqual("example.com");

    expect(request.header("host")).toEqual("example.com");
    expect(request.header("Host")).toEqual("example.com");

    expect(request.headers).toEqual({
      accept: "application/json",
      host: "example.com",
    });

    expect(request.is("html")).toEqual(false);
    expect(request.is("json")).toEqual(false);
    expect(request.is("application/json")).toEqual(false);
  });

  it("Test with custom function", () => {
    const request = createSyntheticRequest({
      accepts: ["text/html"],
      acceptsCharsets: ["utf-8", "utf-16"],
      acceptsEncodings: ["identity", "gzip", "deflate"],
      acceptsLanguages: ["en", "fr"],
      body: { name: "John Doe" },
      cookies: { name: "John Doe" },
      fresh: true,
      hostname: "example.com",
      ip: "example.com",
      ips: ["example.com"],
      method: "POST",
      originalUrl: "/aaa",
      params: { id: 1 },
      path: "/aaa",
      protocol: "https",
      query: { id: 1 },
      baseUrl: "/aaa",
      fullApiPath: "/aaa",
      fullPath: "/aaa",
      secure: true,
      signedCookies: { name: "John Doe" },
      stale: true,
      subdomains: ["example"],
      xhr: true,
      headers: {
        accept: "application/json",
        host: "example.com",
      },

      get: (name) => {
        return name;
      },

      header: (name) => {
        return name;
      },
      is: (name) => {
        return name;
      },
    });

    expect(request.accepts).toEqual(["text/html"]);
    expect(request.acceptsCharsets).toEqual(["utf-8", "utf-16"]);
    expect(request.acceptsEncodings).toEqual(["identity", "gzip", "deflate"]);
    expect(request.acceptsLanguages).toEqual(["en", "fr"]);
    expect(request.body).toEqual({ name: "John Doe" });
    expect(request.cookies).toEqual({ name: "John Doe" });
    expect(request.fresh).toEqual(true);
    expect(request.hostname).toEqual("example.com");
    expect(request.ip).toEqual("example.com");
    expect(request.ips).toEqual(["example.com"]);
    expect(request.method).toEqual("POST");
    expect(request.originalUrl).toEqual("/aaa");
    expect(request.params).toEqual({ id: 1 });
    expect(request.path).toEqual("/aaa");
    expect(request.protocol).toEqual("https");
    expect(request.query).toEqual({ id: 1 });
    expect(request.baseUrl).toEqual("/aaa");
    expect(request.fullApiPath).toEqual("/aaa");
    expect(request.fullPath).toEqual("/aaa");
    expect(request.secure).toEqual(true);
    expect(request.signedCookies).toEqual({ name: "John Doe" });
    expect(request.stale).toEqual(true);
    expect(request.subdomains).toEqual(["example"]);
    expect(request.xhr).toEqual(true);

    expect(request.get("host")).toEqual("host");
    expect(request.get("Host")).toEqual("Host");

    expect(request.header("host")).toEqual("host");
    expect(request.header("Host")).toEqual("Host");

    expect(request.headers).toEqual({
      accept: "application/json",
      host: "example.com",
    });

    expect(request.is("html")).toEqual("html");
    expect(request.is("json")).toEqual("json");
    expect(request.is("application/json")).toEqual("application/json");
  });
});
