import { Method, Request } from "@rster/common";

/**
 * JSON representation of {@link ContextConditionAnd}
 */
export type ContextConditionAndJson = {
  /**
   * Type of the condition (always "and" for {@link ContextConditionAnd})
   */
  type: "and";

  /**
   * Conditions that are chained together
   * @example [{ type: "path", path: "/api/:id" }, { type: "method", method: "GET" }]
   */
  conditions: ContextConditionJson[];
};

/**
 * JSON representation of {@link ContextConditionPath}
 */
export type ContextConditionPathJson = {
  /**
   * Type of the condition (always "path" for {@link ContextConditionPath})
   */
  type: "path";

  /**
   * Path that is matched
   * @example "/api/:id"
   */
  path: string;
};

/**
 * JSON representation of {@link ContextConditionPath2} (RegExp path)
 * @example { type: "path2", path: "/api/([\\w-]+)", flags: "i" }
 * @example { type: "path2", path: "/api/([\\w-]+)" }
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp}
 */
export type ContextConditionPath2Json = {
  /**
   * Type of the condition (always "path2" for {@link ContextConditionPath2})
   */
  type: "path2";

  /**
   * RegExp path that is matched
   * @example "/api/([\\w-]+)"
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp}
   */
  path: string;

  /**
   * RegExp flags
   * @example "i"
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp}
   */
  flags: string;
};

/**
 * JSON representation of {@link ContextConditionMethod}
 *
 * @example { type: "method", method: "GET" }
 * @example { type: "method", method: "POST" }
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 * @see {@link import("@rster/common").Method} {@link https://nsc-de.github.io/rster/docs/api-reference/common/modules#method}
 */
export type ContextConditionMethodJson = { type: "method"; method: Method };

/**
 * JSON representation of a {@link ContextCondition} (one of {@link ContextConditionAndJson}, {@link ContextConditionPathJson}, {@link ContextConditionPath2Json}, {@link ContextConditionMethodJson})
 */
export type ContextConditionJson =
  | ContextConditionAndJson
  | ContextConditionPathJson
  | ContextConditionPath2Json
  | ContextConditionMethodJson;

/**
 * JSON representation of {@link ContextCondition}'s info (for collecting info about conditions and squashing them together)
 * @example { path: "/api/:id", method: "GET" }
 * @example { path2: "/api/([\\w-]+)", method: "GET" }
 */
export type ContextConditionInfoJson = {
  /**
   * Path that is matched
   * @example "/api/:id"
   */
  path?: string;

  /**
   * RegExp path that is matched
   * @example "/api/([\\w-]+)"
   */
  path2?: string;

  /**
   * Method that is matched
   * @example "GET"
   */
  method?: Method;
};

/**
 * Result of {@link ContextCondition#parse} (used for {@link ContextCondition#appliesTo} and {@link ContextCondition#subRequest})
 * Parses the condition, checks if it applies to a request and returns all this information (to avoid double parsing)
 * @example { applies: true, parameters: () => ({ id: "123" }), subRequest: (req) => ({ ...req, path: "/api", params: { id: "123" } }) }
 */
export type ConditionParseResult = {
  /**
   * Whether the condition applies to the request
   */
  applies: boolean;

  /**
   * Parameters of the condition (if it applies)
   * @example { id: "123" }
   */
  parameters(): Record<string, string>;

  /**
   * SubRequest of the condition (if it applies) (used for routing and sub-routing)
   * @example { method: "GET", path: "/api", params: { id: "123" } }
   */
  subRequest(req: Request): Request;
};

/**
 * Condition for {@link Context} used for routing and sub-routing
 */
export abstract class ContextCondition {
  /**
   * Chain this condition with another condition
   *
   * @param other Condition to chain with
   * @returns New condition that applies if both conditions apply
   */
  and(other: ContextCondition): ContextConditionAnd {
    return new ContextConditionAnd([this, other]);
  }

  /**
   * Chain this condition with another condition  (used for sub-routing)
   */
  chain(other: ContextCondition): ConditionChain {
    return new ConditionChain([this, other]);
  }

