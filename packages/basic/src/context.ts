/**
 * @fileOverview Context class and types / functions related to it
 * The context class is used to describe a route. Context can be nested using {@link ContextChildCondition} as children (generated using the when function).
 */
import { Method, Request, Response } from "@rster/common";
import debug from "debug";
import {
  ConditionInfo,
  ContextCondition,
  ContextConditionJson,
  ContextConditionMethod,
  ContextConditionPath,
  ContextConditionPath2,
} from "./condition";
import { RestfulApi } from "./index";

const debugRoutePath = debug("rster:router:path");
const debugRouteUse = debug("rster:router:use");

function toInitializer(
  func: ActionFunction | ContextInitializer
): ContextInitializer {
  if (func.length == 2) {
    return function (ctx: Context) {
      ctx.action(func as ActionFunction);
    };
  } else {
    return func as ContextInitializer;
  }
}

export type ContextJson = {
  children: (
    | {
        type: "condition";
        condition: ContextConditionJson;
        context: ContextJson;
      }
    | {
        type: "use";
      }
    | {
        type: "action";
      }
  )[];
};

/**
 * Context child for containing a context and a condition (for nested routing)
 */
export interface ContextChildCondition {
  /**
   * Type of the child. Always "condition" for {@link ContextChildCondition}
   */
  readonly type: "condition";

  /**
   * Condition of the child
   */
  readonly condition: ContextCondition;

  /**
   * Context of the child
   */
  readonly context: Context;
}

/**
 * Context child for containing a use function
 */
export interface ContextChildUse {
  /**
   * Type of the child. Always "use" for {@link ContextChildUse}
   */
  readonly type: "use";

  /**
   * Use function of the child. Will be called when the context is executed
   */
  readonly func: UseFunction;
}

/**
 * Context child for containing an action function
 * Only one action function is allowed in a context.
 * It does mark the request as handled and will not
 * call any other anything after it.
 */
export interface ContextChildAction {
  /**
   * Type of the child. Always "action" for {@link ContextChildAction}
   */
  readonly type: "action";

  /**
   * Action function of the child. Will be called when the context is executed
   * and will mark the request as handled.
   *
   * @see {@link ActionFunction}
   */
  readonly func: ActionFunction;
}

/**
 * The different types of context children
 *
 * @see {@link ContextChildCondition}
 * @see {@link ContextChildUse}
 * @see {@link ContextChildAction}
 */
export type ContextChild =
  | ContextChildCondition
  | ContextChildUse
  | ContextChildAction;

/**
 * The {@link Context} class is used to describe a route. Context can be nested using {@link ContextChildCondition}
 * as children (generated using the when function).
 * TODO: More documentation
 */
export class Context {
  /**
   * The current executing context
   *
   * @private
   * @static
   * @type {(Context | undefined)}
   * @memberof Context this is a static variable. It is used to store the current executing context.
   */
  private static _current: Context | undefined;

  /**
   * The current executing context. Throws an error if no context is executing.
   * @type {Context} The current executing context
   * @memberof Context
   * @throws {Error} If no context is executing
   * @readonly
   * @static
   * @example
   * ```typescript
   * Context.current; // The current context
   * ```
   * @see {@link Context._current}
   * @see {@link Context}
   */
  static get current(): Context {
    if (!Context._current) throw new Error("No context is currently executing");
    return Context._current;
  }

  /**
   * The children of the context
   * @type {ContextChild[]} The children of the context
   * @memberof Context
   * @readonly
   * @example
   * ```typescript
   * Context.current.children; // The children of the current context
   * ```
   * @see {@link ContextChild}
   * @see {@link Context}
   * @see {@link ContextChildAction}
   * @see {@link ContextChildCondition}
   * @see {@link ContextChildUse}
   */
  children: ContextChild[] = [];

  /**
   * The data of the context. Used to store data for the context (for extensions)
   * @type {{ [key: string]: any }} The data of the context
   * @memberof Context
   * @readonly
   * @example
   * ```typescript
   * Context.current.data; // The data of the current context
   * ```
   * @see {@link Context}
   * @see {@link Context.current}
   * @see {@link Context.setData}
   * @see {@link Context.data}
   * @see {@link Context._data}
   */
  private _data: { [key: string]: any } = {};

