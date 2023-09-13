import {
  $400,
  Context,
  ContextConditionMethod,
  ContextConditionPath,
} from "@rster/basic";
import { Method } from "@rster/common";
import { AllowAnyTypeInformation, TypeInformation } from "@rster/types";
import {
  ActionFunction,
  AnyParameterDeclaration,
  RsterArgsType,
  ParameterDeclaration,
  RsterReturnType,
} from "./types";
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
  NAME extends string,
  DECLARATION extends AnyParameterDeclaration
> {
  public readonly httpPath: string;
  constructor(
    public readonly name: NAME,
    public readonly description: string[],
    public readonly declaration: DECLARATION,
    httpPath?: string,
    public readonly httpMethod?: Method,
    public readonly action?: ActionFunction<DECLARATION>
  ) {
    if (!httpPath) {
      const name = this.name;
      const params = Object.keys(this.declaration.expectParams ?? {})
        .map((it) => `:${it}`)
        .join("/");
      const httpPath = `/${name}${params ? `/${params}` : ""}`;
      this.httpPath = httpPath;
    } else this.httpPath = httpPath;
  }

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

    const pathCondition = new ContextConditionPath(this.httpPath ?? "");
    const methodCondition = this.httpMethod
      ? new ContextConditionMethod(this.httpMethod)
      : undefined;

    const condition = methodCondition
      ? pathCondition.and(methodCondition)
      : pathCondition;

    const { declaration, action, description, name } = this;

    ctx.when(condition, function () {
      this.description(...description);
      this.declaration({
        name: name,
        returnBody: declaration.returns,
        expectBody: declaration.expectBody,
        expectQuery: declaration.expectQuery,
        expectParams: declaration.expectParams,
      });
      this.action(async (req, res) => {
        const params = req.params;

        if (declaration.expectBody) {
          for (const [key, value] of Object.entries(declaration.expectBody)) {
            if (value.optional && req.body[key] === undefined) continue;
            if (req.body[key] === undefined)
              throw $400(`Missing body parameter ${key}`);

            const type = (value as { type: TypeInformation<unknown> }).type;
            if (!type.check(req.body[key]))
              throw $400(
                `Invalid body parameter ${key}: Expected ${JSON.stringify(
                  type.json()
                )}`
              );

            params[key] = req.body[key];
          }
        }

        if (declaration.expectQuery) {
          for (const [key, value] of Object.entries(declaration.expectQuery)) {
            if (value.optional && req.query[key] === undefined) continue;
            if (req.query[key] === undefined)
              throw $400(`Missing query parameter ${key}`);

            const type = (value as { type: TypeInformation<unknown> }).type;
            if (!type.check(req.query[key]))
              throw $400(
                `Invalid query parameter ${key}: Expected ${JSON.stringify(
                  type.json()
                )}`
              );

            params[key] = req.query[key];
          }
        }

        if (declaration.expectParams) {
          for (const [key, value] of Object.entries(declaration.expectParams)) {
            if (value.optional && req.params[key] === undefined) continue;
            if (req.params[key] === undefined)
              throw $400(`Missing path parameter ${key}`);

            const type = (value as { type: TypeInformation<unknown> }).type;
            if (!type.check(req.params[key]))
              throw $400(
                `Invalid param ${key}: Expected ${JSON.stringify(type.json())}`
              );

            params[key] = req.params[key];
          }
        }

        const result = await action?.(params);
        const exported = declaration.returns?.exportToJson(result);
        res.status(200).json(exported).end();
      });
    });
  }

  public native(): (
    args: RsterArgsType<DECLARATION>
  ) => RsterReturnType<DECLARATION> {
    return this.action as unknown as (
      args: RsterArgsType<DECLARATION>
    ) => RsterReturnType<DECLARATION>;
  }
}

export function method<
  NAME extends string,
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
>(
  name: NAME,
  description: string[],
  declaration: DECLARATION,
  httpPath?: string,
  httpMethod?: Method,
  action?: ActionFunction<DECLARATION>
) {
  return new RsterApiMethod(
    name,
    description,
    declaration,
    httpPath,
    httpMethod,
    action
  );
}
