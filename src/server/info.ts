import { declaration } from "./generator/index";
import {
  Context,
  ContextTypeCondition,
  any,
  data,
  setData,
  use,
} from "./context";

export function description(): string[];
export function description(...description: string[]): Context;
export function description(context: Context): string[];
export function description(...description: any[]): any {
  if (description.length == 0) return data("@info/description");
  if (description[0] instanceof Context) {
    if (description.length !== 1)
      throw new Error("Invalid number of arguments");
    return description[0].data("@info/description") ?? [];
  }

  setData("@info/description", [
    ...(data("@info/description") ?? []),
    ...description,
  ]);
}

export interface FieldMap {
  [key: string]: any;
}

export function field(ctx: Context, name: string): any;
export function field(ctx: Context, name: string, value: any): Context;
export function field(name: string): any;
export function field(name: string, value: any): Context;
export function field(arg0: any, arg1?: any, arg2?: any): any {
  if (typeof arg0 === "string") {
    if (typeof arg1 === "undefined") {
      const fields = data(`@info/fields`);
      if (!fields) return undefined;
      return fields[arg0];
    }

    const fields = data(`@info/fields`) ?? {};
    fields[arg0] = arg1;
    setData(`@info/fields`, fields);
    return Context.current;
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
}

export function fields(): FieldMap;
export function fields(ctx: Context): FieldMap;
export function fields(ctx?: Context): FieldMap {
  if (typeof ctx === "undefined") return data("@info/fields") ?? {};

  return ctx.data("@info/fields") ?? {};
}

export function useInfo(options?: { path?: string }) {
  options = options ?? {};
  const path = options.path ?? "/info";

  any(path, async (ctx) => {
    description("This module can be used to get information about the API");
    description("Just call /info/[path] to get information about this module");

    field("version", "0.1.0");

    use(async (req, res, next) => {
      const stack = await ctx.api.contextStack(req, res);
      let context = (
        stack[stack.length - 2]?.filter(
          (e) => e.type === "condition"
        )[0] as ContextTypeCondition
      )?.context;

      if (req.path == "/") {
        context = ctx.api;
      }

      if (!context) {
        res.status(404).json({
          path: req.path,
          message: "Nothing found here",
        });
        return;
      }

      const decl = declaration(context);

      res.status(200).json({
        path: req.path,
        description: context ? description(context) : undefined,
        map: context?.info().map((e) => ({
          path: e.condition.path,
          method: e.condition.method ?? "any",
          description: description(e.context),
        })),
        fields: context
          ? ((fields) =>
              Object.keys(fields).map((field) => ({
                name: field,
                value: fields[field],
              })))(fields(context))
          : undefined,
        declaration: decl,
      });
    });
  });
}
