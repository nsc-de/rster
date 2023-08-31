import { createSyntheticContext } from "../basic/common";
import { $409 } from "../basic/error";
import rest from "../basic/rster";
import "./authentification";

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
