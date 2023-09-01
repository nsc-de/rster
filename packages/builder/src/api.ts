import rest, { Context, RestfulApi } from "@rster/basic";
import { ArrayFinder, NoNever, Value, Values } from "@rster/common";
import {
  RsterApiBuilderContextToRsterApi,
  RsterApiMethodBuilder,
  RsterApiModuleBuilder,
} from "./conversion_types";
import { RsterApiMethodBuilderContext, RsterApiMethodJson } from "./method";
import { RsterApiModuleBuilderContext, RsterApiModuleJson } from "./module";
import {
  MethodBuilderMap,
  MethodMap,
  ModuleBuilderMap,
  ModuleMap,
} from "./types";

/**
 * A type for the json representation of the api class. Returned by the `json` method, used to get info about the api.
 *
 * @see RsterApi.json
 * @see RsterApi
 */
export interface RsterApiJson {
  /**
   * The version string of the api.
   * @see RsterApi.version
   */
  version: string;

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

export class RsterApi<MODULES extends ModuleMap, METHODS extends MethodMap> {
  constructor(
    public readonly version: string,
    public readonly name: string,
    public readonly description: string[],
    public readonly moduleList: Values<MODULES>,
    public readonly methodList: Values<METHODS>
  ) {}

  public readonly modules: MODULES = ArrayFinder(
    this.moduleList,
    "name"
  ) as unknown as MODULES;

  public readonly methods: METHODS = ArrayFinder(
    this.methodList,
    "name"
  ) as unknown as METHODS;

  public json(): RsterApiJson {
    return {
      version: this.version,
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

export class RsterApiBuilderContext<
  MODULES extends ModuleBuilderMap<RsterApiModuleBuilderContext<any, any>>,
  METHODS extends MethodBuilderMap<RsterApiMethodBuilderContext<any>>
> {
  private _version?: string;
  private _name?: string;
  private _description: string[] = [];
  public readonly moduleList: Values<MODULES> = [];
  public readonly methodList: Values<METHODS> = [];

  public readonly modules: MODULES = ArrayFinder(
    this.moduleList,
    "name"
  ) as unknown as MODULES;

  public readonly methods: METHODS = ArrayFinder(
    this.methodList,
    "name"
  ) as unknown as METHODS;

  constructor({
    version,
    name,
    description = [],
    modules = [],
    methods = [],
  }: {
    version?: string;
    name?: string;
    description?: string[];
    modules?: Values<MODULES>;
    methods?: Values<METHODS>;
  } = {}) {
    this._version = version;
    this._name = name;
    this._description = description;
    this.moduleList.push(...modules);
    this.methodList.push(...methods);
  }

  public module<T extends Value<MODULES>>(
    name: string,
    builder: RsterApiModuleBuilder<NoNever<T, ModuleBuilderMap<any>>>
  ) {
    const context = new RsterApiModuleBuilderContext({
      name,
    }) as T;

    builder.call(context as NoNever<T, ModuleBuilderMap<any>>);
    this.moduleList.push(context);
  }

  public method<T extends Value<METHODS>>(
    name: string,
    builder: RsterApiMethodBuilder<NoNever<T, ModuleBuilderMap<any>>>
  ) {
    const context = new RsterApiMethodBuilderContext({
      name,
    }) as T;
    builder.call(context as NoNever<T, ModuleBuilderMap<any>>);
    this.methodList.push(context);
  }

  public getVersion() {
    return this._version;
  }

  public setVersion(version: string) {
    this._version = version;
  }

  public version(version: string) {
    this.setVersion(version);
  }

  public getName() {
    return this._name;
  }

  public setName(name: string) {
    this._name = name;
  }

  public name(name: string) {
    this.setName(name);
  }

  public getDescription() {
    return this._description;
  }

  public setDescription(description: string[]) {
    this._description = description;
  }

  public description(...description: string[]) {
    this._description.push(...description);
  }

  public getModules() {
    return this.moduleList;
  }

  public getMethods() {
    return this.methodList;
  }

  public generate() {
    return new RsterApi(
      this._version!,
      this._name!,
      this._description,
      this.moduleList.map((m) => m.generate()),
      this.methodList.map((m) => m.generate())
    ) as RsterApiBuilderContextToRsterApi<this>;
  }
}
