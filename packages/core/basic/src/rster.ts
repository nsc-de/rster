import { Context, ContextInitializer } from "./context";
import debug from "debug";
import { HttpError } from "./error";
import { Request, Response } from "@rster/common";

const debugHttpError = debug("rster:http-error");
const debugCaught = debug("rster:caught-error");

export class RestfulApi extends Context {
  private _options: RestfulApiOptions;

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
    console.log("handle", req.fullPath, req.fullApiPath);
    try {
      console.log("try");
      const found = await this.execute(req, res).catch((e) => {
        console.log("caught execute", e);
      });
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
    } catch (e: unknown) {
      console.log("caught");
      // console.error(e);
      if (e instanceof HttpError) {
        debugHttpError(e);
        res.status(e.status).json({ error: e.toJson() }).end();
      } else {
        debugCaught(e);
        try {
          res.status(500).json({ message: "Internal server error" }).end();
        } catch (e) {
          /* empty */
        }
      }
    } finally {
      console.log("finally");
    }
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