  /**
   * {@link Context}'s constructor
   * @param _api  The api that the context belongs to
   * @param condition The condition for the context to be executed
   * @param parent The parent context
   */
  constructor(
    /**
     * The api that the context belongs to
     * @private
     * @type {RestfulApi}
     * @memberof Context
     * @readonly
     */
    protected _api: RestfulApi,

    /**
     * The condition for the context to be executed
     * @private
     * @type {ContextCondition}
     * @memberof Context
     * @readonly
     */
    public readonly condition?: ContextCondition | undefined,

    /**
     * The parent context
     * @private
     * @type {(Context | undefined)}
     * @memberof Context
     * @readonly
     */
    public readonly parent?: Context | undefined
  ) {}

  /**
   * The api that the context belongs to
   */
  public get api() {
    return this._api;
  }

  /**
   * Initialize the context with a handler
   * @param handler The handler to initialize the context with
   * @returns {Context} The context itself
   * @memberof Context
   * @example
   * ```typescript
   * Context.current.init(function() {
   *  // ctx is available here via [this] keyword
   *  // Do something
   * });
   * ```
   *
   */
  init(handler: ContextInitializer): this {
    if (!handler) throw new Error("No callback provided");
    if (!(handler instanceof Function))
      throw new Error("Callback is not a function");
    const current = Context._current;
    Context._current = this;
    handler.call(this, this);
    Context._current = current;
    return this;
  }

  /**
   * Create a new context and add it to the children of the current context with a condition and a handler
   * @param condition - The condition for the context to be executed
   * @param handler - The handler to initialize the context with
   * @returns {Context} The context itself
   * @example
   * ```typescript
   * Context.current.when(new ContextConditionPath("/hello"), function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   */
  when(condition: ContextCondition, handler: ContextInitializer): this {
    this.children.push({
      type: "condition",
      condition: condition,
      context: new Context(this.api, condition, this).init(handler),
    });
    return this;
  }

  /**
   * Search for paths starting with the given path. Is the same as {@link Condition.any}
   * @param what the path that the condition should check for
   * @param init the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.describe("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  describe(what: string, init: ContextInitializer): this;

  /**
   * Search for paths matching the given regex. Is the same as {@link Condition.any}
   * @param what the regex that the condition should check for
   * @param init the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.describe("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  describe(what: RegExp, init: ContextInitializer): this;

  /**
   * Search for paths starting with the given path. Is the same as {@link Condition.any}
   * This is a shorthand for {@link Context.describe} and then {@link Context.action} inside.
   * @param what the path that the condition should check for
   * @param init the action happening when the condition is met
   * @example
   * ```typescript
   *
   * Context.current.describe("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.describe("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  describe(what: string, init: ActionFunction): this;

  /**
   * Search for paths matching the given regex. Is the same as {@link Condition.any}
   * This is a shorthand for {@link Context.describe} and then {@link Context.action} inside.
   * @param what the regex that the condition should check for
   * @param init the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.describe(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.describe(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  describe(what: RegExp, init: ActionFunction): this;
  describe(
    what: string | RegExp,
    init: ContextInitializer | ActionFunction
  ): this {
    if (typeof what === "string")
      return this.when(new ContextConditionPath(what), toInitializer(init));
    else return this.when(new ContextConditionPath2(what), toInitializer(init));
  }

  /**
   * Search for paths starting with the given path. Is the same as {@link Condition.describe}
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.any("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   */
  any(what: string, init: ContextInitializer): this;

  /**
   * Search for paths matching the given regex. Is the same as {@link Condition.describe}
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.any("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   */
  any(what: RegExp, init: ContextInitializer): this;

  /**
   * Search for paths starting with the given path. Is the same as {@link Condition.describe}
   * This is a shorthand for {@link Context.any} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.any("/hello", async (req, res) => {
   *  res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.any("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  any(what: string, init: ActionFunction): this;

  /**
   * Search for paths matching the given regex. Is the same as {@link Condition.describe}
   * This is a shorthand for {@link Context.any} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.any(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.any(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  any(what: RegExp, init: ActionFunction): this;
  any(what: string | RegExp, init: ContextInitializer | ActionFunction): this {
    if (typeof what === "string")
      return this.when(new ContextConditionPath(what), toInitializer(init));
    else return this.when(new ContextConditionPath2(what), toInitializer(init));
  }

  /**
   * Match requests with the method POST.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.post(function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   */
  post(init: ContextInitializer): this;

