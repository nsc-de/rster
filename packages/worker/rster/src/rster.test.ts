import rest, { $409 } from "@rster/basic";
import ".";

import { createSyntheticContext } from "@rster/common";

describe("Express tests", () => {
  const users: { name: string; email: string; password: string }[] = [];

  beforeAll(async () => {
    const { pass, promise } = createSyntheticContext({
      method: "POST",
      path: "/api/users/register",
      body: {
        name: "John2",
        email: "john2@example.com",
        password: "a_password",
      },
    });
    app2.handle(...pass);
    await promise;
  });

  const app = rest(function () {
    // This is a test rest api
    // It is not meant to be used in production
    // It is definitely not secure as it stores passwords in plain text in memory
    // Also after restarting the server all users are gone

    this.any("/users", function () {
      this.post("/register", function () {
        this.action(function (request, response) {
          const { name, email, password } = request.body;
          if (!name || !email || !password) {
            return response.status(400).json({
              message: "Invalid request body",
            });
          }

          if (users.find((user) => user.email === email) !== undefined) {
            throw $409("User with that email already exists");
          }

          if (users.find((user) => user.name === name) !== undefined) {
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

  const app2 = rest(function () {
    this.use(app.rster({ basePath: "/api" }));
  });

  it("should register user", async () => {
    const { pass, promise } = createSyntheticContext({
      method: "POST",
      path: "/api/users/register",
      body: {
        name: "John",
        email: "john@example.com",
        password: "a_password",
      },
    });

    await app2.handle(...pass);

    const response = await promise;

    expect(response.code).toEqual(201);
    expect(response.data).toEqual('{"message":"User created"}');
  });

  it("should not register user with same email", async () => {
    const { pass, promise } = createSyntheticContext({
      method: "POST",
      path: "/api/users/register",
      body: {
        name: "John2",
        email: "john2@example.com",
        password: "a_password",
      },
    });

    await app2.handle(...pass);
    const response = await promise;

    console.log(response);

    expect(response.code).toEqual(409);
    expect(response.data).toEqual(
      '{"error":{"status":409,"message":"User with that email already exists"},"path":"/api/users/register","api_path":"/users/register","method":"POST"}'
    );
  });

  //   it("should not register user with same name", async () => {
  //     const response = await request(expressApp)
  //       .post("/api/users/register")
  //       .send({
  //         name: "John",
  //         email: "jonny@example.com",
  //         password: "a_password",
  //       });

  //     expect(response.status).toEqual(409);
  //     expect(response.body).toEqual({
  //       error: {
  //         status: 409,
  //         message: "User with that name already exists",
  //       },
  //     });
  //   });

  //   it("should not register user with short password", async () => {
  //     const response = await request(expressApp)
  //       .post("/api/users/register")
  //       .send({
  //         name: "Jonny",
  //         email: "jonny@example.com",
  //         password: "1234567",
  //       });

  //     expect(response.status).toEqual(409);
  //     expect(response.body).toEqual({
  //       error: {
  //         status: 409,
  //         message: "Password must be at least 8 characters long",
  //       },
  //     });
  //   });

  //   it("should login user", async () => {
  //     const response = await request(expressApp).post("/api/users/login").send({
  //       email: "john@example.com",
  //       password: "a_password",
  //     });

  //     expect(response.status).toEqual(200);
  //     expect(response.body).toEqual({
  //       message: "User logged in",
  //     });
  //   });

  //   it("should not login user with invalid password", async () => {
  //     const response = await request(expressApp).post("/api/users/login").send({
  //       email: "john@example.com",
  //       password: "invalid_password",
  //     });

  //     expect(response.status).toEqual(409);
  //     expect(response.body).toEqual({
  //       error: {
  //         status: 409,
  //         message: "Invalid password",
  //       },
  //     });
  //   });

  //   it("should not login user with invalid email", async () => {
  //     const response = await request(expressApp).post("/api/users/login").send({
  //       email: "jonny@example.com",
  //       password: "a_password",
  //     });

  //     expect(response.status).toEqual(409);
  //     expect(response.body).toEqual({
  //       error: {
  //         status: 409,
  //         message: "User with that email does not exist",
  //       },
  //     });
  //   });

  //   it("should ignore request not starting with base path", async () => {
  //     const response = await request(expressApp).post("/users/login").send({
  //       email: "john@example.com",
  //       password: "a_password",
  //     });

  //     expect(response.status).toEqual(404);
  //     expect(response.body).toEqual({});
  //   });

  //   it("should ignore request not matching any route", async () => {
  //     const response = await request(expressApp).post("/api/users").send({
  //       email: "john@example.com",
  //       password: "a_password",
  //     });

  //     expect(response.status).toEqual(404);
  //     expect(response.body).toEqual({
  //       api_path: "/users",
  //       message: "Not Found",
  //       method: "POST",
  //       path: "/api/users",
  //     });
  //   });
});
