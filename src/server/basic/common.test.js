import {
  createSyntheticRequest,
  getLocalIP,
  createSyntheticResponse,
} from "./common";

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

describe("createSyntheticResponse", () => {
  it("should create a synthetic with all default parameters", () => {
    const { promise, response } = createSyntheticResponse();
    expect(promise).toBeInstanceOf(Promise);
    expect(response.end).toBeInstanceOf(Function);
    expect(response.error).toBeInstanceOf(Function);
    expect(response.header).toBeInstanceOf(Function);
    expect(response.json).toBeInstanceOf(Function);
    expect(response.redirect).toBeInstanceOf(Function);
    expect(response.send).toBeInstanceOf(Function);
    expect(response.sendFile).toBeInstanceOf(Function);
    expect(response.status).toBeInstanceOf(Function);
  });

  it("end should resolve the promise", async () => {
    const { promise, response } = createSyntheticResponse();
    response.end();
    await promise;
  });

  it("error should add an error to the response", async () => {
    const { promise, response } = createSyntheticResponse();
    response.error(404, "error");
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 404,
      data: "error",
      headers: {},
      sendFile: undefined,
    });
  });

  it("header should add a header to the response", async () => {
    const { promise, response } = createSyntheticResponse();
    response.header("header", "value");
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 200,
      data: "",
      headers: { header: "value" },
      sendFile: undefined,
    });
  });

  it("json should add a json to the response", async () => {
    const { promise, response } = createSyntheticResponse();
    response.json({ name: "John Doe" });
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 200,
      data: '{"name":"John Doe"}',
      headers: { "Content-Type": "application/json" },
      sendFile: undefined,
    });
  });

  it("redirect should add a redirect to the response", async () => {
    const { promise, response } = createSyntheticResponse();
    response.redirect("/aaa");
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 302,
      data: "",
      headers: { Location: "/aaa" },
      sendFile: undefined,
    });
  });

  it("send should add a send to the response", async () => {
    const { promise, response } = createSyntheticResponse();
    response.send("send");
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 200,
      data: "send",
      headers: {},
      sendFile: undefined,
    });
  });

  it("sendFile should add a sendFile to the response", async () => {
    const { promise, response } = createSyntheticResponse();
    response.sendFile("sendFile");
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 200,
      data: "",
      headers: {},
      sendFile: "sendFile",
    });
  });

  it("test status should set code", async () => {
    const { promise, response } = createSyntheticResponse();
    response.status(404);
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 404,
      data: "",
      headers: {},
      sendFile: undefined,
    });
  });

  it("test error with message sent before", async () => {
    const { promise, response } = createSyntheticResponse();
    response.send("send");
    response.error(404, "error");
    response.end();
    const result = await promise;
    expect(result).toEqual({
      code: 404,
      data: "send",
      headers: {},
      sendFile: undefined,
    });
  });
});
