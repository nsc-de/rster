import express from "express";
import { ProxyModule } from "@rster/proxy";
import { api as Api } from "@rster/builder";
import helmet from "helmet";
import morgan from "morgan";
import "@rster/worker-express";

const api = Api(
  "Info Explorer Backend",
  ["Backend for Info Explorer"],
  {
    Proxy: ProxyModule,
  },
  {}
).rest();

const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(helmet());
app.use(morgan("combined"));
app.get("/info-client-settings.json", (req, res) => {
  res.json({
    proxy: "/api/proxy/request",
  });
});

const apiExpress = express.Router();
apiExpress.use(express.json());
apiExpress.use(api.express({ basePath: "" }));
app.use("/api", apiExpress);

app.use(express.static("build"));
app.use("/", (req, res) => {
  res.sendFile("index.html", { root: "build" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
