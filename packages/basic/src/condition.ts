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

export type ConditionParseResult = {
  applies: boolean;
  parameters(): Record<string, string>;
  subRequest(req: Request): Request;
};

export abstract class ContextCondition {
  and(other: ContextCondition): ContextConditionAnd {
    return new ContextConditionAnd([this, other]);
  }
  chain(other: ContextCondition): ConditionChain {
    return new ConditionChain([this, other]);
  }

  /**
   * @deprecated Use `#parse().applies` instead (For performance reasons, as this method parses the request itself and subRequest again)
   * @param req Request to check
   * @returns Whether the condition applies to the request
   */
  appliesTo(req: Request): boolean {
    return this.parse(req).applies;
  }

  /**
   * @deprecated Use `#parse().parameters` instead (For performance reasons, as this method parses the request itself and appliesTo again)
   * @param req Request to check
   * @returns Parameters of the condition
   */
  subRequest(req: Request): Request {
    return this.parse(req).subRequest(req);
  }

  abstract parse(req: Request): ConditionParseResult;

  abstract info(): ConditionInfo;

  abstract toJson(): ContextConditionJson;
  abstract infoJson(): ContextConditionInfoJson;
  abstract equals(other: ContextCondition): boolean;
}

export class ContextConditionAnd extends ContextCondition {
  constructor(readonly conditions: ContextCondition[]) {
    super();
  }

  and(other: ContextCondition): ContextConditionAnd {
    return new ContextConditionAnd([...this.conditions, other]);
  }

  parse(req: Request): ConditionParseResult {
    const parsed = this.conditions.map((c) => c.parse(req));
    return {
      applies: parsed.every((c) => c.applies),
      subRequest: (req: Request) =>
        parsed.reduce((req, c) => c.subRequest(req), req),
      parameters: () =>
        parsed.reduce((params, c) => ({ ...params, ...c.parameters() }), {}),
    };
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

  parse(req: Request): ConditionParseResult {
    const params = parsePath(req.path, this.parsedPath);

    if (!params) {
      return {
        applies: false,
        parameters: () => {
          throw new Error("Condition does not apply");
        },
        subRequest: (req) => {
          throw new Error("Condition does not apply");
        },
      };
    }

    const subPath = params.$__SUBPATH;

    return {
      applies: true,
      parameters: () => params,
      subRequest: (req) => ({
        ...req,
        path: subPath,
      }),
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

  parse(req: Request): ConditionParseResult {
    const match = this.path.exec(req.path);

    if (!match) {
      return {
        applies: false,
        parameters: () => {
          throw new Error("Condition does not apply");
        },
        subRequest: (req) => {
          throw new Error("Condition does not apply");
        },
      };
    }

    const params = match.groups ?? {};

    return {
      applies: true,
      parameters: () => params,
      subRequest: (req) => ({
        ...req,
        path: req.path.slice(match[0].length),
      }),
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

  parse(req: Request): ConditionParseResult {
    if (req.method.toLowerCase() !== this.method.toLowerCase()) {
      return {
        applies: false,
        parameters: () => {
          throw new Error("Condition does not apply");
        },
        subRequest: (req) => {
          throw new Error("Condition does not apply");
        },
      };
    }

    return {
      applies: true,
      parameters: () => ({}),
      subRequest: (req) => req,
    };
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
