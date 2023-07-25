import { TypeInformation } from "../../shared/types";
import { Context, data, setData } from "../context";

export interface Declaration {
  name: string;
  expectBody?: { [key: string]: { type: TypeInformation; optional: boolean } };
  expectQuery?: { [key: string]: { type: TypeInformation; optional: boolean } };
  expectParams?: {
    [key: string]: { type: TypeInformation; optional: boolean };
  };
  returnBody: TypeInformation;
}

export function declaration(): Declaration;
export function declaration(decl: Declaration): Context;
export function declaration(context: Context): Declaration | undefined;
export function declaration(context: Context, decl: Declaration): Context;
export function declaration(
  context?: Context | Declaration,
  decl?: Declaration
): Context | Declaration | undefined | string[] {
  if (typeof context === "undefined") return data("@info/declaration");

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

export function collectDeclarations(
  ctx: Context
): { declaration: Declaration; ctx: Context }[] {
  const contexts = ctx.collect();
  return contexts
    .map((c) => ({ declaration: declaration(c), ctx: c }))
    .filter((d) => !!d.declaration) as {
    declaration: Declaration;
    ctx: Context;
  }[];
}

export function requireAuthentication(): void;
export function requireAuthentication(context: Context): void;
export function requireAuthentication(context?: Context): void {
  if (typeof context === "undefined") context = Context.current;

  if (typeof context === "undefined") throw new Error("No context");

  context.setData("@info/requireAuthentication", true);
}

export function requiresAuthentication(): boolean;
export function requiresAuthentication(context: Context): boolean;
export function requiresAuthentication(context?: Context): boolean {
  if (typeof context === "undefined") context = Context.current;

  if (typeof context === "undefined") throw new Error("No context");

  return !!context.data("@info/requireAuthentication");
}
