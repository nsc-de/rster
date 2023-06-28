import { Method, Request, Response } from "./common.js";
import { ConditionInfo, ContextCondition, ContextConditionMethod, ContextConditionPath, ContextConditionPath2 } from "./condition.js";
import { HttpError } from "./error.js";
import { RestfulApi } from "./index.js";


export type ContextTypeCondition = { type: "condition", condition: ContextCondition, context: Context };
export type ContextTypeUse = { type: "use", func: UseFunction };
export type ContextTypeAction = { type: "action", func: ActionFunction };
export type ContextType = ContextTypeCondition | ContextTypeUse | ContextTypeAction;
export class Context {
  private static _current: Context | undefined;

  static get current(): Context {
    if (!Context._current) throw new Error('No context');
    return Context._current;
  }

  private children: ContextType[] = [];
  private _data: { [key: string]: any } = {};

  constructor(
    protected _api: RestfulApi,
    public readonly condition?: ContextCondition | undefined,
    public readonly parent?: Context | undefined,
  ) { }

  public get api() {
    return this._api;
  }

  init(handler: ContextHandler): this {
    const current = Context._current;
    Context._current = this;
    handler(this);
    Context._current = current;
    return this;
  }

  when(condition: ContextCondition, handler: ContextHandler): this {
    this.children.push({ type: "condition", condition: condition, context: new Context(this.api, condition, this).init(handler) });
    return this;
  }

  describe(what: string, init: ContextHandler): this
  describe(what: RegExp, init: ContextHandler): this
  describe(what: string | RegExp, init: ContextHandler): this {
    if (typeof what === 'string') {
      return this.when(new ContextConditionPath(what), init);
    } else {
      return this.when(new ContextConditionPath2(what), init);
    }
  }

  any(what: string, nit: ContextHandler): this
  any(what: RegExp, init: ContextHandler): this
  any(what: string | RegExp, init: ContextHandler): this {
    //@ts-ignore
    return this.describe(what, init);
  }

