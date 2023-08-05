import { Request, Response } from "./common";
import { Context, ContextInitializer } from "./context";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { ExpressMixin, ExpressOptions } from "./express";
import { ResterDebugger } from "./debug";

export * from "./common";
export * from "./condition";
export * from "./context";
export * from "./error";
export * from "./express";
export * from "./info";
export * as types from "./types";

export class RestfulApi extends Context {
  private _options: RestfulApiOptions;
  public readonly _debugger = new ResterDebugger();

  get debugger() {
    return this._debugger;
  }

  constructor(options?: RestfulApiOptionsInit) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(undefined as any);

    const opts: RestfulApiOptions = {
      debug: options?.debug ?? false,
    };

    this._options = opts;

    this._api = this;
  }

  async handle(
    req: Request,
    res: Response,
    { send404 = true }: { send404?: boolean } = {}
  ): Promise<void> {
    send404 = send404 ?? true;

    try {
      const found = await this.execute(req, res);
      if (!found && send404) {
        await res.status(404).json({
          message: `Not Found`,
          path: req.fullPath,
          api_path: req.fullApiPath,
          method: req.method,
        });
      }
      res.end();
      return;
    } catch (err: unknown) {
      if ((err as Error).stack) console.error((err as Error).stack);
      else console.error(err);
      try {
        await res.status(500).json({ message: "Internal Server Error" });
        // eslint-disable-next-line no-empty
      } catch (err) {}
    }
  }

  express(
    options?: ExpressOptions
  ): (req: ExpressRequest, res: ExpressResponse, next: any) => void {
    return ExpressMixin(this, options);
  }
}

export interface RestfulApiOptions {
  debug: boolean;
}

export interface RestfulApiOptionsInit {
  debug?: boolean;
}

export function rest(init: ContextInitializer) {
  return new RestfulApi().init(init);
}

export default rest;