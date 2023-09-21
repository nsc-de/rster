import rest from "rster";
import "@rster/worker-express";
import express from "express";
import { object, string } from "@rster/types";

const api = rest(function () {
  this.description("This is a description of our api"); // Adds a description to our api
  this.description("Some more description"); // Adds a description to our api
  this.field("version", "1.0.0"); // Adds a field to our api
  this.field("author", "John Doe"); // Adds a field to our api

  this.usePing(); // Adds a ping endpoint to our api
  // Ping endpoint automatically has a description and fields added to it

  this.get("/hello", function () {
    this.description("This is a description your /hello route");
    this.field("someField", "someValue"); // Adds a field to our /hello route

    // Declaration is used to add a description and fields to the return body of our /hello route
    this.declaration({
      name: "Hello",
      expectBody: {
        name: { type: string(), required: true },
      },

      // Params via expectParams
      // expectParams: {
      //   name: { type: string(), required: true },
      // },

      // Query via expectQuery
      // expectQuery: {
      //   name: { type: string(), required: true },
      // },

      returnBody: object({
        message: { type: string(), required: true },
      }),
    });

    this.action(function (req, res) {
      res
        .status(200)
        .json({ message: `Hello ${req.body.name}!` })
        .end();
    });
  });
});

const app = express();

app.use(api.express());

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