  /**
   * Check if the condition applies to a request (used for routing) (parses the request itself, so use {@link ContextCondition#parse} for performance reasons)
   *
   * @deprecated Use `#parse().applies` instead (For performance reasons, as this method parses the request itself and subRequest again)
   * @param req Request to check
   * @returns Whether the condition applies to the request
   *
   * @see {@link ContextCondition#parse}
   * @see {@link ConditionParseResult#applies}
   */
  appliesTo(req: Request): boolean {
    console.warn(
      "ContextCondition#appliesTo is deprecated, use ContextCondition#parse().applies for performance reasons instead. appliesTo parses the request itself, so you will potentially parse the request twice."
    );
    return this.parse(req).applies;
  }

  /**
   * Check if the condition applies to a request (used for routing) (parses the request itself, so use {@link ContextCondition#parse} for performance reasons)
   *
   * @deprecated Use `#parse().parameters` instead (For performance reasons, as this method parses the request itself and appliesTo again)
   * @param req Request to check
   * @returns Parameters of the condition
   *
   * @see {@link ContextCondition#parse}
   * @see {@link ConditionParseResult#subRequest}
   */
  subRequest(req: Request): Request {
    return this.parse(req).subRequest(req);
  }

  /**
   * Parse the condition (used for routing and sub-routing)
   * @param req Request to parse
   * @returns Result of the parsing
   *
   * @example
   * ```ts
   * const condition = new ContextConditionPath("/api/:id");
   * const result = condition.parse({ method: "GET", path: "/api/123", params: {} });
   *
   * result.applies // true
   * result.parameters() // { id: "123" }
   * result.subRequest({ method: "GET", path: "/api/123", params: {} }) // { method: "GET", path: "", params: { id: "123" } }
   * ```
   *
   * @see {@link ConditionParseResult}
   */
  abstract parse(req: Request): ConditionParseResult;

  /**
   * Get info about the condition (used for collecting info about conditions and squashing them together)
   *
   * @example
   * ```ts
   * const condition = new ContextConditionPath("/api/:id");
   * const info = condition.info(); // { path: "/api/:id" , method: undefined, path2: undefined }
   * ```
   *
   * @example
   * ```ts
   * const condition = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   * const info = condition.info(); // { path: "/api/:id" , method: "GET", path2: undefined }
   * ```
   *
   * @see {@link ContextCondition#infoJson}
   */
  abstract info(): ConditionInfo;

  /**
   * Get info about the condition (used for collecting info about conditions and squashing them together)
   *
   * @example
   * ```ts
   * const condition = new ContextConditionPath("/api/:id");
   * const info = condition.toJson(); // { type: "path", path: "/api/:id" }
   * ```
   *
   * @see {@link ContextConditionJson}
   */
  abstract toJson(): ContextConditionJson;

  /**
   * Get info about the condition (used for collecting info about conditions and squashing them together)
   * @example
   * ```ts
   * const condition = new ContextConditionPath("/api/:id");
   * const info = condition.infoJson(); // { path: "/api/:id" , method: undefined, path2: undefined }
   * ```
   */
  abstract infoJson(): ContextConditionInfoJson;

  /**
   * Check if the condition is equal to another condition
   * @param other Condition to check
   * @returns Whether the conditions are equal
   * @example
   * ```ts
   * const condition = new ContextConditionPath("/api/:id");
   * const other = new ContextConditionPath("/api/:id");
   * const other2 = new ContextConditionPath("/api/:id2");
   *
   * condition.equals(other) // true
   * condition.equals(other2) // false
   * ```
   */
  abstract equals(other: ContextCondition): boolean;
}

/**
 * Condition that applies if all conditions apply
 * @example
 * ```ts
 * const condition = new ContextConditionAnd([
 *   new ContextConditionPath("/api/:id"),
 *   new ContextConditionMethod("GET"),
 * ]);
 *
 * @see {@link ContextCondition}
 * @see {@link ContextConditionAndJson}
 */
export class ContextConditionAnd extends ContextCondition {
  /**
   * Create a new condition that applies if all conditions apply
   * @param conditions The conditions that are chained together
   */
  constructor(
    /**
     * Conditions that are chained together
     */
    readonly conditions: ContextCondition[]
  ) {
    super();
  }

