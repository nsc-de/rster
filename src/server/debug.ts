import { Request } from "./common";
import { ContextCondition } from "./condition";
import { HttpError } from "./error";
import debug from "debug";

/**
 * Rester debugger
 * This tool is used to generate rster's debug logs
 *
 * @example
 * ```typescript
 * ResterDebugger.instance.debug("Hello, %s", "world");
 * ```
 *
 * @see {@link ResterDebugger.instance}
 */
export class ResterDebugger {
  /**
   *
   *
   * @static
   * @memberof ResterDebugger
   */
  public static readonly instance = new ResterDebugger();
  constructor() {}

  /**
   * Rster general debugger.
   */
  public generalDebugger = debug("rster:general");

  /**
   * Rster http error debugger.
   * This debugger is used to report http errors.
   */
  public httpErrorDebugger = debug("rster:http-error");

  /**
   * Rster router debugger.
   * This debugger is used to report where a request is routed to and why.
   */
  public routerDebugger = debug("rster:router");

  /**
   * Function for debugging general information (will be feed directly to {@link generalDebugger})
   * @param formatter The formatter string
   * @param args The arguments
   *
   * @example
   * ```typescript
   * ResterDebugger.instance.debug("Hello, %s", "world");
   * ```
   *
   * @see {@link generalDebugger}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async debug(formatter: string, ...args: any[]) {
    this.generalDebugger(formatter, ...args);
  }

  /**
   * Function for debugging http errors (will be feed directly to {@link httpErrorDebugger})
   *
   * @example
   * ```typescript
   * ResterDebugger.instance.debugHttpError(err);
   * ```
   *
   * @param err The caught http error
   * @see {@link httpErrorDebugger}
   */
  public async debugHttpError(err: HttpError) {
    this.httpErrorDebugger("Error %s caught: \n%s", err.status, err.stack);
  }

  /**
   * Function for debugging router (will be feed directly to {@link routerDebugger})
   *
   * @param req - The request to be routed
   * @param condition - The condition that is true for this request
   */
  public async debugRoute(req: Request, condition: ContextCondition) {
    this.routerDebugger(
      "Route %s %s to %s",
      req.method,
      req.fullPath,
      condition.infoJson()
    );
  }
}
