import { transformExpressRequest } from "./express";
import express from "express";
import rest, { $409, ExpressMixin } from "./index";
import request from "supertest";

describe("transformExpressRequest", () => {
  it("should transform express request", () => {
    /**
     * @type {import("express").Request}
     */
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

describe("Express tests", () => {
  let users = [];

  const app = rest(function () {
    // This is a test rest api
    // It is not meant to be used in production
    // It is definitely not secure as it stores passwords in plain text in memory
    // Also after restarting the server all users are gone

    this.description("Test description");
    this.any("/users", function () {
      this.post("/register", function () {
        this.action(function (request, response) {
          console.log(request);
          const { name, email, password } = request.body;
          if (!name || !email || !password) {
            return response.status(400).json({
              message: "Invalid request body",
            });
          }

          if (users.find((user) => user.email === email)) {
            throw $409("User with that email already exists");
          }

          if (users.find((user) => user.name === name)) {
            throw $409("User with that name already exists");
          }

          if (password.length < 8) {
            throw $409("Password must be at least 8 characters long");
          }

          users.push({
            name,
            email,
            password,
          });

          return response
            .status(201)
            .json({
              message: "User created",
            })
            .end();
        });
      });

      this.post("/login", function () {
        this.action(function (request, response) {
          const { email, password } = request.body;
          if (!email || !password) {
            return response.status(400).json({
              message: "Invalid request body",
            });
          }

          const user = users.find((user) => user.email === email);
          if (!user) {
            throw $409("User with that email does not exist");
          }

          if (user.password !== password) {
            throw $409("Invalid password");
          }

          return response.status(200).json({
            message: "User logged in",
          });
        });
      });
    });
  });

  const expressApp = express();
  expressApp.use(express.json()); // TODO Mixin should not need this to work
  expressApp.use(
    ExpressMixin(app, {
      basePath: "/api",
    })
  );

  it("should register user", async () => {
    const response = await request(expressApp)
      .post("/api/users/register")
      .send({
        name: "John",
        email: "john@example.com",
        password: "a_password",
      });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({
      message: "User created",
    });
  });

  it("should not register user with same email", async () => {
    const response = await request(expressApp)
      .post("/api/users/register")
      .send({
        name: "Jonny",
        email: "john@example.com",
        password: "a_password",
      });

    expect(response.status).toEqual(409);
    expect(response.body).toEqual({
      error: {
        status: 409,
        message: "User with that email already exists",
      },
    });
  });

  it("should not register user with same name", async () => {
    const response = await request(expressApp)
      .post("/api/users/register")
      .send({
        name: "John",
        email: "jonny@example.com",
        password: "a_password",
      });

    expect(response.status).toEqual(409);
    expect(response.body).toEqual({
      error: {
        status: 409,
        message: "User with that name already exists",
      },
    });
  });

  it("should not register user with short password", async () => {
    const response = await request(expressApp)
      .post("/api/users/register")
      .send({
        name: "Jonny",
        email: "jonny@example.com",
        password: "1234567",
      });

    expect(response.status).toEqual(409);
    expect(response.body).toEqual({
      error: {
        status: 409,
        message: "Password must be at least 8 characters long",
      },
    });
  });

  it("should login user", async () => {
    const response = await request(expressApp).post("/api/users/login").send({
      email: "john@example.com",
      password: "a_password",
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      message: "User logged in",
    });
  });

  it("should not login user with invalid password", async () => {
    const response = await request(expressApp).post("/api/users/login").send({
      email: "john@example.com",
      password: "invalid_password",
    });

    expect(response.status).toEqual(409);
    expect(response.body).toEqual({
      error: {
        status: 409,
        message: "Invalid password",
      },
    });
  });

  it("should not login user with invalid email", async () => {
    const response = await request(expressApp).post("/api/users/login").send({
      email: "jonny@example.com",
      password: "a_password",
    });

    expect(response.status).toEqual(409);
    expect(response.body).toEqual({
      error: {
        status: 409,
        message: "User with that email does not exist",
      },
    });
  });
});
