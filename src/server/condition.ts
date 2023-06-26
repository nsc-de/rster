import { Method, Request } from "./common.js";

export abstract class ContextCondition {
  abstract appliesTo(req: Request): boolean;
  and(other: ContextCondition): ContextCondition {
    return new ContextConditionAnd([this, other]);
  }
  chain(other: ContextCondition): ConditionChain {
    return new ConditionChain([this, other]);
  }

  subRequest(req: Request): Request {
    return req;
  }

  abstract info(): ConditionInfo


  abstract toJson(): any;

}

export class ContextConditionAnd extends ContextCondition {
  constructor(
    readonly conditions: ContextCondition[],
  ) {
    super();
  }

  appliesTo(req: Request): boolean {
    return this.conditions.every(c => c.appliesTo(req));
  }

  and(other: ContextCondition): ContextCondition {
    return new ContextConditionAnd([...this.conditions, other]);
  }

  subRequest(req: Request): Request {
    return this.conditions.reduce((req, c) => c.subRequest(req), req);
  }

  info(): ConditionInfo {
    return this.conditions.map(c => c.info()).reduce((a, b) => ({ ...a, ...b }));
  }

  toJson(): any {
    return {
      type: "and",
      conditions: this.conditions.map(c => c.toJson()),
    };
  }
}

export class ContextConditionPath extends ContextCondition {
  constructor(
    readonly path: string,
  ) {
    super();
  }

  appliesTo(req: Request): boolean {
    return req.path.startsWith(this.path);
  }

  subRequest(req: Request): Request {
    return {
      ...req,
      path: req.path.slice(this.path.length),
    };
  }

  toJson(): any {
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
}

export class ContextConditionPath2 extends ContextCondition {
  constructor(
    readonly path: RegExp,
  ) {
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

  toJson(): any {
    return {
      type: "path2",
      path: this.path.source,
      flags: this.path.flags,
    };
  }
}

export class ContextConditionMethod extends ContextCondition {
  constructor(
    readonly method: Method,
  ) {
    super();
  }

  appliesTo(req: Request): boolean {
    return req.method.toLowerCase() === this.method.toLocaleLowerCase();
  }

  toJson(): any {
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
}

export class ConditionChain {
  constructor(
    readonly conditions: ContextCondition[],
  ) { }

  appliesTo(req: Request): boolean {
    for (const c of this.conditions) {
      if (!c.appliesTo(req)) {
        return false;
      }
      req = c.subRequest(req);
    }
    return true;
  }

  toJson(): any {
    return {
      type: "chain",
      conditions: this.conditions.map(c => c.toJson()),
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