import express from "express";
import { ProxyModule } from "@rster/proxy";
import { api as Api } from "@rster/builder";
import helmet from "helmet";
import morgan from "morgan";
import "@rster/worker-express";
import debug from "debug";

export function openServer({
  port,
  debug: debugEnabled,
  address,
}: {
  port: number;
  debug: boolean;
  address: string;
}) {
  const api = Api(
    "Info Explorer Backend",
    ["Backend for Info Explorer"],
    {
      Proxy: ProxyModule,
    },
    {}
  ).rest();

  if (debugEnabled) {
    debug.enable("rster:*");
  }

  const app = express();
  app.use(helmet());
  app.use(morgan("combined"));
  app.get(
    "/info-client-settings.json",
    (_req: express.Request, res: express.Response) => {
      res.json({
        proxy: "/api/proxy/request",
        address,
      });
    }
  );

  const apiExpress = express.Router();
  apiExpress.use(express.json());
  apiExpress.use(api.express({ basePath: "" }));
  app.use("/api", apiExpress);

  app.use(express.static("build"));
  app.use("/", (_req: express.Request, res: express.Response) => {
    res.sendFile("index.html", { root: "build" });
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
