import rest, { RestfulApi, action, description, when } from "./index.js";
import { Method } from "./common.js";
import { ContextConditionMethod, ContextConditionPath } from "./condition.js";
import { TypeInformation, undefinedType } from "../shared/types.js";

export interface ParameterDeclaration {
  expectBody?: { [key: string]: { type: TypeInformation; optional: boolean } };
  expectQuery?: { [key: string]: { type: TypeInformation; optional: boolean } };
  expectParams?: {
    [key: string]: { type: TypeInformation; optional: boolean };
  };
  returns: TypeInformation;
}

export interface RsterApiJson {
  version: string;
  name: string;
  description: string[];
  modules: RsterApiModuleJson[];
  methods: RsterApiMethodJson[];
}

export interface RsterApiModuleJson {
  name: string;
  description: string[];
  modules: RsterApiModuleJson[];
  methods: RsterApiMethodJson[];
  httpPath?: string;
  httpMethod?: Method;
}

export interface RsterApiMethodJson {
  name: string;
  description: string[];
  httpPath?: string;
  httpMethod?: Method;
}

export class RsterApi {
  constructor(
    public readonly version: string,
    public readonly name: string,
    public readonly description: string[],
    public readonly modules: RsterApiModule[],
    public readonly methods: RsterApiMethod[]
  ) {}

  public json(): RsterApiJson {
    return {
      version: this.version,
      name: this.name,
      description: this.description,
      modules: this.modules.map((m) => m.json()),
      methods: this.methods.map((m) => m.json()),
    };
  }

  public rest(): RestfulApi {
    return rest(() => {
      description(...this.description);

      this.modules.forEach((m) => {
        m.rest();
      });

      this.methods.forEach((m) => {
        m.rest();
      });
    });
  }
}

export class RsterApiModule {
  constructor(
    public readonly name: string,
    public readonly description: string[],
    public readonly modules: RsterApiModule[],
    public readonly methods: RsterApiMethod[],
    public readonly httpPath?: string,
    public readonly httpMethod?: Method
  ) {}

  public json(): RsterApiModuleJson {
    return {
      name: this.name,
      description: this.description,
      modules: this.modules.map((m) => m.json()),
      methods: this.methods.map((m) => m.json()),
      httpPath: this.httpPath,
      httpMethod: this.httpMethod,
    };
  }

  public rest() {
    if (this.httpPath && this.httpMethod) {
      when(
        new ContextConditionPath(this.httpPath).and(
          new ContextConditionMethod(this.httpMethod)
        ),
        () => {
          this.modules.forEach((m) => {
            m.rest();
          });

          this.methods.forEach((m) => {
            m.rest();
          });
        }
      );
    } else if (this.httpPath) {
      when(new ContextConditionPath(this.httpPath), () => {
        this.modules.forEach((m) => {
          m.rest();
        });

        this.methods.forEach((m) => {
          m.rest();
        });
      });
    } else if (this.httpMethod) {
      when(new ContextConditionMethod(this.httpMethod), () => {
        this.modules.forEach((m) => {
          m.rest();
        });

        this.methods.forEach((m) => {
          m.rest();
        });
      });
    } else {
      this.modules.forEach((m) => {
        m.rest();
      });

      this.methods.forEach((m) => {
        m.rest();
      });
    }
  }
}

export class RsterApiMethod {
  constructor(
    public readonly name: string,
    public readonly description: string[],
    public readonly declaration: ParameterDeclaration,
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
    action((req, res) => {
      res.status(200).send("Hello World!");
    });
  }
}

export class RsterApiBuilderContext {
  private _version?: string;
  private _name?: string;
  private _description: string[] = [];
  private readonly _modules: RsterApiModuleBuilderContext[] = [];
  private readonly _methods: RsterApiMethodContext[] = [];

  constructor() {}

  public module(name: string, builder: RsterApiModuleBuilder) {
    const context = new RsterApiModuleBuilderContext(name);
    builder.call(context);
    this._modules.push(context);
  }

  public method(name: string, builder: RsterApiMethodBuilder) {
    const context = new RsterApiMethodContext(name);
    builder.call(context);
    this._methods.push(context);
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
    return this._modules;
  }