  /**
   * Match requests starting with the given path and requests with the method POST.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.post("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  post(what: string, init: ContextInitializer): this;

  /**
   * Match requests matching the given regex and requests with the method POST.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.post(/\/hello/, function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  post(what: RegExp, init: ContextInitializer): this;

  /**
   * Match requests with the method POST.
   * This is a shorthand for {@link Context.post} and then {@link Context.action} inside.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.post(async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.post(function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   */
  post(init: ActionFunction): this;

  /**
   * Match requests starting with the given path and requests with the method POST.
   * This is a shorthand for {@link Context.post} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.post("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.post("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  post(what: string, init: ActionFunction): this;

  /**
   * Match requests matching the given regex and requests with the method POST.
   * This is a shorthand for {@link Context.post} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.post(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.post(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  post(what: RegExp, init: ActionFunction): this;

  post(
    arg0: string | RegExp | ContextInitializer | ActionFunction,
    arg1?: ContextInitializer | ActionFunction
  ): this {
    // post(what: string, init)
    if (typeof arg0 === "string" && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("post").and(new ContextConditionPath(arg0)),
        toInitializer(arg1)
      );

    // post(what: RegExp, init)
    if (arg0 instanceof RegExp && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("post").and(new ContextConditionPath2(arg0)),
        toInitializer(arg1)
      );
    // post(init)
    if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod("post"), toInitializer(arg0));

    throw new Error("Invalid arguments");
  }

  /**
   * Match requests with the method GET.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.get(function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  get(init: ContextInitializer): Context;

  /**
   * Match requests starting with the given path and requests with the method GET.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.get("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  get(what: string, init: ContextInitializer): Context;

  /**
   * Match requests matching the given regex and requests with the method GET.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.get(/\/hello/, function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  get(what: RegExp, init: ContextInitializer): Context;

  /**
   * Match requests with the method GET.
   * This is a shorthand for {@link Context.get} and then {@link Context.action} inside.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.get(async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.get(function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  get(init: ActionFunction): Context;

  /**
   * Match requests starting with the given path and requests with the method GET.
   * This is a shorthand for {@link Context.get} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.get("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.get("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  get(what: string, init: ActionFunction): Context;

  /**
   * Match requests matching the given regex and requests with the method GET.
   * This is a shorthand for {@link Context.get} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.get(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.get(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  get(what: RegExp, init: ActionFunction): Context;
  get(
    arg0: string | RegExp | ContextInitializer | ActionFunction,
    arg1?: ContextInitializer | ActionFunction
  ): this {
    // get(what: string, init)
    if (typeof arg0 === "string" && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("get").and(new ContextConditionPath(arg0)),
        toInitializer(arg1)
      );
    // get(what: RegExp, init)
    if (arg0 instanceof RegExp && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("get").and(new ContextConditionPath2(arg0)),
        toInitializer(arg1)
      );
    // get(init)
    if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod("get"), toInitializer(arg0));
    throw new Error("Invalid arguments");
  }

  /**
   * Match requests with the method PUT.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.put(function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  put(init: ContextInitializer): Context;

  /**
   * Match requests starting with the given path and requests with the method PUT.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.put("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  put(what: string, init: ContextInitializer): Context;

  /**
   * Match requests matching the given regex and requests with the method PUT.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.put(/\/hello/, function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  put(what: RegExp, init: ContextInitializer): Context;

  /**
   * Match requests with the method PUT.
   * This is a shorthand for {@link Context.put} and then {@link Context.action} inside.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.put(async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.put(function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  put(init: ActionFunction): Context;

  /**
   * Match requests starting with the given path and requests with the method PUT.
   * This is a shorthand for {@link Context.put} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.put("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.put("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  put(what: string, init: ActionFunction): Context;

  /**
   * Match requests matching the given regex and requests with the method PUT.
   * This is a shorthand for {@link Context.put} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.put(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.put(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  put(what: RegExp, init: ActionFunction): Context;

  put(
    arg0: string | RegExp | ContextInitializer | ActionFunction,
    arg1?: ContextInitializer | ActionFunction
  ): this {
    // put(what: string, init)
    if (typeof arg0 === "string" && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("put").and(new ContextConditionPath(arg0)),
        toInitializer(arg1)
      );
    // put(what: RegExp, init)
    if (arg0 instanceof RegExp && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("put").and(new ContextConditionPath2(arg0)),
        toInitializer(arg1)
      );
    // put(init)
    if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod("put"), toInitializer(arg0));
    throw new Error("Invalid arguments");
  }

  /**
   * Match requests with the method PATCH.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.patch(function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  patch(init: ContextInitializer): Context;

  /**
   * Match requests starting with the given path and requests with the method PATCH.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.patch("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  patch(what: string, init: ContextInitializer): Context;

  /**
   * Match requests matching the given regex and requests with the method PATCH.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.patch(/\/hello/, function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  patch(what: RegExp, init: ContextInitializer): Context;

  /**
   * Match requests with the method PATCH.
   * This is a shorthand for {@link Context.patch} and then {@link Context.action} inside.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.patch(async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.patch(function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  patch(init: ActionFunction): Context;

  /**
   * Match requests starting with the given path and requests with the method PATCH.
   * This is a shorthand for {@link Context.patch} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.patch("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.patch("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  patch(what: string, init: ActionFunction): Context;

  /**
   * Match requests matching the given regex and requests with the method PATCH.
   * This is a shorthand for {@link Context.patch} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.patch(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.patch(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  patch(what: RegExp, init: ActionFunction): Context;
  patch(
    arg0: string | RegExp | ContextInitializer | ActionFunction,
    arg1?: ContextInitializer | ActionFunction
  ): this {
    // patch(what: string, init)
    if (typeof arg0 === "string" && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("patch").and(new ContextConditionPath(arg0)),
        toInitializer(arg1)
      );

    // patch(what: RegExp, init)
    if (arg0 instanceof RegExp && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("patch").and(
          new ContextConditionPath2(arg0)
        ),
        toInitializer(arg1)
      );
    // patch(init)
    if (typeof arg0 === "function")
      return this.when(
        new ContextConditionMethod("patch"),
        toInitializer(arg0)
      );
    throw new Error("Invalid arguments");
  }

  /**
   * Match requests with the method DELETE.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.delete(function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  delete(init: ContextInitializer): Context;

  /**
   * Match requests starting with the given path and requests with the method DELETE.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.delete("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  delete(what: string, init: ContextInitializer): Context;

  /**
   * Match requests matching the given regex and requests with the method DELETE.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.delete(/\/hello/, function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  delete(what: RegExp, init: ContextInitializer): Context;

  /**
   * Match requests with the method DELETE.
   * This is a shorthand for {@link Context.delete} and then {@link Context.action} inside.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.delete(async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.delete(function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  delete(init: ActionFunction): Context;

  /**
   * Match requests starting with the given path and requests with the method DELETE.
   * This is a shorthand for {@link Context.delete} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.delete("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.delete("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  delete(what: string, init: ActionFunction): Context;

  /**
   * Match requests matching the given regex and requests with the method DELETE.
   * This is a shorthand for {@link Context.delete} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.delete(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.delete(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  delete(what: RegExp, init: ActionFunction): Context;

  delete(
    arg0: string | RegExp | ContextInitializer | ActionFunction,
    arg1?: ContextInitializer | ActionFunction
  ): this {
    // delete(what: string, init)
    if (typeof arg0 === "string" && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("delete").and(
          new ContextConditionPath(arg0)
        ),
        toInitializer(arg1)
      );
    // delete(what: RegExp, init)
    if (arg0 instanceof RegExp && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("delete").and(
          new ContextConditionPath2(arg0)
        ),
        toInitializer(arg1)
      );
    // delete(init)
    if (typeof arg0 === "function")
      return this.when(
        new ContextConditionMethod("delete"),
        toInitializer(arg0)
      );
    throw new Error("Invalid arguments");
  }

  /**
   * Match requests with the method OPTIONS.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.options(function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  options(init: ContextInitializer): Context;

  /**
   * Match requests starting with the given path and requests with the method OPTIONS.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.options("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  options(what: string, init: ContextInitializer): Context;

  /**
   * Match requests matching the given regex and requests with the method OPTIONS.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.options(/\/hello/, function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  options(what: RegExp, init: ContextInitializer): Context;

  /**
   * Match requests with the method OPTIONS.
   * This is a shorthand for {@link Context.options} and then {@link Context.action} inside.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.options(async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.options(function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  options(init: ActionFunction): Context;

  /**
   * Match requests starting with the given path and requests with the method OPTIONS.
   * This is a shorthand for {@link Context.options} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.options("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  options(what: string, init: ActionFunction): Context;

  /**
   * Match requests matching the given regex and requests with the method OPTIONS.
   * This is a shorthand for {@link Context.options} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.options(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  options(what: RegExp, init: ActionFunction): Context;

  options(
    arg0: string | RegExp | ContextInitializer | ActionFunction,
    arg1?: ContextInitializer | ActionFunction
  ): this {
    // options(what: string, init)
    if (typeof arg0 === "string" && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("options").and(
          new ContextConditionPath(arg0)
        ),
        toInitializer(arg1)
      );
    // options(what: RegExp, init)
    if (arg0 instanceof RegExp && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("options").and(
          new ContextConditionPath2(arg0)
        ),
        toInitializer(arg1)
      );
    // options(init)
    if (typeof arg0 === "function")
      return this.when(
        new ContextConditionMethod("options"),
        toInitializer(arg0)
      );
    throw new Error("Invalid arguments");
  }

  /**
   * Match requests with the method HEAD.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.head(function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  head(init: ContextInitializer): Context;

  /**
   * Match requests starting with the given path and requests with the method HEAD.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.head("/hello", function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  head(what: string, init: ContextInitializer): Context;

  /**
   * Match requests matching the given regex and requests with the method HEAD.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.head(/\/hello/, function() {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  head(what: RegExp, init: ContextInitializer): Context;

  /**
   * Match requests with the method HEAD.
   * This is a shorthand for {@link Context.head} and then {@link Context.action} inside.
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.head(async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.head(function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  head(init: ActionFunction): Context;

  /**
   * Match requests starting with the given path and requests with the method HEAD.
   * This is a shorthand for {@link Context.head} and then {@link Context.action} inside.
   * @param what - the path that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.head("/hello", async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   *
   * // Is the same as this:
   * Context.current.head("/hello", function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  head(what: string, init: ActionFunction): Context;

  /**
   * Match requests matching the given regex and requests with the method HEAD.
   * This is a shorthand for {@link Context.head} and then {@link Context.action} inside.
   * @param what - the regex that the condition should check for
   * @param init - the action happening when the condition is met
   * @example
   * ```typescript
   * Context.current.head(/\/hello/, async (req, res) => {
   *   res.status(200).json({ message: "Hello World!" }).end();
   * });
   *
   * // Is the same as this:
   * Context.current.head(/\/hello/, function() {
   *   this.action(async (req, res) => {
   *     res.status(200).json({ message: "Hello World!" }).end();
   *   });
   * });
   * ```
   */
  head(what: RegExp, init: ActionFunction): Context;

