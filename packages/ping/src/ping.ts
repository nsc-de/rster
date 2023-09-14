// import { declaration } from "../generator/index";
import { Context } from "@rster/basic";

declare module "@rster/basic" {
  interface Context {
    usePing(options?: { path?: string }): void;
  }
}

Context.prototype.usePing = function (options?: {
  path?: string;
  response?: unknown;
}): void {
  const path = options?.path ?? "/ping";
  const response = options?.response ?? { message: "Pong! 🏓" };
  this.any(path, function () {
    this.action(async (_req, res) => {
      res.status(200).json(response).end();
    });
  });
};
