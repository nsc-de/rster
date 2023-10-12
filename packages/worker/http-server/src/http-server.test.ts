import rest, { $409 } from "@rster/basic";
import ".";
import net from "net";
import fetch from "cross-fetch";

async function getPortFree(): Promise<number> {
  return new Promise((res) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close((_err) => res(port));
    });
  });
}

describe("Http Server Tests", () => {
  const users: { name: string; email: string; password: string }[] = [];

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

  const server = app.createHttpServer({
    basePath: "/api",
    send404: true,
  });

  let port: number;

  beforeAll(async () => {
    port = await getPortFree();
    server.listen(port);
  });

  describe("POST /api/users/register", () => {
    it("registers a user", async () => {
      console.log(`http://localhost:${port}/api/users/register`);
      await fetch(`http://localhost:${port}/api/users/register`, {
        method: "POST",
        body: JSON.stringify({
          name: "User",
          email: "test@test.com",
          password: "password",
        }),
      });

      expect(users).toContainEqual({
        name: "User",
        email: "test@test.com",
        password: "password",
      });
    });

    it("returns 400 if request body is invalid", async () => {
      const response = await fetch(
        `http://localhost:${port}/api/users/register`,
        {
          method: "POST",
          body: JSON.stringify({
            name: "User",
          }),
        }
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: "Invalid request body",
      });
    });
  });

  afterAll(async () => {
    server.close();
  });
});
