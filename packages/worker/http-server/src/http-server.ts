import { Request, Response } from "@rster/common";
import { RestfulApi } from "@rster/basic";
import http from "http";
import querystring from "querystring";
import fs from "fs";

declare module "@rster/basic" {
  interface RestfulApi {
    createHttpServer(options?: HttpServerOptions): http.Server;
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

function contentTypeForExt(ext: string): string {
  let contentType = "text/plain";

  switch (ext) {
    case "html":
    case "htm":
      contentType = "text/html";
      break;
    case "css":
      contentType = "text/css";
      break;
    case "js":
      contentType = "text/javascript";
      break;
    case "json":
      contentType = "application/json";
      break;
    case "png":
      contentType = "image/png";
      break;
    case "jpg":
    case "jpeg":
      contentType = "image/jpeg";
      break;
    case "gif":
      contentType = "image/gif";
      break;
    case "svg":
      contentType = "image/svg+xml";
      break;
    case "ico":
      contentType = "image/x-icon";
      break;
    case "pdf":
      contentType = "application/pdf";
      break;
    case "zip":
      contentType = "application/zip";
      break;
    case "txt":
      contentType = "text/plain";
      break;
    case "csv":
      contentType = "text/csv";
      break;
    case "xml":
      contentType = "application/xml";
      break;
    // Add more cases for other common file extensions as needed

    default:
      contentType = "application/octet-stream";
      break;
  }

  return contentType;
}

export async function transformHttpServerRequest(
  req: http.IncomingMessage
): Promise<Request> {
  const url = new URL(req.url ?? "", "http://localhost");
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
    cookies: cookies,
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
  } as Request;
}

export function transformHttpServerResponse(
  res: http.OutgoingMessage
): Response {
  let _code: number = 200;
  let _body: string;
  const _headers: Record<string, string> = {};

  return {
    status(code: number): Response {
      _code = code;
      return this;
    },
    json(body: unknown): Response {
      _body = JSON.stringify(body);
      return this;
    },
    end(): Response {
      res.end();
      return this;
    },
    error(code: number, message: string): Response {
      _code = code;
      _body = message;
      return this;
    },
    header(field: string, value: string): Response {
      _headers[field] = value;
      return this;
    },
    redirect(url: string): Response {
      this.header("Location", url);
      return this;
    },
    send(body: string): Response {
      _body = body;
      return this;
    },
    sendFile(path: string): Response {
      const data = fs.readFileSync(path);
      const ext = path.split(".").pop();
      const contentType = contentTypeForExt(ext ?? "");
      this.header("Content-Type", contentType);
      this.send(data.toString());
      this.status(200);
      return this;
    },
  };
}

// create function to use in app.use()
export function httpServerFor(api: RestfulApi, options?: HttpServerOptions) {
  if (!api) throw new Error("api is required");

  if (!(api instanceof RestfulApi))
    throw new Error("api must be an instance of RestfulApi");

  options = options || {};
  const basePath = options.basePath || "";
  const send404 = options.send404 ?? true;

  return http.createServer(async (req, res) => {
    const request = await transformHttpServerRequest(req);
    const response = transformHttpServerResponse(res);

    if (!request.path.startsWith(basePath)) {
      response.status(404).json({ error: "Not Found" }).end();
      return;
    }

    const newPath = request.path.substring(basePath.length);

    api.handle(
      {
        ...request,
        path: newPath,
        fullApiPath: newPath,
      },
      response,
      {
        send404,
      }
    );
  });
}

export interface HttpServerOptions {
  basePath?: string;
  send404?: boolean;
  port?: number;
}

RestfulApi.prototype.createHttpServer = function (options?: HttpServerOptions) {
  return httpServerFor(this, options);
};
