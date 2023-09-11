import { $400, Context } from "@rster/basic";
import { Method } from "@rster/common";
import {
  AllowAnyTypeInformation,
  TypeInformation,
  undefinedType,
} from "@rster/types";
import { RsterApiMethodBuilderContextToRsterApiMethod } from "./conversion_types";
import { ActionFunction, ParameterDeclaration } from "./types";
import "@rster/info";

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

  /**
   * The declaration of the method.
   * @see RsterApiMethod.declaration
   * @see ParameterDeclaration
   */
  declaration: {
    /**
     * The declaration of the body of the request.
     * @see ParameterDeclaration.expectBody
     * @see ParameterDeclaration
     */
    expectBody?: {
      [key: string]: unknown;
    };

    /**
     * The declaration of the query of the request.
     * @see ParameterDeclaration.expectQuery
     * @see ParameterDeclaration
     */
    expectQuery?: {
      [key: string]: unknown;
    };

    /**
     * The declaration of the params of the request.
     * @see ParameterDeclaration.expectParams
     * @see ParameterDeclaration
     */
    expectParams?: {
      [key: string]: unknown;
    };

    /**
     * The declaration of the return value of the method.
     * @see ParameterDeclaration.returns
     * @see ParameterDeclaration
     */
    returns?: unknown;
  };
}

export class RsterApiMethod<
  DECLARATION extends ParameterDeclaration<
    AllowAnyTypeInformation,
    {
      [key: string]: { type: TypeInformation<unknown>; optional: boolean };
    },
    {
      [key: string]: { type: TypeInformation<unknown>; optional: boolean };
    },
    {
      [key: string]: { type: TypeInformation<unknown>; optional: boolean };
    }
  >
> {
  constructor(
    public readonly name: string,
    public readonly description: string[],
    public readonly declaration: DECLARATION,
    public readonly httpPath?: string,
    public readonly httpMethod?: Method,
    public readonly action?: ActionFunction<DECLARATION>
  ) {}

  public json(): RsterApiMethodJson {
    return {
      name: this.name,
      description: this.description,
      httpPath: this.httpPath,
      httpMethod: this.httpMethod,
      declaration: {
        expectBody: this.declaration.expectBody
          ? Object.entries(this.declaration.expectBody)
              .map(([key, value]) => ({
                [key]: {
                  type: (
                    value as { type: AllowAnyTypeInformation }
                  ).type.json(),

                  optional: (value as { optional: boolean }).optional,
                },
              }))
              .reduce((prev, curr) => ({ ...prev, ...curr }), {})
          : undefined,
        expectQuery: this.declaration.expectQuery
          ? Object.entries(this.declaration.expectQuery)
              .map(([key, value]) => ({
                [key]: {
                  type: (
                    value as { type: AllowAnyTypeInformation }
                  ).type.json(),

                  optional: (value as { optional: boolean }).optional,
                },
              }))
              .reduce((prev, curr) => ({ ...prev, ...curr }), {})
          : undefined,
        expectParams: this.declaration.expectParams
          ? Object.entries(this.declaration.expectParams)
              .map(([key, value]) => ({
                [key]: {
                  type: (
                    value as { type: AllowAnyTypeInformation }
                  ).type.json(),

                  optional: (value as { optional: boolean }).optional,
                },
              }))
              .reduce((prev, curr) => ({ ...prev, ...curr }), {})
          : undefined,
        returns: this.declaration.returns?.json(),
      },
    };
  }

  public rest(ctx?: Context) {
    ctx = ctx ?? Context.current;

    ctx.description(...this.description);
    ctx.declaration({
      name: this.name,
      returnBody: this.declaration.returns,
      expectBody: this.declaration.expectBody,
      expectQuery: this.declaration.expectQuery,
      expectParams: this.declaration.expectParams,
    });
    ctx.action(async (req, res) => {
      const params = req.params;

      if (this.declaration.expectBody) {
        for (const [key, value] of Object.entries(
          this.declaration.expectBody
        )) {
          if (value.optional) continue;
          if (req.body[key] === undefined)
            throw $400(`Missing body parameter ${key}`);

          const type = (value as { type: TypeInformation<unknown> }).type;
          if (!type.check(req.body[key]))
            throw $400(
              `Invalid body parameter ${key}: Expected ${type.json()}`
            );

          params[key] = req.body[key];
        }
      }

      if (this.declaration.expectQuery) {
        for (const [key, value] of Object.entries(
          this.declaration.expectQuery
        )) {
          if (value.optional) continue;
          if (req.query[key] === undefined)
            throw $400(`Missing query parameter ${key}`);

          const type = (value as { type: TypeInformation<unknown> }).type;
          if (!type.check(req.query[key]))
            throw $400(
              `Invalid query parameter ${key}: Expected ${type.json()}`
            );

          params[key] = req.query[key];
        }
      }

      if (this.declaration.expectParams) {
        for (const [key, value] of Object.entries(
          this.declaration.expectParams
        )) {
          if (value.optional) continue;
          if (req.params[key] === undefined) throw $400(`Missing param ${key}`);

          const type = (value as { type: TypeInformation<unknown> }).type;
          if (!type.check(req.params[key]))
            throw $400(`Invalid param ${key}: Expected ${type.json()}`);

          params[key] = req.params[key];
        }
      }

      const result = await this.action?.(params);
      res.status(200).json(result).end(); // TODO: Handle export of non-json-compatible types
    });
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
      returns: undefinedType(),
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
      this._httpMethod,
      this._action!
    ) as RsterApiMethodBuilderContextToRsterApiMethod<this>;
  }
}
