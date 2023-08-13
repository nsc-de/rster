import rest, { Context, RestfulApi, description } from "./basic/index";
import { Method } from "./basic/common";
import {
  ContextConditionMethod,
  ContextConditionPath,
} from "./basic/condition";
import {
  MapToPrimitiveType,
  NoUndefined,
  PrimitiveType,
  TypeInformation,
  undefinedType,
} from "./basic/types";
import { declaration } from "./generator/index";

export type ActionFunction<D extends ParameterDeclaration<any, any, any, any>> =
  (
    args: MapToPrimitiveType<NoUndefined<D["expectBody"], object>> &
      MapToPrimitiveType<NoUndefined<D["expectQuery"], object>> &
      MapToPrimitiveType<NoUndefined<D["expectParams"], object>>
  ) => PrimitiveType<D["returns"]>;

/**
 * Declaration for method parameters.
 *
 * @typeparam RETURNS - The type of the return value.
 * @typeparam EXPECT_BODY - The type of the expected body.
 * @typeparam EXPECT_QUERY - The type of the expected query.
 * @typeparam EXPECT_PARAMS - The type of the expected parameters.
 *
 * @param expectBody - The expected body.
 * @param expectQuery - The expected query.
 * @param expectParams - The expected parameters.
 * @param returns - The return type.
 */
export interface ParameterDeclaration<
  RETURNS extends TypeInformation<unknown>,
  EXPECT_BODY extends {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  },
  EXPECT_QUERY extends {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  },
  EXPECT_PARAMS extends {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  }
> {
  expectBody?: EXPECT_BODY;
  expectQuery?: EXPECT_QUERY;
  expectParams?: EXPECT_PARAMS;
  returns: RETURNS;
}

/**
 * Converts an Object's type to it's value type.
 */
type Value<T extends Record<string, any>> = T[keyof T];

/**
 * Converts an Object's type to an array of it's value types.
 */
type Values<T extends Record<string, any>> = Value<T>[];

/**
 * A map of modules of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 *
 * @see ModuleBuilderMap
 */
export type ModuleMap<
  T extends RsterApiModule<any, any> = RsterApiModule<any, any>
> = {
  [key: string]: T;
};

/**
 * A map of methods of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 *
 * @typeparam T - The type of the method.
 *
 * @see MethodBuilderMap
 */
export type MethodMap<T extends RsterApiMethod<any> = RsterApiMethod<any>> = {
  [key: string]: T;
};

/**
 * A map of modules of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 * This is the implementation for the builders
 *
 * @typeparam T - The type of the module builder context.
 *
 * @see ModuleMap
 */
export type ModuleBuilderMap<T extends RsterApiModuleBuilderContext<any, any>> =
  {
    [key: string]: T;
  };

/**
 * A map of methods of the api or it's submodules. (Contained once in each module and submodule and once on the api itself)
 * This is the implementation for the builders
 *
 * @typeparam T - The type of the method builder context.
 *
 * @see MethodMap
 */
export type MethodBuilderMap<T extends RsterApiMethodBuilderContext<any>> = {
  [key: string]: T;
};

/**
 * A type to convert an array of objects with the key 'K' property to an object with the key 'K' property.
 * This is used to help typescript infer the type of the object when using the `ArrayFinder` function.
 *
 * @typeparam T - The type of elements in the array.
 * @typeparam K - The key of the property to be used as the key for accessing elements in the array.
 */
export type ArrayToObject<T, K extends keyof T> = {
  [P in T[K] as string]: Extract<T, Record<K, P>>;
};

export type NoNever<TYPE, ALTERNATIVE> = TYPE extends never
  ? ALTERNATIVE
  : TYPE;

/**
 * Creates a proxy object that allows accessing elements in the array using a specified property as the key.
 *
 * @typeparam T - The type of elements in the array.
 * @typeparam K - The key of the property to be used as the key for accessing elements in the array.
 * @param array - The array of elements.
 * @param property - The property to be used as the key for accessing elements in the array.
 * @returns A proxy object with keys based on the specified property and values of type `T`.
 */
export function ArrayFinder<T, K extends keyof T>(
  array: T[],
  property: K
): ArrayToObject<T, K> {
  const result: any = {};
  for (const item of array) {
    result[item[property] as string] = item;
  }

  return new Proxy(result, {
    get: (target, prop) => {
      if (typeof prop === "string") {
        return target[prop] || undefined;
      }
      return target[prop as keyof typeof result];
    },
  });
}

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
 * A type for the json representation of the method class. Returned by the `json` method, used to get info about the method.
 *
 * @see RsterApiMethod.json
 * @see RsterApiMethod
 * @see RsterApiJson
 * @see RsterApiModuleJson
 */