  post(init: ContextHandler): Context;
  post(what: string, init: ContextHandler): Context;
  post(what: RegExp, init: ContextHandler): Context;
  post(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): this {

    if (typeof arg0 === 'string' && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('post').and(new ContextConditionPath(arg0)), arg1);
    if (arg0 instanceof RegExp && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('post').and(new ContextConditionPath2(arg0)), arg1);
    else if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod('post'), arg0);
    throw new Error('Invalid arguments');

  }

  get(init: ContextHandler): Context;
  get(what: string, init: ContextHandler): Context;
  get(what: RegExp, init: ContextHandler): Context;
  get(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): this {

    if (typeof arg0 === 'string' && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('get').and(new ContextConditionPath(arg0)), arg1);
    if (arg0 instanceof RegExp && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('get').and(new ContextConditionPath2(arg0)), arg1);
    else if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod('get'), arg0);
    throw new Error('Invalid arguments');

  }

  put(init: ContextHandler): Context;
  put(what: string, init: ContextHandler): Context;
  put(what: RegExp, init: ContextHandler): Context;
  put(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): this {

    if (typeof arg0 === 'string' && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('put').and(new ContextConditionPath(arg0)), arg1);
    if (arg0 instanceof RegExp && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('put').and(new ContextConditionPath2(arg0)), arg1);
    else if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod('put'), arg0);
    throw new Error('Invalid arguments');

  }

  patch(init: ContextHandler): Context;
  patch(what: string, init: ContextHandler): Context;
  patch(what: RegExp, init: ContextHandler): Context;
  patch(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): this {

    if (typeof arg0 === 'string' && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('patch').and(new ContextConditionPath(arg0)), arg1);
    if (arg0 instanceof RegExp && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('patch').and(new ContextConditionPath2(arg0)), arg1);
    else if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod('patch'), arg0);
    throw new Error('Invalid arguments');

  }

  delete(init: ContextHandler): Context;
  delete(what: string, init: ContextHandler): Context;
  delete(what: RegExp, init: ContextHandler): Context;
  delete(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): this {

    if (typeof arg0 === 'string' && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('delete').and(new ContextConditionPath(arg0)), arg1);
    if (arg0 instanceof RegExp && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('delete').and(new ContextConditionPath2(arg0)), arg1);
    else if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod('delete'), arg0);
    throw new Error('Invalid arguments');

  }

  options(init: ContextHandler): Context;
  options(what: string, init: ContextHandler): Context;
  options(what: RegExp, init: ContextHandler): Context;
  options(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): this {

    if (typeof arg0 === 'string' && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('options').and(new ContextConditionPath(arg0)), arg1);
    if (arg0 instanceof RegExp && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('options').and(new ContextConditionPath2(arg0)), arg1);
    else if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod('options'), arg0);
    throw new Error('Invalid arguments');

  }

  head(init: ContextHandler): Context;
  head(what: string, init: ContextHandler): Context;
  head(what: RegExp, init: ContextHandler): Context;
  head(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): this {

    if (typeof arg0 === 'string' && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('head').and(new ContextConditionPath(arg0)), arg1);
    if (arg0 instanceof RegExp && typeof arg1 === 'function')
      return this.when(new ContextConditionMethod('head').and(new ContextConditionPath2(arg0)), arg1);
    else if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod('head'), arg0);
    throw new Error('Invalid arguments');

  }

  action(fun: ActionFunction): this {
    this.children.push({ type: 'action', func: fun });
    return this;
  }

  use(fun: UseFunction): this {
    this.children.push({ type: 'use', func: fun });
    return this;
  }

  async contextStack(req: Request, res: Response): Promise<ContextType[][]> {
    let stack: ContextType[] = [];
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].type === "condition") {
        if (await (this.children[i] as ContextTypeCondition).condition.appliesTo(req)) {
          stack.push(this.children[i]);
          return [stack, ...await (this.children[i] as ContextTypeCondition).context.contextStack(req, res)];
        }
      }
      else if (this.children[i].type === "action") {
        stack.push(this.children[i]);
        return [stack];
      }
      else if (this.children[i].type === "use") {
        stack.push(this.children[i]);
      }
    }

    return [stack];
  }

  async execute(req: Request, res: Response): Promise<boolean> {
    try {
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].type === "condition") {
          const it = this.children[i] as ContextTypeCondition;
          const { condition, context } = it;
          if (await condition.appliesTo(req)) {
            if (await context.execute(condition.subRequest(req), res)) return true;
          }
        }
        else if (this.children[i].type === "action") {
          await (this.children[i] as ContextTypeAction).func(req, res);
          return true;
        }
        else if (this.children[i].type === "use") {
          let useNext = false;
          let error = undefined;
          const next = (err: any) => {
            useNext = true; error = err;
          };
          await (this.children[i] as ContextTypeUse).func(req, res, next);

          if (error === true) return true;
          if (error) throw error;
          if (!useNext) {
            return true;
          }
        }
      }

    } catch (e) {
      if (e instanceof HttpError) {
        res.status(e.status).json({ error: e.message });
      } else
        console.error(e);
      res.status(500).json({ error: "Internal server error" });
      return true;
    }

    return false;
  }

  data(): { [key: string]: any };
  data(key: string): any;
  data(arg0?: string): any {
    if (typeof arg0 == "undefined") return this._data;
    if (typeof arg0 == "string") return this._data[arg0];
  }

  setData(key: string, value: any): this {
    this._data[key] = value;
    return this;
  }

  get map(): any {
    return this.children.filter(c => c.type === 'condition').map(
      // @ts-ignore
      (c: ContextTypeCondition) => {
        return {
          condition: c.condition.toJson(),
          context: c.context.map
        }
      })
  }

  info(): { context: Context, condition: ConditionInfo }[] {
    return this.children.filter(c => c.type === 'condition').flatMap(
      // @ts-ignore
      (c: ContextTypeCondition) => {
        const children = c.context.info();
        const info = c.condition.info();
        return [
          {
            context: c.context,
            condition: info
          },
          ...children.flatMap(f => ({
            context: f.context,
            condition: {
              method: info.method ?? f.condition.method,
              path: (info.path ?? "") + (f.condition.path ?? ""),
            }
          }))];
      }
    );
  }

  get flatMap(): any {
    return this.children.filter(c => c.type === 'condition').map(
      // @ts-ignore
      (c: ContextTypeCondition) => {
        return {
          condition: c.condition.toJson(),
          context: c.context
        }
      })
  }

  toJson(): any {
    return {
      children: this.children.map(c => {
        if (c.type === 'condition') return { type: 'condition', condition: (c as ContextTypeCondition).condition.toJson(), context: (c as ContextTypeCondition).context.toJson() }
        else if (c.type === 'action') return { type: 'action' }
        else if (c.type === 'use') return { type: 'use' }
      }),
    };
  }

  collect() {
    const map: Context[] = (this.children.filter(c => c.type === 'condition') as ContextTypeCondition[]).flatMap(e => e.context.collect());
    map.push(this);
    return map;
  }

  getPath(): string {
    const info = this.condition?.info();
    return (this.parent?.getPath() ?? "") + (info?.path ?? "");
  }

  getMethod(): Method | 'any' {
    const info = this.condition?.info();
    return info?.method ?? this.parent?.getMethod() ?? 'any';
  }
}

