import { Request, Response } from "@rster/common";
import { RestfulApi } from "@rster/basic";
import http from "http";
import querystring from "querystring";

declare module "@rster/basic" {
  interface RestfulApi {
    createHttpServer(options?: ExpressOptions): http.Server;
  }
}

function parseCookies(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return {};
  }

  // Parse the cookie string into an object
  const cookieObject = querystring.parse(cookieHeader, "; ");

  return cookieObject;
}

export async function transformHttpServerRequest(
  req: http.IncomingMessage
): Request {
  const url = new URL(req.url ?? "", "http://localhost");
  const path = url.pathname;
  const query: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) query[key] = value;

  const headers: Record<string, string> = req.headers as any;
  const bodyRaw = await new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      resolve(body);
    });
    req.on("error", (err) => reject(err));
  });

  let body: any = JSON.parse(bodyRaw.toString());

  try {
    body = JSON.parse(bodyRaw.toString());
  } catch (err) {
    throw new Error("body is not a valid JSON");
  }

  const cookies = Object.fromEntries(
    (headers.cookie ?? "").split(";").map((c) => c.trim().split("="))
  );

  const accepts = headers.accept?.split(",").map((a) => a.trim()) ?? [];
  const acceptsCharsets =
    headers["accept-charset"].split(",").map((a) => a.trim()) ?? [];
  const acceptsEncodings =
    headers["accept-encoding"].split(",").map((a) => a.trim()) ?? [];
  const acceptsLanguages =
    headers["accept-language"].split(",").map((a) => a.trim()) ?? [];

  return {
    baseUrl: req.url ?? "",
    body,
    cookies: req.headers.cookie,
    hostname: req.headers.host ?? "localhost",
    ip: req.socket.remoteAddress ?? "",
    ips: req.socket.remoteAddress ? [req.socket.remoteAddress] : [], // TODO
    method: req.method ?? "GET",
    originalUrl: req.url ?? "",
    params: {},
    path: url.pathname,
    fullPath: url.pathname,
    fullApiPath: url.pathname,
    protocol: "http",
    secure: false,
    signedCookies: {},
    subdomains: url.hostname.split(".").slice(0, -2),
    xhr: headers["x-requested-with"] === "XMLHttpRequest",
    headers: req.headers,
    accepts: ((type?: string | string[]) => {
      if (!type) return accepts;
      if (typeof type === "string") return accepts.includes(type);
      return type.find((t) => accepts.includes(t));
    }) as { (): string[]; (type: string | string[]): string | false },
    acceptsCharsets: ((charset?: string | string[]) => {
      if (!charset) return acceptsCharsets;
      if (typeof charset === "string") return acceptsCharsets.includes(charset);
      return charset.find((c) => acceptsCharsets.includes(c));
    }) as { (): string[]; (charset: string | string[]): string | false },
    acceptsEncodings: ((encoding?: string | string[]) => {
      if (!encoding) return acceptsEncodings;
      if (typeof encoding === "string")
        return acceptsEncodings.includes(encoding);
      return encoding.find((e) => acceptsEncodings.includes(e));
    }) as { (): string[]; (encoding: string | string[]): string | false },
    acceptsLanguages: ((language?: string | string[]) => {
      if (!language) return acceptsLanguages;
      if (typeof language === "string")
        return acceptsLanguages.includes(language);
      return language.find((l) => acceptsLanguages.includes(l));
    }) as { (): string[]; (language: string | string[]): string | false },
    query,
    get(field: string): string | undefined {
      return headers[field] as string;
    },
    is(type: string | string[]): string | false | null {
      return headers["content-type"] === type ? type : false;
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
export function httpServerFor(api: RestfulApi, options?: ExpressOptions) {
  if (!api) throw new Error("api is required");

  if (!(api instanceof RestfulApi))
    throw new Error("api must be an instance of RestfulApi");

  options = options || {};
  const basePath = options.basePath || "";
  const send404 = options.send404 ?? true;

  const httpServer = http.createServer((req, res) => {});
}

export interface ExpressOptions {
  basePath?: string;
  send404?: boolean;
}

RestfulApi.prototype.express = function (options?: ExpressOptions) {
  return ExpressMixin(this, options);
};
