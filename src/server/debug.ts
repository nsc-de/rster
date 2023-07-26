import { Request } from "./common";
import { ContextCondition } from "./condition";
import { HttpError } from "./error";
import debug from "debug";

export class ResterDebugger {
  constructor() {}

  public generalDebugger = debug("rster:general");
  public httpErrorDebugger = debug("rster:http-error");
  public routerDebugger = debug("rster:router");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async debug(formatter: any, ...args: any[]) {
    this.generalDebugger(formatter, ...args);
  }

  public async debugHttpError(err: HttpError) {
    this.httpErrorDebugger("Error %s caught: \n%s", err.status, err.stack);
  }

  public async debugRoute(req: Request, condition: ContextCondition) {
    this.routerDebugger(
      "Route %s %s to %s",
      req.method,
      req.fullPath,
      condition.infoJson()
    );
  }
}
