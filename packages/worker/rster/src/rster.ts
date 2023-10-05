import { Request, Response } from "@rster/common";
import { RestfulApi } from "@rster/basic";

declare module "@rster/basic" {
  interface RestfulApi {
    rster(
      options?: RsterWorkerOptions
    ): (req: Request, res: Response, next: () => void) => void;
  }
}

// create function to use in app.use()
export function RsterMixin(api: RestfulApi, options?: RsterWorkerOptions) {
  if (!api) throw new Error("api is required");

  if (!(api instanceof RestfulApi))
    throw new Error("api must be an instance of RestfulApi");

  options = options || {};
  const basePath = options.basePath || "";
  const send404 = options.send404 ?? true;

  return function (req: Request, res: Response, next: () => void) {
    // if the request path does not start with the base path, skip
    if (!req.path.startsWith(basePath)) {
      return next();
    }

    req = {
      ...req,
      path: req.path.substring(basePath.length),
      fullApiPath: req.fullApiPath.substring(basePath.length),
    };

    api.handle(req, res, { send404 });
  };
}

export interface RsterWorkerOptions {
  basePath?: string;
  send404?: boolean;
}

RestfulApi.prototype.rster = function (options?: RsterWorkerOptions) {
  return RsterMixin(this, options);
};
