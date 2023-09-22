import express from "express";
import { api } from "./request-backend.mjs";
import helmet from "helmet";
import morgan from "morgan";

const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(helmet());
app.use(morgan("combined"));
app.use(api.express({ basePath: "/api" }));
app.use(express.static("build"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
