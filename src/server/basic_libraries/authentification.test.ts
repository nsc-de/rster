import { createSyntheticContext } from "../basic/common";
import { $409 } from "../basic/error";
import rest from "../basic/rster";
import "./authentification";
import { JsonWebTokenManager } from "./authentification";

describe("useAuthentification", () => {
  it("throwning function should not pass", async () => {
    const app = rest(function () {
      this.useAuthentification(() => {
        throw $409("Invalid token");
      });
    });

    const { pass, promise } = createSyntheticContext({
      method: "GET",
    });

    app.handle(...pass);

    const data = await promise;
    expect(data.code).toBe(409);
    expect(data.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(data.data).toEqual(
      '{"error":{"status":409,"message":"Invalid token"}}'
    );
  });

  it("should pass", async () => {
    const app = rest(function () {
      this.useAuthentification(() => {
        return true;
      });
    });
  });

  it("should pass with async function", async () => {
    const app = rest(function () {
      this.useAuthentification(async () => {
        return true;
      });
    });
  });

  it("should not pass with return false", async () => {
    const app = rest(function () {
      this.useAuthentification(() => {
        return false;
      });
    });

    const { pass, promise } = createSyntheticContext({
      method: "GET",
    });

    app.handle(...pass);

    const data = await promise;
    expect(data.code).toBe(401);
    expect(data.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(data.data).toEqual('{"message":"Unauthorized"}');
  });
});

describe("JsonWebTokenManager", () => {
  describe("#constructor()", () => {
    it("should create instance", () => {
      const manager = new JsonWebTokenManager("secret");
      expect(manager).toBeInstanceOf(JsonWebTokenManager);
    });
  });
  describe("sign", () => {
    it("should sign", () => {
      const manager = new JsonWebTokenManager("secret");
      const token = manager.sign({ id: 1 });
      expect(token).toBe(
        "eyJpZCI6MX0=:KbVPqYLltA3WYo9UpS4Jszh820oHfZV1UOjtsZUiVhUuzQak7UJlBxZka1nDQ7xag6MuMyvVUl2ZyBy18rslAA=="
      );
    });

    it("another sign of more complex object", () => {
      const manager = new JsonWebTokenManager("secret");
      const token = manager.sign({
        id: 1,
        name: "John Doe",
        age: 20,
        address: { city: "Tokyo", country: "Japan" },
        permissions: ["admin", "user"],
      });

      expect(token).toBe(
        "eyJpZCI6MSwibmFtZSI6IkpvaG4gRG9lIiwiYWdlIjoyMCwiYWRkcmVzcyI6eyJjaXR5IjoiVG9reW8iLCJjb3VudHJ5IjoiSmFwYW4ifSwicGVybWlzc2lvbnMiOlsiYWRtaW4iLCJ1c2VyIl19:kT9yRqS8owgw6a2m4seQp+POJ5iBOsH/XPNj+NWEdyWCEVpDhbI69VFsrcTyBOlYuM+AgoxqagMN9gGwRQxHRA=="
      );
    });
  });

  describe("verify", () => {
    it("should verify", () => {
      const manager = new JsonWebTokenManager("secret");
      const token = manager.sign({ id: 1 });
      const data = manager.verify(token, {});

      expect(data).toEqual({ id: 1 });
    });

    it("should throw error when signature is invalid", () => {
      const manager = new JsonWebTokenManager("secret");
      const token = manager.sign({ id: 1 });
      const splitted = token.split(":");
      const invalid_token = splitted[0] + ":invalid_signature";

      expect(() => {
        manager.verify(invalid_token, {});
      }).toThrow($409("Invalid token"));
    });

    it("should throw error when token is invalid", () => {
      const manager = new JsonWebTokenManager("secret");
      const token = manager.sign({ id: 1 });
      const splitted = token.split(":");
      const invalid_token = "f9ekfo82:" + splitted[1];

      expect(() => {
        manager.verify(invalid_token, {});
      }).toThrow($409("Invalid token"));
    });

    it("test throw on token with to many parts", () => {
      const manager = new JsonWebTokenManager("secret");
      expect(() => {
        manager.verify("a:b:c:d", {});
      }).toThrow($409("Invalid token"));
    });
  });
});
