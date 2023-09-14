// import { declaration } from "../generator/index";
import { $404, Context, ContextChildCondition } from "@rster/basic";
import { TypeInformation } from "@rster/types";

const version = "0.1.4";

export interface Declaration {
  name: string;
  expectBody?: {
    [key: string]: { type: TypeInformation<unknown>; required: boolean };
  };
  expectQuery?: {
    [key: string]: { type: TypeInformation<unknown>; required: boolean };
  };
  expectParams?: {
    [key: string]: { type: TypeInformation<unknown>; required: boolean };
  };
  returnBody: TypeInformation<unknown>;
}

declare module "@rster/basic" {
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

    declaration(): Declaration;
    declaration(decl: Declaration): Context;
    declaration(context: Context): Declaration | undefined;
    declaration(context: Context, decl: Declaration): Context;
    declaration(
      context?: Context | Declaration,
      decl?: Declaration
    ): Context | Declaration | undefined | string[];

    hasDeclaration(): boolean;
    hasDeclaration(context: Context): boolean;
    hasDeclaration(context?: Context): boolean;

    collectDeclarations(
      ctx?: Context
    ): { declaration: Declaration; ctx: Context }[];
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

    this.field("version", version);

    this.use(async (req, res, _next) => {
      const stack = await ctx.api.contextStack(req, res);
      let context = (
        stack[stack.length - 2]?.filter(
          // TODO: stack[stack.length - 1] normally should be the action / use function. But it could be a condition. If it is a condition, the context is useless as it does nothing. How to handle this?
          // TODO: Generally think about criteria what context to choose if multiple routes match which should theoretically be possible
          (e) => e.type === "condition"
        )[0] as ContextChildCondition
      )?.context as Context;

      if (req.path == "/" || req.path == "") {
        context = ctx.api;
      }

      if (
        !context ||
        (req.path !== context?.getPath() &&
          req.path !== context?.getPath() + "/")
      ) {
        throw $404(`No context found for path "${req.path}"`);
      }

      const decl = context.declaration();

      res
        .status(200)
        .json({
          path: context.getPath(),
          method: context.getMethod(),
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

Context.prototype.declaration = function (
  context?: Context | Declaration,
  decl?: Declaration
) {
  if (typeof context === "undefined") return this.data("@info/declaration");

  if (typeof context === "object" && context instanceof Context) {
    if (typeof decl === "undefined") {
      return context.data("@info/declaration");
    }

    if (typeof decl !== "object") throw new Error("Invalid arguments");
    this.setData("@info/declaration", decl);
    return context;
  }

  if (typeof context === "object") {
    this.setData("@info/declaration", context);
    return this;
  }

  throw new Error("Invalid arguments");
};

Context.prototype.hasDeclaration = function (context?: Context): boolean {
  if (typeof context === "undefined")
    return typeof this.data("@info/declaration") !== "undefined";

  return typeof context.data("@info/declaration") !== "undefined";
};

Context.prototype.collectDeclarations = function (
  ctx?: Context
): { declaration: Declaration; ctx: Context }[] {
  ctx = ctx ?? this;
  const contexts = ctx.collect();
  return contexts
    .map((c) => ({ declaration: this.declaration(c), ctx: c }))
    .filter((d) => !!d.declaration) as {
    declaration: Declaration;
    ctx: Context;
  }[];
};