  /**
   * Chain this condition with another condition
   * @param other The condition to chain with
   * @returns The new condition that applies if both conditions apply
   *
   * @example
   * ```ts
   * const condition = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   *
   * const other = new ContextConditionPath("/api/:id2");
   * const newCondition = condition.and(other);
   * ```
   */
  and(other: ContextCondition): ContextConditionAnd {
    return new ContextConditionAnd([...this.conditions, other]);
  }

  /**
   * Parse the condition (used for routing and sub-routing)
   * @param req The request to parse
   * @returns The result of the parsing
   *
   * @example
   * ```ts
   * const condition = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   * const result = condition.parse({ method: "GET", path: "/api/123", params: {} });
   * result.applies // true
   * result.parameters() // { id: "123" }
   * result.subRequest({ method: "GET", path: "/api/123", params: {} }) // { method: "GET", path: "", params: { id: "123" } }
   * ```
   * @see {@link ConditionParseResult}
   */
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

  /**
   * Get info about the condition (used for collecting info about conditions and squashing them together)
   * @returns Info about the condition (used for collecting info about conditions and squashing them together)
   *
   * @example
   * ```ts
   * const condition = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   * const info = condition.info(); // { path: "/api/:id" , method: "GET", path2: undefined }
   * ```
   *
   * @see {@link ContextCondition#infoJson}
   */
  info(): ConditionInfo {
    return this.conditions
      .map((c) => c.info())
      .reduce((a, b) => ({ ...a, ...b }));
  }

  /**
   * Get JSON representation of the condition (used for collecting info about conditions and squashing them together)
   * @returns JSON representation of the condition (used for collecting info about conditions and squashing them together)
   *
   * @example
   * ```ts
   * const condition = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   *
   * const json = condition.toJson(); // { type: "and", conditions: [{ type: "path", path: "/api/:id" }, { type: "method", method: "GET" }] }
   * ```
   *
   * @see {@link ContextConditionAndJson}
   * @see {@link ContextConditionJson}
   */
  toJson(): ContextConditionJson {
    return {
      type: "and",
      conditions: this.conditions.map((c) => c.toJson()),
    };
  }

  /**
   * Get info about the condition (used for collecting info about conditions and squashing them together)
   * @returns Info about the condition (used for collecting info about conditions and squashing them together)
   * @example
   * ```ts
   * const condition = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   * const info = condition.infoJson(); // { path: "/api/:id" , method: "GET", path2: undefined }
   * ```
   * @see {@link ContextCondition#info}
   * @see {@link ContextConditionInfoJson}
   */
  infoJson(): ContextConditionInfoJson {
    let it = {};

    for (const c of this.conditions) {
      it = { ...it, ...c.infoJson() };
    }

    return it;
  }

  /**
   * Check if the condition is equal to another condition
   * @param other Condition to check
   * @returns Whether the conditions are equal
   * @example
   * ```ts
   * const condition = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   *
   * const other = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("GET"),
   * ]);
   *
   * const other2 = new ContextConditionAnd([
   *   new ContextConditionPath("/api/:id"),
   *   new ContextConditionMethod("POST"),
   * ]);
   *
   * condition.equals(other) // true
   * condition.equals(other2) // false
   * ```
   * @see {@link ContextCondition#equals}
   */
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

function parsedPathToRegExp(parsed: ParsedPathDescriptor): RegExp {
  const regexp = parsed
    .map((entry) => {
      if (entry.type === "path")
        return entry.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (entry.type === "param") return `(?<${entry.name}>[\\w-]+)`;
      throw new Error("Unexpected entry type");
    })
    .join("");

  return new RegExp(`^${regexp}`, "i");
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
        subRequest: () => {
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
        params: { ...(req.params ?? {}), ...params },
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

    if (!match || match.index !== 0) {
      return {
        applies: false,
        parameters: () => {
          throw new Error("Condition does not apply");
        },
        subRequest: () => {
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
        params: { ...(req.params ?? {}), ...params },
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
        subRequest: () => {
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

export interface ConditionInfo {
  method?: Method;
  path?: string;
}
