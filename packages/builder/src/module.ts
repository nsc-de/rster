import {
  Context,
  ContextConditionMethod,
  ContextConditionPath,
} from "@rster/basic";
import { ArrayFinder, NoNever, Value, Values, Method } from "@rster/common";
import {
  RsterApiMethodBuilder,
  RsterApiModuleBuilder,
  RsterApiModuleBuilderContextToRsterApiModule,
} from "./conversion_types";
import { RsterApiMethodBuilderContext, RsterApiMethodJson } from "./method";
import {
  MethodBuilderMap,
  MethodMap,
  ModuleBuilderMap,
  ModuleMap,
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
  MODULES extends ModuleMap,
  METHODS extends MethodMap
> {
  constructor(
    public readonly name: string,
    public readonly description: string[],
    public readonly moduleList: Values<MODULES>,
    public readonly methodList: Values<METHODS>,
    public readonly httpPath?: string,
    public readonly httpMethod?: Method
  ) {}

  public readonly modules: MODULES = ArrayFinder(
    this.moduleList,
    "name"
  ) as unknown as MODULES;

  public readonly methods: METHODS = ArrayFinder(
    this.methodList,
    "name"
  ) as unknown as METHODS;

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

  public rest() {
    const contents = () => {
      Context.current.description(...this.description);
      this.moduleList.forEach((m) => {
        m.rest();
      });
      this.methodList.forEach((m) => {
        m.rest();
      });
    };

    if (this.httpPath && this.httpMethod) {
      Context.current.when(
        new ContextConditionPath(this.httpPath).and(
          new ContextConditionMethod(this.httpMethod)
        ),
        contents
      );
    } else if (this.httpPath) {
      Context.current.when(new ContextConditionPath(this.httpPath), contents);
    } else if (this.httpMethod) {
      Context.current.when(
        new ContextConditionMethod(this.httpMethod),
        contents
      );
    } else {
      contents();
    }
  }
}

export class RsterApiModuleBuilderContext<
  MODULES extends ModuleBuilderMap<any>,
  METHODS extends MethodBuilderMap<any>
> {
  private readonly _name: string;
  private _description: string[] = [];
  private _httpPath?: string;
  private _httpMethod?: Method;
  public readonly moduleList: Values<MODULES> = [];
  public readonly methodList: Values<METHODS> = [];

  constructor({
    name,
    description = [],
    httpPath,
    httpMethod,
  }: {
    name: string;
    modules?: Values<MODULES>;
    methods?: Values<METHODS>;
    description?: string[];
    httpPath?: string;
    httpMethod?: Method;
  }) {
    this._name = name;
    this._description = description ?? [];
    this._httpPath = httpPath;
    this._httpMethod = httpMethod;
    this.moduleList = [];
    this.methodList = [];
  }

  public get modules() {
    return ArrayFinder(this.moduleList, "name") as MODULES;
  }

  public get methods() {
    return ArrayFinder(this.methodList, "name") as METHODS;
  }

  public get name() {
    return this._name;
  }

  public module<T extends Value<MODULES>>(
    name: string,
    builder: RsterApiModuleBuilder<NoNever<T, ModuleBuilderMap<any>>>
  ) {
    const context = new RsterApiModuleBuilderContext({
      name,
    }) as Value<MODULES>;
    builder.call(context as NoNever<T, ModuleBuilderMap<any>>);
    this.moduleList.push(context);
  }

  public method(name: string, builder: RsterApiMethodBuilder<Value<METHODS>>) {
    const context = new RsterApiMethodBuilderContext({
      name,
    }) as Value<METHODS>;
    builder.call(context);
    this.methodList.push(context);
  }

  public description(...description: string[]) {
    this._description.push(...description);
  }

  public httpPath(path: string) {
    this._httpPath = path;
  }

  public httpMethod(method: Method) {
    this._httpMethod = method;
  }

  public generate() {
    return new RsterApiModule(
      this._name,
      this._description,
      this.moduleList.map((m) => m.generate()),
      this.methodList.map((m) => m.generate()),
      this._httpPath,
      this._httpMethod
    ) as RsterApiModuleBuilderContextToRsterApiModule<this>;
  }
}
