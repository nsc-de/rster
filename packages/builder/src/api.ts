import rest, { Context, RestfulApi } from "@rster/basic";
import { Values } from "@rster/common";
import { RsterApiMethod, RsterApiMethodJson } from "./method";
import { RsterApiModule, RsterApiModuleJson } from "./module";
import { AnyParameterDeclaration, RemoveNeverProperties } from "./types";

/**
 * A type for the json representation of the api class. Returned by the `json` method, used to get info about the api.
 *
 * @see RsterApi.json
 * @see RsterApi
 */
export interface RsterApiJson {
  /**
   * The name of the api.
   * @see RsterApi.name
   */
  name: string;

  /**
   * The description of the api.
   * @see RsterApi.description
   */
  description: string[];

  /**
   * The modules of the api.
   * @see RsterApi.modules
   * @see RsterApiModuleJson
   */
  modules: RsterApiModuleJson[];

  /**
   * The methods of the api.
   * @see RsterApi.methods
   * @see RsterApiMethodJson
   */
  methods: RsterApiMethodJson[];
}

/**
 * Rster api class. Used to create an api with `@rster/builder`.
 *
 * _We use type parameters to more specifically index the typing of the api. This allows us to get the correct typing for the `native` method. From a functional perspective, the type parameters are not needed._
 * @typeParam NAME - The name of the api.
 * @typeParam MODULES - The modules of the api.
 * @typeParam METHODS - The methods of the api.
 */
export class RsterApi<
  NAME extends string,
  MODULES extends { [key: string]: RsterApiModule<typeof key, any, any> },
  METHODS extends {
    [key: string]: RsterApiMethod<typeof key, AnyParameterDeclaration>;
  }
> {
  /**
   * The constructor of the {@link RsterApi} class.
   *
   * @param name The name of the api.
   * @param description The description of the api.
   * @param modules The modules of the api.
   * @param methods The methods of the api.
   */

  constructor(
    /**
     * The name of the api.
     */
    public readonly name: NAME,

    /**
     * The description of the api.
     */
    public readonly description: string[],

    /**
     * The modules of the api.
     * @see {@link RsterApi.moduleList}
     */
    public readonly modules: MODULES,

    /**
     * The methods of the api.
     * @see {@link RsterApi.methodList}
     */
    public readonly methods: METHODS
  ) {
    this.moduleList = Object.values(modules) as Values<MODULES>;
    this.methodList = Object.values(methods) as Values<METHODS>;
  }

  /**
   * A list of the modules of the api.
   * @see {@link RsterApi.modules}
   */
  public readonly moduleList: Values<MODULES>;

  /**
   * A list of the methods of the api.
   * @see {@link RsterApi.methods}
   */
  public readonly methodList: Values<METHODS>;

  /**
   * Returns the json representation of the api.
   * @see RsterApiJson
   */
  public json(): RsterApiJson {
    return {
      name: this.name,
      description: this.description,
      modules: this.moduleList.map((m) => m.json()),
      methods: this.methodList.map((m) => m.json()),
    };
  }

  /**
   * Returns the api as a restful api. {@link RestfulApi}
   * @see {@link RestfulApi}
   */
  public rest(): RestfulApi {
    return rest(() => {
      Context.current.description(...this.description);

      this.moduleList.forEach((m) => {
        m.rest();
      });

      this.methodList.forEach((m) => {
        m.rest();
      });
    });
  }

  /**
   * Returns the api as a native object. This is userful if you want to use the api definition as functions on your server-side, so you don't have to define the functionality in another place
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
 * Shortcut function to create a {@link RsterApi} object.
 *
 * @param name The name of the api.
 * @param description The description of the api.
 * @param modules The modules of the api.
 * @param methods The methods of the api.
 * @returns A new {@link RsterApi} object.
 */
export function api<
  NAME extends string,
  MODULES extends { [key: string]: RsterApiModule<typeof key, any, any> },
  METHODS extends {
    [key: string]: RsterApiMethod<typeof key, any>;
  }
>(
  name: NAME,
  description: string[],
  modules: MODULES,
  methods: METHODS
): RsterApi<NAME, MODULES, METHODS> {
  return new RsterApi(name, description, modules, methods);
}
