import { createSyntheticContext } from "../basic/common";
import rest from "../basic/rster";
import "./ping";

describe("Ping endpoint", () => {
  const api = rest(function () {
    this.usePing();
  });

  it("should return pong", async () => {
    const { pass, promise } = createSyntheticContext({
      method: "GET",
      path: "/ping",
    });

    api.handle(...pass);

    const res = await promise;
    expect(res.code).toBe(200);
    expect(res.data).toEqual('{"message":"Pong! 🏓"}');
  });
});
