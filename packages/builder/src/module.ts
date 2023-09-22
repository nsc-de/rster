import {
  Context,
  ContextConditionMethod,
  ContextConditionPath,
} from "@rster/basic";
import { Method } from "@rster/common";
import { Values } from "@rster/util";
import { RsterApiMethod, RsterApiMethodJson } from "./method";
import { AnyRsterApiMethod, RemoveNeverProperties } from "./types";

/**
 * A type for the json representation of the module class. Returned by the `json` method, used to get info about the module.
 *
 * @see RsterApiModule.json
 * @see RsterApiModule
 * @see RsterApiJson
 * @see RsterApiModuleJson
 */
export interface RsterApiModuleJson {
  /**
   * The name of the module.
   * @see RsterApiModule.name
   */
  name: string;

  /**
   * The description of the module.
   * @see RsterApiModule.description
   */
  description: string[];

  /**
   * The modules of the module.
   * @see RsterApiModule.modules
   * @see RsterApiModuleJson
   */
  modules: RsterApiModuleJson[];

  /**
   * The methods of the module.
   * @see RsterApiModule.methods
   * @see RsterApiMethodJson
   */
  methods: RsterApiMethodJson[];

  /**
   * The http path of the module. Will be joined with the parent module's path.
   * This is the condition for the module to be used for a request.
   * @see RsterApiModule.httpPath
   */
  httpPath?: string;

  /**
   * The http method of the module. This is the condition for the module to be used for a request.
   * @see RsterApiModule.httpMethod
   * @see Method
   */
  httpMethod?: Method;
}

/**
 * Rster module class. Used to create a module with `@rster/builder`.
 *
 * _We use type parameters to more specifically index the typing of the module. This allows us to get the correct typing for the `native` method. From a functional perspective, the type parameters are not needed._
 * @typeParam NAME - The name of the module.
 * @typeParam MODULES - The modules of the module.
 * @typeParam METHODS - The methods of the module.
 */
export class RsterApiModule<
  NAME extends string,
  MODULES extends { [key: string]: RsterApiModule<typeof key, any, any> },
  METHODS extends {
    [key: string]: AnyRsterApiMethod;
  }
> {
  /**
   * The constructor of the {@link RsterApiModule} class.
   *
   * @param name The name of the module.
   * @param description The description of the module.
   * @param modules The modules of the module.
   * @param methods The methods of the module.
   * @param httpPath The http path of the module. Will be joined with the parent module's path.
   * @param httpMethod The http method of the module.
   */
  constructor(
    /**
     * The name of the module.
     */
    public readonly name: NAME,

    /**
     * The description of the module.
     */
    public readonly description: string[],

    /**
     * The modules of the module.
     * @see {@link RsterApiModule.moduleList}
     */
    public readonly modules: MODULES,

    /**
     * The methods of the module.
     * @see {@link RsterApiModule.methodList}
     */
    public readonly methods: METHODS,

    /**
     * The http path of the module. Will be joined with the parent module's path.
     */
    public readonly httpPath?: string,

    /**
     * The http method of the module.
     */
    public readonly httpMethod?: Method
  ) {
    this.moduleList = Object.values(modules) as Values<MODULES>;
    this.methodList = Object.values(methods) as Values<METHODS>;
  }

  /**
   * A list of the modules of the module.
   * @see {@link RsterApiModule.modules}
   */
  public readonly moduleList: Values<MODULES>;

  /**
   * A list of the methods of the module.
   * @see {@link RsterApiModule.methods}
   */
  public readonly methodList: Values<METHODS>;

  /**
   * The json representation of the module.
   * @returns The json representation of the module.
   * @see {@link RsterApiModuleJson}
   */
  public json(): RsterApiModuleJson {
    return {
      name: this.name,
      description: this.description,
      modules: this.moduleList.map((m) => m.json()),
      methods: this.methodList.map((m) => m.json()),
      httpPath: this.httpPath,
      httpMethod: this.httpMethod,
    };
  }

  /**
   * Adds the module to the context.
   * @param ctx The context to add the module to.
   * @see {@link Context}
   */
  public rest(ctx?: Context) {
    ctx = ctx ?? Context.current;

    const contents = (ctx: Context) => {
      ctx.description(...this.description);
      this.moduleList.forEach((m) => m.rest(ctx));
      this.methodList.forEach((m) => m.rest(ctx));
    };

    if (this.httpPath && this.httpMethod) {
      ctx.when(
        new ContextConditionPath(this.httpPath).and(
          new ContextConditionMethod(this.httpMethod)
        ),
        contents
      );
    } else if (this.httpPath) {
      ctx.when(new ContextConditionPath(this.httpPath), contents);
    } else if (this.httpMethod) {
      ctx.when(new ContextConditionMethod(this.httpMethod), contents);
    } else {
      contents(ctx);
    }
  }

  /**
   * Returns the native representation of the module.
   * @returns The native representation of the module.
   */
  public native(): RemoveNeverProperties<{
    [key in keyof MODULES]: key extends keyof METHODS
      ? ReturnType<MODULES[key]["native"]> & ReturnType<METHODS[key]["native"]>
      : ReturnType<MODULES[key]["native"]>;
  }> &
    RemoveNeverProperties<{
      [key in keyof METHODS]: key extends keyof MODULES
        ? never
        : ReturnType<METHODS[key]["native"]>;
    }> {
    const moduleList = this.moduleList.map((m) => ({
      name: m.name,
      native: m.native(),
    }));
    const methodList = this.methodList.map((m) => ({
      name: m.name,
      native: m.native(),
    }));

    const map = methodList.reduce((map, m) => {
      map[m.name] = m.native;
      return map;
    }, {} as Record<string, any>);

    moduleList.forEach((m) => {
      if (m.name in map) {
        Object.assign(map[m.name], m.native);
        return;
      }
      map[m.name] = m.native;
    });

    return map as any;
  }
}

/**
 * Shortcut function to create a {@link RsterApiModule} object.
 * @param name The name of the module.
 * @param description The description of the module.
 * @param modules The modules of the module.
 * @param methods The methods of the module.
 * @param httpPath The http path of the module. Will be joined with the parent module's path.
 * @param httpMethod The http method of the module.
 * @returns A new {@link RsterApiModule} object.
 */
export function module<
  NAME extends string,
  MODULES extends { [key: string]: RsterApiModule<typeof key, any, any> },
  METHODS extends {
    [key: string]: AnyRsterApiMethod<typeof key>;
  }
>(
  name: NAME,
  description: string[],
  modules: MODULES,
  methods: METHODS,
  httpPath?: string,
  httpMethod?: Method
): RsterApiModule<NAME, MODULES, METHODS> {
  return new RsterApiModule(
    name,
    description,
    modules,
    methods,
    httpPath,
    httpMethod
  );
}
