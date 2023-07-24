import { boolean, object, string } from "../shared/types.js";
import { api, buildRsterApi, method, module } from "./builder.js";

console.log(
  JSON.stringify(
    api({
      name: "test2",
      version: "0.1.0",

      modules: [
        module({
          name: "test2",

          methods: [
            method({
              name: "ping",
              declaration: {
                expectBody: {
                  message: { type: string(), optional: true },
                },
                returns: object({
                  message: string(),
                  received: string(),
                  ok: boolean(),
                }),
              },
              action: async ({ message }) => {
                return {
                  message: message || "pong",
                  received: new Date().toISOString(),
                  ok: "hello",
                };
              },
            }),
          ],
        }),
      ],

      methods: [
        method({
          name: "test2",
          declaration: {
            returns: string(),
          },
        }),
      ],
    })
  )
);
