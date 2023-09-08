import rster from "rster";
import express from "express";
import "@rster/worker-express";
import helmet from "helmet";

const rest = rster.basic.rest;

const PORT = 3001;

const api = rest(function () {
  this.useInfo({ path: "/info" });
  this.usePing();

  this.description("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
  this.description("Nam eget aliquam leo, a pretium turpis.");
  this.description("Mauris vitae elementum justo.");
  this.field("version", "1.0.0");
  this.field("name", "Test API");

  this.get("/hello", function () {
    this.description(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    );
    this.description("Nam eget aliquam leo, a pretium turpis.");
    this.description("Mauris vitae elementum justo.");
    this.field("message", "Hello World!");
    this.field("timestamp", new Date().toISOString());
    this.field("version", "1.0.0");
    this.field("name", "Test API");
    this.field("author", "John Doe");

    this.action(function (req, res) {
      res.send({
        message: this.message,
        timestamp: this.timestamp,
        version: this.version,
        name: this.name,
      });
    });
  });
});

const app = express();
app.use(helmet());
app.use(api.express());

app.listen(PORT, () => {
  console.log(`Test API listening at http://localhost:${PORT}`);
});
