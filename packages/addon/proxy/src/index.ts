import { api as Api, method as Method, module as Module } from "@rster/builder";
import { object, string, any, number } from "@rster/types";
import fetch from "cross-fetch";

export const ProxyRequestMethod = Method(
  "request",
  ["Request a URL"],
  {
    returns: object({
      body: { type: string(), required: true },
      headers: { type: any(), required: true },
      statusCode: { type: number(), required: true },
    }),
    expectBody: {
      url: { type: string(), required: true },
      method: { type: string(), required: true },
      headers: { type: any(), required: true },
      body: { type: string(), required: true },
    },
  },
  "/request",
  "post",
  async ({ body, headers, method, url }) => {
    const response = await fetch(url, {
      body: body ? body : undefined,
      headers,
      method,
    });
    const responseBody = await response.text();
    const resHeaders: string[][] = [];
    response.headers.forEach((value, key) => {
      resHeaders.push([key, value]);
    });
    return {
      body: responseBody,
      headers: Object.fromEntries(resHeaders),
      statusCode: response.status,
    };
  }
);

export const ProxyModule = Module(
  "Proxy",
  ["Proxy module contains the proxy API"],
  {},
  {
    request: ProxyRequestMethod,
  },
  "/proxy"
);

export const ProxyApi = Api(
  "Proxy",
  ["Proxy API"],
  {
    proxy: ProxyModule,
  },
  {}
);

export const rest = ProxyApi.rest();
