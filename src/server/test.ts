import ts from "typescript";
import rest, { action, description, get, useInfo } from "./index.js";
import "./express.js";
import express from "express";
import { generateDeclarations } from "./generator/gen.js";
import { declaration } from "./generator/index.js";
import { AnyTypeInformation, ObjectTypeInformation, StringTypeInformation, object, string } from "../shared/types.js";


const api = rest(ctx => {
  get("/test", ctx => {

    description("Just a simple test endpoint");
    description("Just returns {\"test\": \"test\"}");

    declaration({
      name: "ping",
      returnBody: object({
        message: string("pong")
      })
    })

    action((req, res) => {
      res.json({ test: "test" });
    });

  })

  useInfo();
});

console.log(JSON.stringify(api.toJson()));


generateDeclarations({
  name: "test",
  ctx: api,
  outDir: "./cli",
});

// emit typescript declaration using typescript printer
// const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
// const result = printer.printNode(ts.EmitHint.Unspecified, typescript_declaration, ts.createSourceFile("test.ts", "", ts.ScriptTarget.Latest));

// console.log(result);

const app = express();
app.use(api.express());
app.listen(3000);