  public getMethods() {
    return this._methods;
  }

  public generate(): RsterApi {
    return new RsterApi(
      this._version!,
      this._name!,
      this._description,
      this._modules.map((m) => m.generate()),
      this._methods.map((m) => m.generate())
    );
  }
}

export class RsterApiModuleBuilderContext {
  private readonly _name: string;
  private _description: string[] = [];
  private _httpPath?: string;
  private _httpMethod?: Method;
  private readonly _modules: RsterApiModuleBuilderContext[] = [];
  private readonly _methods: RsterApiMethodContext[] = [];

  constructor(name: string) {
    this._name = name;
  }

  public module(name: string, builder: RsterApiModuleBuilder) {
    const context = new RsterApiModuleBuilderContext(name);
    builder.call(context);
    this._modules.push(context);
  }

  public method(name: string, builder: RsterApiMethodBuilder) {
    const context = new RsterApiMethodContext(name);
    builder.call(context);
    this._methods.push(context);
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

  public generate(): RsterApiModule {
    return new RsterApiModule(
      this._name,
      this._description,
      this._modules.map((m) => m.generate()),
      this._methods.map((m) => m.generate()),
      this._httpPath,
      this._httpMethod
    );
  }
}

export class RsterApiMethodContext {
  private readonly _name: string;
  private readonly _description: string[] = [];
  private _httpPath?: string;
  private _httpMethod?: Method;
  private _declaration: ParameterDeclaration = {
    expectBody: {},
    expectQuery: {},
    expectParams: {},
    returns: undefinedType(),
  };

  constructor(name: string) {
    this._name = name;
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

  public declaration(declaration: ParameterDeclaration) {
    this._declaration = declaration;
  }

  public getDeclaration() {
    return this._declaration;
  }

  public declarationBody(body: {
    [key: string]: { type: TypeInformation; optional: boolean };
  }) {
    this._declaration.expectBody = body;
  }

  public declarationBodyParam(name: string, type: TypeInformation) {
    if (!this._declaration.expectBody) this._declaration.expectBody = {};
    this._declaration.expectBody![name] = { type, optional: false };
  }

  public declarationBodyParamOptional(name: string, type: TypeInformation) {
    if (!this._declaration.expectBody) this._declaration.expectBody = {};
    this._declaration.expectBody![name] = { type, optional: true };
  }

  public declarationQuery(query: {
    [key: string]: { type: TypeInformation; optional: boolean };
  }) {
    this._declaration.expectQuery = query;
  }

  public declarationQueryParam(name: string, type: TypeInformation) {
    if (!this._declaration.expectQuery) this._declaration.expectQuery = {};
    this._declaration.expectQuery![name] = { type, optional: false };
  }

  public declarationQueryParamOptional(name: string, type: TypeInformation) {
    if (!this._declaration.expectQuery) this._declaration.expectQuery = {};
    this._declaration.expectQuery![name] = { type, optional: true };
  }

  public declarationParams(params: {
    [key: string]: { type: TypeInformation; optional: boolean };
  }) {
    this._declaration.expectParams = params;
  }

  public declarationParam(name: string, type: TypeInformation) {
    if (!this._declaration.expectParams) this._declaration.expectParams = {};
    this._declaration.expectParams![name] = { type, optional: false };
  }

  public declarationParamOptional(name: string, type: TypeInformation) {
    if (!this._declaration.expectParams) this._declaration.expectParams = {};
    this._declaration.expectParams![name] = { type, optional: true };
  }

  public generate(): RsterApiMethod {
    if (this._declaration === undefined)
      throw new Error("No declaration for method " + this._name);
    return new RsterApiMethod(
      this._name,
      this._description,
      this._declaration,
      this._httpPath,
      this._httpMethod
    );
  }
}

export type RsterApiBuilder = (this: RsterApiBuilderContext) => void;
export type RsterApiModuleBuilder = (
  this: RsterApiModuleBuilderContext
) => void;
export type RsterApiMethodBuilder = (this: RsterApiMethodContext) => void;

export function buildRsterApi(builder: RsterApiBuilder) {
  const context = new RsterApiBuilderContext();
  builder.call(context);
  return context.generate();
}
