import {
  Context,
  ContextConditionMethod,
  ContextConditionPath,
} from "@rster/basic";
import { Values, Method } from "@rster/common";
import { RsterApiMethod, RsterApiMethodJson } from "./method";
import {
  AnyParameterDeclaration,
  RemoveNeverProperties,
  RsterArgsType,
} from "./types";

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

export class RsterApiModule<
  NAME extends string,
  MODULES extends { [key: string]: RsterApiModule<typeof key, any, any> },
  METHODS extends {
    [key: string]: RsterApiMethod<typeof key, AnyParameterDeclaration>;
  }
> {
  constructor(
    public readonly name: NAME,
    public readonly description: string[],
    public readonly modules: MODULES,
    public readonly methods: METHODS,
    public readonly httpPath?: string,
    public readonly httpMethod?: Method
  ) {
    this.moduleList = Object.values(modules) as Values<MODULES>;
    this.methodList = Object.values(methods) as Values<METHODS>;
  }

  public readonly moduleList: Values<MODULES>;
  public readonly methodList: Values<METHODS>;

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

export function module<
  NAME extends string,
  MODULES extends { [key: string]: RsterApiModule<typeof key, any, any> },
  METHODS extends {
    [key: string]: RsterApiMethod<typeof key, AnyParameterDeclaration>;
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