export function when(condition: ContextCondition, init: ContextHandler): Context {
  // @ts-ignore
  return Context.current.when(condition, init);
}

export function describe(what: string, init: ContextHandler): Context;
export function describe(what: RegExp, init: ContextHandler): Context;
export function describe(what: string | RegExp, init: ContextHandler): Context {
  // @ts-ignore
  return Context.current.describe(what, init);
}

export function any(what: string, init: ContextHandler): Context;
export function any(what: RegExp, init: ContextHandler): Context;
export function any(what: string | RegExp, init: ContextHandler): Context {
  // @ts-ignore
  return Context.current.any(what, init);
}

export function post(init: ContextHandler): Context;
export function post(what: string, init: ContextHandler): Context;
export function post(what: RegExp, init: ContextHandler): Context;
export function post(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): Context {
  // @ts-ignore
  return Context.current.post(arg0, arg1);
}

export function get(init: ContextHandler): Context;

export function get(what: string, init: ContextHandler): Context;
export function get(what: RegExp, init: ContextHandler): Context;
export function get(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): Context {
  // @ts-ignore
  return Context.current.get(arg0, arg1);
}

export function put(init: ContextHandler): Context;
export function put(what: string, init: ContextHandler): Context;
export function put(what: RegExp, init: ContextHandler): Context;
export function put(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): Context {
  // @ts-ignore
  return Context.current.put(arg0, arg1);
}

export function patch(init: ContextHandler): Context;
export function patch(what: string, init: ContextHandler): Context;
export function patch(what: RegExp, init: ContextHandler): Context;
export function patch(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): Context {
  // @ts-ignore
  return Context.current.patch(arg0, arg1);
}

export function delete_(init: ContextHandler): Context;
export function delete_(what: string, init: ContextHandler): Context;
export function delete_(what: RegExp, init: ContextHandler): Context;
export function delete_(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): Context {
  // @ts-ignore
  return Context.current.delete(arg0, arg1);
}

export function options(init: ContextHandler): Context;
export function options(what: string, init: ContextHandler): Context;
export function options(what: RegExp, init: ContextHandler): Context;
export function options(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): Context {
  // @ts-ignore
  return Context.current.options(arg0, arg1);
}

export function head(init: ContextHandler): Context;
export function head(what: string, init: ContextHandler): Context;
export function head(what: RegExp, init: ContextHandler): Context;
export function head(arg0: string | RegExp | ContextHandler, arg1?: ContextHandler): Context {
  // @ts-ignore
  return Context.current.head(arg0, arg1);
}

export function action(fun: ActionFunction): Context {
  // @ts-ignore
  return Context.current.action(fun);
}

export function use(fun: UseFunction): Context {
  // @ts-ignore
  return Context.current.use(fun);
}

export function data(): { [key: string]: any };
export function data(identifier: string): any;
export function data(identifier?: string): any {
  // @ts-ignore
  return Context.current.data(identifier);
}

export function setData(identifier: string, value: any) {
  return Context.current.setData(identifier, value);
}


export type ContextHandler = (context: Context) => any | Promise<any>;
export type ActionFunction = (req: Request, res: Response) => any | Promise<any>;
export type UseFunction = (req: Request, res: Response, next: NextFunction) => any | Promise<any>;
export type NextFunction = (err?: any) => void;

