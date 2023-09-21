import rest from "rster";
import "@rster/worker-express";
import express from "express";

const api = rest(function () {
  this.usePing(); // Adds a ping endpoint to our api

  this.get("/hello", function () {
    this.action(function (req, res) {
      res.status(200).json({ message: "Hello World!" }).end();
    });
  });
});

const app = express();

app.use(api.express());
