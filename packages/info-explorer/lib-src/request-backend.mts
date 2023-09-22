import { api as Api, method as Method } from "@rster/builder";
import "@rster/worker-express";
import { object, string, any, number } from "@rster/types";
import fetch from "node-fetch";

export const api = Api(
  "info-explorer-backend",
  ["Request backend to bypass CORS"],
  {},
  {
    request: Method(
      "/request",
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
          body,
          headers,
          method,
        });
        const responseBody = await response.text();
        return {
          body: responseBody,
          headers: response.headers.raw(),
          statusCode: response.status,
        };
      }
    ),
  }
).rest();