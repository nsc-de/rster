import { Method, Request } from "@rster/common";

export type ContextConditionJson =
  | { type: "and"; conditions: ContextConditionJson[] }
  | { type: "path"; path: string }
  | { type: "path2"; path: string; flags: string }
  | { type: "method"; method: Method };

export type ContextConditionInfoJson = {
  path?: string;
  path2?: string;
  method?: Method;
};

export abstract class ContextCondition {
  abstract appliesTo(req: Request): boolean;
  and(other: ContextCondition): ContextConditionAnd {
    return new ContextConditionAnd([this, other]);
  }
  chain(other: ContextCondition): ConditionChain {
    return new ConditionChain([this, other]);
  }

  subRequest(req: Request): Request {
    return req;
  }

  abstract info(): ConditionInfo;

  abstract toJson(): ContextConditionJson;
  abstract infoJson(): ContextConditionInfoJson;
  abstract equals(other: ContextCondition): boolean;
}

export class ContextConditionAnd extends ContextCondition {
  constructor(readonly conditions: ContextCondition[]) {
    super();
  }

  appliesTo(req: Request): boolean {
    return this.conditions.every((c) => c.appliesTo(req));
  }

  and(other: ContextCondition): ContextConditionAnd {
    return new ContextConditionAnd([...this.conditions, other]);
  }

  subRequest(req: Request): Request {
    return this.conditions.reduce((req, c) => c.subRequest(req), req);
  }

  info(): ConditionInfo {
    return this.conditions
      .map((c) => c.info())
      .reduce((a, b) => ({ ...a, ...b }));
  }

  toJson(): ContextConditionJson {
    return {
      type: "and",
      conditions: this.conditions.map((c) => c.toJson()),
    };
  }

  infoJson(): ContextConditionInfoJson {
    let it = {};

    for (const c of this.conditions) {
      it = { ...it, ...c.infoJson() };
    }

    return it;
  }

  equals(other: ContextCondition): boolean {
    // TODO: Add checking if conditions are equal but in different order
    if (!(other instanceof ContextConditionAnd)) {
      return false;
    }

    if (this.conditions.length !== other.conditions.length) {
      return false;
    }

    for (let i = 0; i < this.conditions.length; i++) {
      if (!this.conditions[i].equals(other.conditions[i])) {
        return false;
      }
    }

    return true;
  }
}

type ParsedPathDescriptorPathEntry = { type: "path"; path: string };
type ParsedPathDescriptorParamEntry = { type: "param"; name: string };
type ParsedPathDescriptor = (
  | ParsedPathDescriptorPathEntry
  | ParsedPathDescriptorParamEntry
)[];

function parsePathDescriptor(str: string): ParsedPathDescriptor {
  const parts = str.matchAll(/((?<url>[^:]*)(:(?<param>[\w-]+))?)/g);
  const result: ParsedPathDescriptor = [];
  for (const part of parts) {
    if (part.length === 0) continue;

    const url = part.groups?.url;
    const param_name = part.groups?.param;

    if (url) result.push({ type: "path", path: url });
    if (param_name) result.push({ type: "param", name: param_name });
  }

  return result;
}

function parsePath(
  path: string,
  descriptor: ParsedPathDescriptor
): (Record<string, string> & { $__SUBPATH: string }) | false {
  const params: Record<string, string> = {};
  const descriptor_copy = [...descriptor];

  while (descriptor_copy.length > 0) {
    const entry = descriptor_copy.shift();

    if (!entry) {
      throw new Error("Unexpected end of descriptor");
    }

    if (entry.type === "path") {
      if (!path.startsWith(entry.path)) {
        return false;
      }
      path = path.slice(entry.path.length);
      continue;
    }

    if (entry.type === "param") {
      // match start of path while matching \w- characters
      const match = /^([\w-]+)/.exec(path)?.[0] ?? "";
      params[entry.name] = match;
      path = path.slice(match.length);
      continue;
    }

    throw new Error("Unexpected entry type");
  }

  return { ...params, $__SUBPATH: path };
}

export class ContextConditionPath extends ContextCondition {
  readonly parsedPath: ParsedPathDescriptor;
  constructor(readonly path: string) {
    super();
    this.parsedPath = parsePathDescriptor(path);
  }

  appliesTo(req: Request): boolean {
    return parsePath(req.path, this.parsedPath) !== false;
  }

  subRequest(req: Request): Request {
    const path = parsePath(req.path, this.parsedPath);
    if (!path) {
      throw new Error("Path does not match");
    }
    return {
      ...req,
      path: path.$__SUBPATH,
    };
  }

  toJson(): ContextConditionJson {
    return {
      type: "path",
      path: this.path,
    };
  }

  info(): ConditionInfo {
    return {
      path: this.path,
    };
  }

  infoJson(): ContextConditionInfoJson {
    return {
      path: this.path,
    };
  }

  equals(other: ContextCondition): boolean {
    if (!(other instanceof ContextConditionPath)) {
      return false;
    }

    return this.path === other.path;
  }
}

export class ContextConditionPath2 extends ContextCondition {
  constructor(readonly path: RegExp) {
    super();
  }

  appliesTo(req: Request): boolean {
    return startsWithRegex(req.path, this.path);
  }

  subRequest(req: Request): Request {
    return {
      ...req,
      path: req.path.replace(this.path, ""),
    };
  }

  info(): ConditionInfo {
    return {
      path: `[${this.path.source}]`,
    };
  }

  toJson(): ContextConditionJson {
    return {
      type: "path2",
      path: this.path.source,
      flags: this.path.flags,
    };
  }

  infoJson(): ContextConditionInfoJson {
    return {
      path2: this.path.source,
    };
  }

  equals(other: ContextCondition): boolean {
    if (!(other instanceof ContextConditionPath2)) {
      return false;
    }

    return this.path.source === other.path.source;
  }
}

export class ContextConditionMethod extends ContextCondition {
  constructor(readonly method: Method) {
    super();
  }

  appliesTo(req: Request): boolean {
    return req.method.toLowerCase() === this.method.toLocaleLowerCase();
  }

  toJson(): ContextConditionJson {
    return {
      type: "method",
      method: this.method,
    };
  }

  info(): ConditionInfo {
    return {
      method: this.method,
    };
  }

  infoJson(): ContextConditionInfoJson {
    return {
      method: this.method,
    };
  }

  equals(other: ContextCondition): boolean {
    if (!(other instanceof ContextConditionMethod)) {
      return false;
    }

    return this.method === other.method;
  }
}

export class ConditionChain {
  constructor(readonly conditions: ContextCondition[]) {}

  appliesTo(req: Request): boolean {
    for (const c of this.conditions) {
      if (!c.appliesTo(req)) {
        return false;
      }
      req = c.subRequest(req);
    }
    return true;
  }

  toJson() {
    return {
      type: "chain",
      conditions: this.conditions.map((c) => c.toJson()),
    };
  }
}

function startsWithRegex(str: string, regex: RegExp) {
  const regexFlags = regex.flags;
  const regexPattern = regex.source;
  const patternRegExp = new RegExp(`^${regexPattern}`, regexFlags);
  return patternRegExp.test(str);
}

export interface ConditionInfo {
  method?: Method;
  path?: string;
}
