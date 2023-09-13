import rest, { Context, RestfulApi } from "@rster/basic";
import { Values } from "@rster/common";
import { RsterApiMethod, RsterApiMethodJson } from "./method";
import { RsterApiModule, RsterApiModuleJson } from "./module";
import { AnyParameterDeclaration, MethodMap, ModuleMap } from "./types";

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

export class RsterApi<
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
    public readonly methods: METHODS
  ) {
    this.moduleList = Object.values(modules) as Values<MODULES>;
    this.methodList = Object.values(methods) as Values<METHODS>;
  }

  public readonly moduleList: Values<MODULES>;
  public readonly methodList: Values<METHODS>;

  public json(): RsterApiJson {
    return {
      name: this.name,
      description: this.description,
      modules: this.moduleList.map((m) => m.json()),
      methods: this.methodList.map((m) => m.json()),
    };
  }

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
}

export function api<
  NAME extends string,
  MODULES extends { [key: string]: RsterApiModule<typeof key, any, any> },
  METHODS extends {
    [key: string]: RsterApiMethod<typeof key, AnyParameterDeclaration>;
  }
>(
  name: NAME,
  description: string[],
  modules: MODULES,
  methods: METHODS
): RsterApi<NAME, MODULES, METHODS> {
  return new RsterApi(name, description, modules, methods);
}
