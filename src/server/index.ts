import { Request, Response } from "./common.js";
import { Context, ContextHandler } from "./context.js";
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ExpressMixin, ExpressOptions } from "./express.js";

export * from "./common.js";
export * from "./condition.js";
export * from "./context.js";
export * from "./error.js";
export * from "./express.js";
export * from "./info.js";

export class RestfulApi extends Context {
  constructor() {

    // @ts-ignore
    super(undefined);
    this._api = this;

  }

  async handle(req: Request, res: Response, { send404 = true }: { send404?: boolean } = {}): Promise<void> {
    send404 = send404 ?? true;

    try {
      const found = await this.execute(req, res);
      if (!found && send404) {
        await res.status(404).json({ message: `Not Found`, path: req.fullPath, api_path: req.fullApiPath, method: req.method });
      }
      res.end();
      return;
    }
    catch (err) {
      // @ts-ignore
      if (err.stack) console.error(err.stack);
      else console.error(err);
      try {
        await res.status(500).json({ message: "Internal Server Error" });
      } catch (err) { }
    }
  }

  express(options?: ExpressOptions): ((req: ExpressRequest, res: ExpressResponse, next: any) => void) {
    return ExpressMixin(this, options);
  }
}

export function rest(init: ContextHandler) {
  return new RestfulApi().init(init);
}

export default rest;