import { Request, Response } from "./common.js";
import { Context, ContextHandler } from "./context.js";
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ExpressMixin, ExpressOptions } from "./express.js";
import { HttpError } from "./error.js";

export * from "./common.js";
export * from "./condition.js";
export * from "./context.js";
export * from "./error.js";
export * from "./express.js";
export * from "./info.js";

export function importer<T>(fn: () => Promise<T>): () => Promise<T> {
  let _result: T | undefined;
  let _promise: Promise<T> | undefined;
  return async () => {
    if (_result) return _result;
    if (_promise) return await _promise;
    _promise = fn();
    _result = await _promise;
    return _result;
  }
}

export class RestfulApi extends Context {
  private _options: RestfulApiOptions;
  public readonly _debugger: ResterDebugger;

  get debugger() {
    return this._debugger;
  }

  constructor(options?: RestfulApiOptionsInit) {

    // @ts-ignore
    super(undefined);

    const opts: RestfulApiOptions = {
      debug: options?.debug ?? false,
    }

    this._options = opts;

    this._api = this;
    this._debugger = new ResterDebugger(opts);

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

export interface RestfulApiOptions {
  debug: boolean;
}

export interface RestfulApiOptionsInit {
  debug?: boolean;
}

export class ResterDebugger {
  get isDebugEnabled() {
    return this._options.debug!!;
  }

  constructor(private readonly _options: RestfulApiOptions) { }

  private __get_debug = importer(() => import("debug").then(e => e.default));
  private __get_debug_general = importer(() => import("debug").then(e => e.default("rster:general")));
  private __get_debug_http_error = importer(() => import("debug").then(e => e.default("rster:http:error")));

  public async debugHttpError(err: HttpError) {
    if (this.isDebugEnabled) {
      const debug = await this.__get_debug_http_error();
      debug("Error %s caught: \n%s", err.name, err.stack);
    }
  }

  public async debug(formatter: any, ...args: any[]) {
    if (this.isDebugEnabled) {
      const debug = await this.__get_debug_general();
      debug(formatter, ...args);
    }
  }
}
export function rest(init: ContextHandler, options?: RestfulApiOptionsInit) {
  return new RestfulApi().init(init);
}

export default rest;