  head(
    arg0: string | RegExp | ContextInitializer | ActionFunction,
    arg1?: ContextInitializer | ActionFunction
  ): this {
    // head(what: string, init)
    if (typeof arg0 === "string" && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("head").and(new ContextConditionPath(arg0)),
        toInitializer(arg1)
      );

    // head(what: RegExp, init)
    if (arg0 instanceof RegExp && typeof arg1 === "function")
      return this.when(
        new ContextConditionMethod("head").and(new ContextConditionPath2(arg0)),
        toInitializer(arg1)
      );

    // head(init)
    if (typeof arg0 === "function")
      return this.when(new ContextConditionMethod("head"), toInitializer(arg0));
    throw new Error("Invalid arguments");
  }

  /**
   * Define the action function for this context
   * Only one action function is allowed in a context.
   * It does mark the request as handled and will not
   * call any other anything after it.
   * @param fun The action function
   * @returns {Context} The context itself
   */
  action(fun: ActionFunction): this {
    if (this.children.find((c) => c.type === "action"))
      throw new Error("Only one action function is allowed in a context");
    if (!fun) throw new Error("No callback provided");
    if (!(fun instanceof Function))
      throw new Error("Callback is not a function");
    this.children.push({ type: "action", func: fun });
    return this;
  }

