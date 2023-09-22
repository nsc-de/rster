import { api, module, method } from "@rster/builder";
import { undefinedType, string, array, object, number } from "@rster/types";
import "@rster/worker-express";
import express from "express";

const users: {
  name: string;
  age: number;
}[] = [];

const API = api(
  "api",
  ["a simple demo api"],
  {
    users: module(
      "users",
      ["module to handle users"],
      {},
      {
        create: method(
          "create",
          ["create a user"],
          {
            expectBody: {
              name: { required: true, type: string() },
              age: { required: true, type: number() },
            },
            returns: undefinedType(),
          },
          "/users",
          "post",
          ({ age, name }) => {
            users.push({ age, name });
          }
        ),

        list: method(
          "list",
          ["list users"],
          {
            returns: array(
              object({
                name: { type: string(), required: true },
                age: { type: number(), required: true },
              })
            ),
          },
          "/users",
          "get",
          () => users
        ),
      }
    ),
  },
  {}
);

const rster = API.rest();

const app = express();
app.use(rster.express());

app.listen(3000, () => {
  console.log("listening on port 3000");
});