export interface RsterApiMethodJson {
  /**
   * The name of the method.
   * @see RsterApiMethod.name
   */
  name: string;

  /**
   * The description of the method.
   * @see RsterApiMethod.description
   */
  description: string[];

  /**
   * The http path of the method. Will be joined with the parent module's path.
   * This is the condition for the method to be used for a request.
   * @see RsterApiMethod.httpPath
   */
  httpPath?: string;

  /**
   * The http method of the method. This is the condition for the method to be used for a request.
   * @see RsterApiMethod.httpMethod
   * @see Method
   */
  httpMethod?: Method;
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
      description(...this.description);

      this.moduleList.forEach((m) => {
        m.rest();
      });

      this.methodList.forEach((m) => {
        m.rest();
      });
    });
  }
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
      description(...this.description);
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

export class RsterApiMethod<
  DECLARATION extends ParameterDeclaration<any, any, any, any>
> {
  constructor(
    public readonly name: string,
    public readonly description: string[],
    public readonly declaration: DECLARATION,
    public readonly httpPath?: string,
    public readonly httpMethod?: Method
  ) {}

  public json(): RsterApiMethodJson {
    return {
      name: this.name,
      description: this.description,
      httpPath: this.httpPath,
      httpMethod: this.httpMethod,
    };
  }

  public rest() {
    description(...this.description);
    declaration({
      name: this.name,
      returnBody: this.declaration.returns,
      expectBody: this.declaration.expectBody,
      expectQuery: this.declaration.expectQuery,
      expectParams: this.declaration.expectParams,
    });
    Context.current.action((req, res) => {
      res.status(200).send("Hello World!");
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
    return ArrayFinder(this.moduleList, "name" as any) as MODULES;
  }

  public get methods() {
    return ArrayFinder(this.methodList, "name" as any) as METHODS;
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

export class RsterApiMethodBuilderContext<
  DECLARATION extends ParameterDeclaration<any, any, any, any>
> {
  private readonly _name: string;
  private readonly _description: string[] = [];
  private _httpPath?: string;
  private _httpMethod?: Method;
  private _declaration: DECLARATION;

  public get name() {
    return this._name;
  }

  private _action?: ActionFunction<DECLARATION>;

  constructor({
    name,
    description = [],
    httpPath,
    httpMethod,
    declaration = {
      expectBody: {},
      expectQuery: {},
      expectParams: {},
      returns: undefinedType,
    } as any as DECLARATION,
    action,
  }: {
    name: string;
    description?: string[];
    httpPath?: string;
    httpMethod?: Method;
    declaration?: DECLARATION;
    action?: ActionFunction<DECLARATION>;
  }) {
    this._name = name;
    this._description = description;
    this._httpPath = httpPath;
    this._httpMethod = httpMethod;
    this._declaration = declaration;
    this._action = action;
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

  public declaration(declaration: DECLARATION) {
    this._declaration = declaration;
  }

  public getDeclaration() {
    return this._declaration;
  }

  public declarationBody(body: {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  }) {
    this._declaration.expectBody = body;
  }

  public declarationBodyParam(name: string, type: TypeInformation<unknown>) {
    if (!this._declaration.expectBody) this._declaration.expectBody = {};
    this._declaration.expectBody![name] = { type, optional: false };
  }

  public declarationBodyParamOptional(
    name: string,
    type: TypeInformation<unknown>
  ) {
    if (!this._declaration.expectBody) this._declaration.expectBody = {};
    this._declaration.expectBody![name] = { type, optional: true };
  }

  public declarationQuery(query: {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  }) {
    this._declaration.expectQuery = query;
  }

  public declarationQueryParam(name: string, type: TypeInformation<unknown>) {
    if (!this._declaration.expectQuery) this._declaration.expectQuery = {};
    this._declaration.expectQuery![name] = { type, optional: false };
  }

  public declarationQueryParamOptional(
    name: string,
    type: TypeInformation<unknown>
  ) {
    if (!this._declaration.expectQuery) this._declaration.expectQuery = {};
    this._declaration.expectQuery![name] = { type, optional: true };
  }

  public declarationParams(params: {
    [key: string]: { type: TypeInformation<unknown>; optional: boolean };
  }) {
    this._declaration.expectParams = params;
  }

  public declarationParam(name: string, type: TypeInformation<unknown>) {
    if (!this._declaration.expectParams) this._declaration.expectParams = {};
    this._declaration.expectParams![name] = { type, optional: false };
  }

  public declarationParamOptional(
    name: string,
    type: TypeInformation<unknown>
  ) {
    if (!this._declaration.expectParams) this._declaration.expectParams = {};
    this._declaration.expectParams![name] = { type, optional: true };
  }

  public action(action: ActionFunction<DECLARATION>) {
    this._action = action;
  }

  public generate() {
    if (this._declaration === undefined)
      throw new Error("No declaration for method " + this._name);
    return new RsterApiMethod(
      this._name,
      this._description,
      this._declaration,
      this._httpPath,
      this._httpMethod
    ) as RsterApiMethodBuilderContextToRsterApiMethod<this>;
  }
}

export type RsterApiBuilderContextToRsterApi<
  T extends RsterApiBuilderContext<any, any>
> = RsterApi<
  RsterApiModuleBuilderContextMapToRsterApiModuleMap<T["modules"]>,
  RsterApiMethodBuilderContextMapToRsterApiMethodMap<T["methods"]>
>;

export type RsterApiModuleBuilderContextToRsterApiModule<
  T extends RsterApiModuleBuilderContext<any, any>
> = RsterApiModule<
  RsterApiModuleBuilderContextMapToRsterApiModuleMap<T["modules"]>,
  RsterApiMethodBuilderContextMapToRsterApiMethodMap<T["methods"]>
>;

export type RsterApiModuleBuilderContextMapToRsterApiModuleMap<
  T extends ModuleBuilderMap<RsterApiModuleBuilderContext<any, any>>
> = {
  [K in keyof T]: RsterApiModuleBuilderContextToRsterApiModule<T[K]>;
};

export type RsterApiMethodBuilderContextToRsterApiMethod<
  T extends RsterApiMethodBuilderContext<any>
> = RsterApiMethod<ReturnType<T["getDeclaration"]>>;

export type RsterApiMethodBuilderContextMapToRsterApiMethodMap<
  T extends MethodBuilderMap<RsterApiMethodBuilderContext<any>>
> = {
  [K in keyof T]: RsterApiMethodBuilderContextToRsterApiMethod<T[K]>;
};

export type RsterApiBuilder<T extends RsterApiBuilderContext<any, any>> = (
  this: T
) => void;
export type RsterApiModuleBuilder<
  T extends RsterApiModuleBuilderContext<
    any,
    any
  > = RsterApiModuleBuilderContext<any, any>
> = (this: T) => void;
export type RsterApiMethodBuilder<
  T extends RsterApiMethodBuilderContext<any> = RsterApiMethodBuilderContext<any>
> = (this: T) => void;

export function buildRsterApi(builder: RsterApiBuilder<any>) {
  const context = new RsterApiBuilderContext({});
  builder.call(context);
  return context.generate();
}

export function api<
  MODULES extends ModuleBuilderMap<RsterApiModuleBuilderContext<any, any>>,
  METHODS extends MethodBuilderMap<RsterApiMethodBuilderContext<any>>
>(
  {
    version,
    name,
    description,
    modules,
    methods,
  }: {
    version?: string;
    name?: string;
    description?: string[];
    modules?: Values<MODULES>;
    methods?: Values<METHODS>;
  },
  builder?: RsterApiBuilder<RsterApiBuilderContext<MODULES, METHODS>>
) {
  const context = new RsterApiBuilderContext({
    version,
    name,
    description,
    modules,
    methods,
  }) as RsterApiBuilderContext<MODULES, METHODS>;

  if (builder) builder.call(context);
  return context;
}

export function module<
  MODULES extends ModuleBuilderMap<any>,
  METHODS extends MethodBuilderMap<any>
>(
  {
    name,
    description,
    httpPath,
    httpMethod,
    modules,
    methods,
  }: {
    name: string;
    description?: string[];
    httpPath?: string;
    httpMethod?: Method;
    modules?: Values<MODULES>;
    methods?: Values<METHODS>;
  },
  builder?: RsterApiModuleBuilder
) {
  const context = new RsterApiModuleBuilderContext<MODULES, METHODS>({
    name,
    description,
    httpPath,
    httpMethod,
    modules,
    methods,
  });

  if (builder) builder.call(context);
  return context;
}

export function method<
  DECLARATION extends ParameterDeclaration<any, any, any, any>
>(
  {
    name,
    description,
    httpPath,
    httpMethod,
    declaration,
    action,
  }: {
    name: string;
    description?: string[];
    httpPath?: string;
    httpMethod?: Method;
    declaration: DECLARATION;
    action?: ActionFunction<DECLARATION>;
  },
  builder?: RsterApiMethodBuilder<RsterApiMethodBuilderContext<DECLARATION>>
): RsterApiMethodBuilderContext<DECLARATION> {
  const context = new RsterApiMethodBuilderContext<DECLARATION>({
    name,
    description,
    httpPath,
    httpMethod,
    declaration,
    action,
  });

  if (builder) builder.call(context);
  return context;
}