  /**
   * Define the use function for this context.
   * Use functions are called when the context is executed. They can be used to add middleware to the context.
   * @param fun - The use function
   * @returns {Context} The context itself
   * @example
   * ```typescript
   * Context.current.use(function(req, res, next) {
   *   // ctx is available here via [this] keyword
   *   // Do something
   * });
   * ```
   */
  use(fun: UseFunction): this {
    if (!fun) throw new Error("No callback provided");
    if (!(fun instanceof Function))
      throw new Error("Callback is not a function");

    this.children.push({ type: "use", func: fun });
    return this;
  }

  /**
   * Get the context stack for the given request
   * @param req - The request to get the context stack for
   * @param res - The response to get the context stack for
   * @returns {ContextChild[][]} The context stack
   * @memberof Context
   * @example
   * ```typescript
   * Context.current.contextStack(req, res); // The context stack for the given request
   * ```
   */
  async contextStack(req: Request, res: Response): Promise<ContextChild[][]> {
    const stack: ContextChild[] = [];
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].type === "condition") {
        const parsed = (
          this.children[i] as ContextChildCondition
        ).condition.parse(req);
        if (parsed.applies) {
          stack.push(this.children[i]);
          return [
            stack,
            ...(await (
              this.children[i] as ContextChildCondition
            ).context.contextStack(parsed.subRequest(req), res)),
          ];
        }
      } else if (this.children[i].type === "action") {
        stack.push(this.children[i]);
        return [stack];
      } else if (this.children[i].type === "use") {
        stack.push(this.children[i]);
      }
    }

    return [stack];
  }

  /**
   * Execute the context
   * @param req - The request to execute the context for
   * @param res - The response to execute the context for
   * @returns {boolean} Whether the context was successfully executed or not
   * @memberof Context
   * @example
   * ```typescript
   * Context.current.execute(req, res); // Whether the context was executed or not
   * ```
   * @see {@link ContextChild}
   * @see {@link ContextChildAction}
   * @see {@link ContextChildCondition}
   * @see {@link ContextChildUse}
   */
  async execute(req: Request, res: Response): Promise<boolean> {
    const do_execute = async (collected: typeof this.children) => {
      for (let i = 0; i < collected.length; i++) {
        if (collected[i].type === "condition") {
          const it = collected[i] as ContextChildCondition;
          const { condition, context } = it;
          const parsed = condition.parse(req);
          if (condition.appliesTo(req)) {
            debugRoutePath(req, condition);
            if (await context.execute(condition.subRequest(req), res))
              return true;
          }
        }
        if (collected[i].type === "action" && req.path === "") {
          await (collected[i] as ContextChildAction).func(req, res);
          return true;
        }
        if (collected[i].type === "use") {
          const new_collect = collected.slice(i + 1);
          return new Promise<boolean>((resolve, reject) => {
            (async () => {
              let next_called = false;
              debugRouteUse(
                `Next called for ${req.path} in use function${
                  next_called
                    ? " (again): WARNING: SAME NEXT FUNCTION CALLED MULTIPLE TIMES, SKIPPING NEXT CALL"
                    : ""
                }`
              );

              const next = (err: unknown) => {
                if (next_called) return;
                next_called = true;
                if (err !== true && err) {
                  reject(err);
                }
                do_execute(new_collect).then(resolve).catch(reject);
              };

              await (collected[i] as ContextChildUse)
                .func(req, res, next)
                ?.catch(next);

              if (!next_called) {
                resolve(true);
              }
            })();
          });
        }
      }

      return false;
    };

    return await do_execute(this.children);
  }

  /**
   * Get all the data of the context
   * @returns {{ [key: string]: any }} A map with all the data of the context
   * @example
   * ```typescript
   * Context.current.data(); // A map with all the data of the context
   * ```
   */
  data(): { [key: string]: any };

  /**
   * Get the data with the given key
   * @param key - The key of the data to get
   * @returns {any} The data with the given key
   * @example
   * ```typescript
   * Context.current.data("key"); // The data with the given key
   * ```
   */
  data(key: string): any;
  data(arg0?: string): any {
    if (typeof arg0 == "undefined") return this._data;
    if (typeof arg0 == "string") return this._data[arg0];
    throw new Error("Invalid arguments");
  }

  /**
   * Set the data with the given key to the given value
   * @param key - The key of the data to set
   * @param value - The value to set the data to
   * @returns {Context} The context itself
   * @example
   * ```typescript
   * Context.current.setData("key", "value"); // The context itself
   * ```
   */
  setData(key: string, value: any): this {
    if (!key) throw new Error("No key provided");
    this._data[key] = value;
    return this;
  }

  /**
   * Get a map of all the data of the context
   * @returns {any} A map with all the data of the context
   * @example
   * ```typescript
   * Context.current.map; // A map with all the data of the context
   * ```
   */
  get map(): any {
    return (
      this.children.filter(
        (c) => c.type === "condition"
      ) as ContextChildCondition[]
    ).map((c) => {
      return {
        condition: c.condition.toJson(),
        context: c.context.map,
      };
    });
  }

  /**
   * Get information about the context and its children
   * @returns {{ context: Context; condition: ConditionInfo }[]} Information about the context and its children
   * @example
   * ```typescript
   * Context.current.info(); // Information about the context and its children
   * ```
   */
  info(): { context: Context; condition: ConditionInfo }[] {
    return (
      this.children.filter(
        (c) => c.type === "condition"
      ) as ContextChildCondition[]
    ).flatMap((c: ContextChildCondition) => {
      const children = c.context.info();
      const info = c.condition.info();
      return [
        {
          context: c.context,
          condition: info,
        },
        ...children.flatMap((f) => ({
          context: f.context,
          condition: {
            method: info.method ?? f.condition.method,
            path: (info.path ?? "") + (f.condition.path ?? ""),
          },
        })),
      ];
    });
  }

  /**
   * Return the json representation of the context
   * @returns  {any} The json representation of the context
   * @example
   * ```typescript
   * Context.current.toJson(); // The json representation of the context
   * ```
   * @see {@link ContextChild}
   */
  toJson(): ContextJson {
    return {
      children: this.children.map((c) => {
        if (c.type === "condition")
          return {
            type: "condition",
            condition: (c as ContextChildCondition).condition.toJson(),
            context: (c as ContextChildCondition).context.toJson(),
          };
        if (c.type === "action") return { type: "action" };
        return { type: "use" };
      }),
    };
  }

  /**
   * Collect all children of the context to a list of contexts
   * @returns {Context[]} A list of all the contexts
   */
  collect() {
    const map: Context[] = (
      this.children.filter(
        (c) => c.type === "condition"
      ) as ContextChildCondition[]
    ).flatMap((e) => e.context.collect());
    map.push(this);
    return map;
  }

  /**
   * Get the request path to access this context (including the parent path, if any. Use {@link Context.getRoutingPath} to get the path without the parent path)
   * @returns {string} The request path to access this context
   */
  getPath(): string {
    const info = this.condition?.info();
    return (this.parent?.getPath() ?? "") + (info?.path ?? "");
  }

  /**
   * Get the request path to access this context (without the parent path, if any. Use {@link Context.getPath} to get the path with the parent path)
   * @returns {string} The request path to access this context
   */
  getRoutingPath(): string {
    const info = this.condition?.info();
    return info?.path ?? "";
  }

  /**
   * Get the request method to access this context
   * @returns {Method | "any"} The request method to access this context
   */
  getMethod(): Method | "any" {
    const info = this.condition?.info();
    return info?.method ?? this.parent?.getMethod() ?? "any";
  }
}

