import { declaration } from "../generator/index";
import { Context, ContextChildCondition } from "./context";

declare module "./context" {
  interface Context {
    description(): string[];
    description(...description: string[]): Context;
    description(context: Context): string[];

    field(name: string): any;
    field(name: string, value: any): Context;
    field(ctx: Context, name: string): any;
    field(ctx: Context, name: string, value: any): Context;

    fields(): FieldMap;
    fields(ctx: Context): FieldMap;
    useInfo(options?: { path?: string }): void;
  }
}

export interface FieldMap {
  [key: string]: any;
}

Context.prototype.description = function (...description: any[]): any {
  if (description.length == 0) return this.data("@info/description") ?? [];
  if (description[0] instanceof Context) {
    if (description.length !== 1)
      throw new Error("Cannot add description to another context");
    return description[0].data("@info/description") ?? [];
  }

  this.setData("@info/description", [
    ...(this.data("@info/description") ?? []),
    ...description,
  ]);
};

Context.prototype.field = function (arg0: any, arg1?: any, arg2?: any): any {
  if (typeof arg0 === "string") {
    if (typeof arg1 === "undefined") {
      const fields = this.data(`@info/fields`);
      if (!fields) return undefined;
      return fields[arg0];
    }

    const fields = this.data(`@info/fields`) ?? {};
    fields[arg0] = arg1;
    this.setData(`@info/fields`, fields);
    return this;
  }

  if (typeof arg1 === "string") {
    if (typeof arg2 === "undefined") {
      const fields = arg0.data(`@info/fields`);
      if (!fields) return undefined;
      return fields[arg1];
    }

    const fields = arg0.data(`@info/fields`) ?? {};
    fields[arg1] = arg2;
    arg0.setData(`@info/fields`, fields);
    return arg0;
  }

  throw new Error("Invalid arguments");
};

Context.prototype.fields = function (ctx?: Context): FieldMap {
  if (typeof ctx === "undefined") return this.data("@info/fields") ?? {};
  return ctx.data("@info/fields") ?? {};
};

Context.prototype.useInfo = function (options?: { path?: string }) {
  options = options ?? {};
  const path = options.path ?? "/info";

  this.any(path, function (ctx) {
    this.description(
      "This module can be used to get information about the API"
    );
    this.description(
      "Just call /info/[path] to get information about this module"
    );

    this.field("version", "0.1.0");

    this.use(async (req, res, next) => {
      const stack = await ctx.api.contextStack(req, res);
      let context = (
        stack[stack.length - 2]?.filter(
          (e) => e.type === "condition"
        )[0] as ContextChildCondition
      )?.context as Context;

      if (req.path == "/") {
        context = ctx.api;
      }

      if (!context) {
        res
          .status(404)
          .json({
            path: req.path,
            message: "Nothing found here",
          })
          .end();
        return;
      }

      const decl = declaration(context);

      res
        .status(200)
        .json({
          path: req.path,
          description: this.description(context),
          map: context?.info().map((e) => ({
            path: e.condition.path,
            method: e.condition.method ?? "any",
            description: this.description(e.context),
          })),
          fields: ((fields) =>
            Object.keys(fields).map((field) => ({
              name: field,
              value: fields[field],
            })))(this.fields(context)),
          declaration: decl,
        })
        .end();
    });
  });
};
