import { Request } from "./common.js";
import { ContextCondition } from "./condition.js";
import { HttpError } from "./error.js";
import debug from "debug";

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

export class ResterDebugger {

  constructor() { }

  public generalDebugger = debug("rster:general");
  public httpErrorDebugger = debug("rster:http-error");
  public routerDebugger = debug("rster:router");

  public async debug(formatter: any, ...args: any[]) {
    this.generalDebugger(formatter, ...args);
  }

  public async debugHttpError(err: HttpError) {
    this.httpErrorDebugger("Error %s caught: \n%s", err.status, err.stack);
  }

  public async debugRoute(req: Request, condition: ContextCondition) {
    this.routerDebugger("Route %s %s to %s", req.method, req.fullPath, condition.infoJson());
  }
}