/**
 * Initializer function for a context
 * @param this The context to initialize
 * @param ctx The context to initialize
 * @returns {void | Promise<void>} The result of the initializer function
 * @example
 * ```typescript
 * Context.current.init(function(ctx) {
 *   // ctx is available here via [this] keyword
 *   // Do something
 * });
 * ```
 */
export type ContextInitializer = (
  this: Context,
  ctx: Context
) => void | Promise<void>;

/**
 * Action function for a context
 * Only one action function is allowed in a context.
 * It does mark the request as handled and will not
 * call any other anything after it.
 * @param req The request to execute the action for
 * @param res The response to execute the action for
 * @returns {void | Promise<void>} The result of the action function
 * @example
 * ```typescript
 * Context.current.action(function(req, res) {
 *   // ctx is available here via [this] keyword
 *   // Do something
 * });
 * ```
 */
export type ActionFunction = (
  req: Request,
  res: Response
) => any | Promise<any>;

/**
 * Use function for a context
 * Use functions are called when the context is executed. They can be used to add middleware to the context.
 * @param req The request to execute the use function for
 * @param res The response to execute the use function for
 * @param next The next function to call (if not called, this will be the final context to be executed)
 */
export type UseFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => any | Promise<any>;

/**
 * Next function for a context
 * @param err Pass an error to the next function to stop the execution of the context, it will be handled by the error handler
 */
export type NextFunction = (err?: any) => void;
