import { Request, Response } from "./common";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { RestfulApi } from "./index";

export function transformExpressRequest(req: ExpressRequest): Request {
  return {
    baseUrl: req.baseUrl,
    body: req.body,
    cookies: req.cookies,
    fresh: req.fresh,
    hostname: req.hostname,
    ip: req.ip,
    ips: req.ips,
    method: req.method,
    originalUrl: req.originalUrl,
    params: req.params,
    path: req.path,
    fullPath: req.path,
    fullApiPath: req.path,
    protocol: req.protocol,
    secure: req.secure,
    signedCookies: req.signedCookies,
    stale: req.stale,
    subdomains: req.subdomains,
    xhr: req.xhr,
    headers: req.headers,
    accepts: req.accepts(),
    acceptsCharsets: req.acceptsCharsets(),
    acceptsEncodings: req.acceptsEncodings(),
    acceptsLanguages: req.acceptsLanguages(),
    query: req.query,

    get(field: string): string | undefined {
      return req.get(field);
    },
    is(type: string | string[]): string | false | null {
      return req.is(type);
    },
    header(field: string): string {
      return req.headers[field] as string;
    },
  };
}

export function transformExpressResponse(res: ExpressResponse): Response {
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    __express_res: res,
    status(code: number): Response {
      res.status(code);
      return this;
    },
    json(body: any): Response {
      res.json(body);
      return this;
    },
    end(): Response {
      res.end();
      return this;
    },
    error(code: number, message: string): Response {
      res.status(code).send(message);
      return this;
    },
    header(field: string, value: string): Response {
      res.header(field, value);
      return this;
    },
    redirect(url: string): Response {
      res.redirect(url);
      return this;
    },
    send(body: any): Response {
      res.send(body);
      return this;
    },
    sendFile(path: string): Response {
      res.sendFile(path);
      return this;
    },
  };
}

// create function to use in app.use()
export function ExpressMixin(api: RestfulApi, options?: ExpressOptions) {
  options = options || {};
  const basePath = options.basePath || "";
  const send404 = options.send404 ?? true;

  return function (req: ExpressRequest, res: ExpressResponse, next: any) {
    // if the request path does not start with the base path, skip
    if (!req.path.startsWith(basePath)) {
      return next();
    }

    let request = transformExpressRequest(req);
    const response = transformExpressResponse(res);

    request = {
      ...request,
      path: request.path.substring(basePath.length),
      fullApiPath: request.fullApiPath.substring(basePath.length),
    };

    api.handle(request, response, { send404 });
  };
}

export interface ExpressOptions {
  basePath?: string;
  send404?: boolean;
}
