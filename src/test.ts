import rest, { action, description, get, useInfo } from "./index.js";
import "./express.js";
import express from "express";


const api = rest(ctx => {
  get("/test", ctx => {

    description("Just a simple test endpoint");
    description("Just returns {\"test\": \"test\"}");

    action((req, res) => {
      res.json({ test: "test" });
    });

  })

  useInfo();
});

console.log(JSON.stringify(api.toJson()));


const app = express();
app.use(api.express());
app.listen(3000);