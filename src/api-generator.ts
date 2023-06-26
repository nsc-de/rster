import { Context, ContextTypeCondition, any, data, setData, use } from "./context.js";

export class StringValue {
  constructor(public value: string) { }
}

export class NumberValue {
  constructor(public value: number) { }
}

export class NumberRange {
  constructor(public min: number, public max: number) { }
  includes(value: number) {
    return value >= this.min && value <= this.max;
  }
}


export class Or<T> {
  constructor(public values: T[]) { }
}
export class Object {
  constructor(public properties: { [key: string]: Value }) { }
};
export class Array {
  minItems?: number;
  maxItems?: number;
  constructor(public values: Value[], {
    minItems,
    maxItems,
  }: {
    minItems?: number,
    maxItems?: number,
  }) {
    this.minItems = minItems;
    this.maxItems = maxItems;
  }
}

class BooleanValue {
  constructor(public value: boolean) { }
}

class NullValue {
  constructor() { }
}

class AnyStringValue {
  constructor() { }
}

class AnyNumberValue {
  constructor() { }
}

class AnyValue {
  constructor() { }
}

export type Value = Object | Array | Or<any> | StringValue | NumberValue | NumberRange | BooleanValue | NullValue | AnyStringValue | AnyNumberValue | AnyValue;

export function object(properties: { [key: string]: Value }): Object {
  return new Object(properties);
}

export interface Declaration {
  expectBody?: Value;
  expectQuery?: { [key: string]: Value };
  expectParams?: { [key: string]: Value };
  expectHeaders?: { [key: string]: Value };

}

export function declaration(): Declaration;
export function declaration(decl: Declaration): Context;
export function declaration(context: Context): Declaration | undefined;
export function declaration(context: Context, decl: Declaration): Context;
export function declaration(context?: Context | Declaration, decl?: Declaration): Context | Declaration | undefined | string[] {
  if (typeof context === "undefined")
    return data("@info/declaration");

  if (typeof context === "object" && context instanceof Context) {
    if (typeof decl === "undefined") {
      return context.data("@info/declaration");
    }
    setData("@info/declaration", decl);
    return context;
  }

  if (typeof context === "object") {
    setData("@info/declaration", context);
    return Context.current;
  }

  throw new Error("Invalid arguments");
}

export function hasDeclaration(): boolean;
export function hasDeclaration(context: Context): boolean;
export function hasDeclaration(context?: Context): boolean {
  if (typeof context === "undefined")
    return typeof data("@info/declaration") !== "undefined";

  return typeof context.data("@info/declaration") !== "undefined";
}


// export function useInfo(options?: { path?: string }) {
//   options = options ?? {};
//   const path = options.path ?? "/info";

//   any(path, async (ctx) => {

//     description("This module can be used to get information about the API");
//     description("Just call /info/[path] to get information about this module");

//     field("version", "0.1.0");

//     use(async (req, res, next) => {

//       const stack = await ctx.api.contextStack(req, res);
//       let context = (stack[stack.length - 2]?.filter(e => e.type === "condition")[0] as ContextTypeCondition)?.context;

//       if (req.path == "/") {
//         context = ctx.api;
//       }


//       if (!context) {
//         res.status(404).json({
//           path: req.path,
//           message: "Nothing found here"
//         })
//         return;
//       }

//       res.status(200).json({
//         path: req.path,
//         description: context ? description(context) : undefined,
//         map: context?.info().map(e => ({
//           path: e.condition.path,
//           method: e.condition.method ?? "any",
//           description: description(e.context),
//         })),
//         fields: context ? ((fields) => Object.keys(fields).map(field => ({ name: field, value: fields[field] })))(fields(context)) : undefined,
//       });

//     });
//   });
// }