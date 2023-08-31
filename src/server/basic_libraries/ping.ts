import { declaration } from "../generator/index";
import { Context, ContextChildCondition } from "../basic/context";

declare module "../basic/context" {
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
  this.any(path, function (ctx) {
    this.action(async (req, res) => {
      res.status(200).json(response).end();
    });
  });
};
