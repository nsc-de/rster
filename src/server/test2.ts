import { string } from "../shared/types.js";
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
              name: "test2",
              declaration: {
                returns: string(),
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
