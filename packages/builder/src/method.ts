import {
  $400,
  Context,
  ContextConditionMethod,
  ContextConditionPath,
} from "@rster/basic";
import { Method } from "@rster/common";
import {
  AllowAnyTypeInformation,
  AnyTypeInformation,
  TypeInformation,
} from "@rster/types";
import {
  ActionFunction,
  AnyParameterDeclaration,
  RsterArgsType,
  ParameterDeclaration,
  RsterReturnType,
  t,
} from "./types";
import "@rster/info";

/**
 * Utility type to remove all optional properties from a type.
 */
type RemoveOptionalProperties<T> = {
  [K in keyof T as T[K] extends undefined | null ? never : K]: T[K];
};

/**
 * Test if an object has any required properties. (so `{}` would return false, {a?: 1} would also return false, {a: 1} would return true)
 */
type NeedsProperty<T> = keyof RemoveOptionalProperties<T> extends never
  ? false
  : true;

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

/**
 * Rster method class. Used to create a method with `@rster/builder`.
 *
 * _We use type parameters to more specifically index the typing of the method. This allows us to get the correct typing for the `native` method. From a functional perspective, the type parameters are not needed._
 * @typeParam NAME - The name of the method.
 * @typeParam DECLARATION - The declaration of the method.
 */
export class RsterApiMethod<
  NAME extends string,
  DECLARATION extends AnyParameterDeclaration
> {
  /**
   * The http path of the method. Does not include the parent module's path, only the path for the method's condition.
   */
  public readonly httpPath: string;

  /**
   * The constructor of the {@link RsterApiMethod} class.
   * @param name The name of the method.
   * @param description The description of the method.
   * @param declaration The declaration of the method.
   * @param httpPath The http path of the method. Does not include the parent module's path, only the path for the method's condition. If not provided, it will be generated from the name and declaration.
   * @param httpMethod The http method of the method. If not provided, it will be defaulted to ALL.
   * @param action The action of the method. If not provided, it will be defaulted to a method that throws an error.
   */
  constructor(
    /**
     * The name of the method.
     */
    public readonly name: NAME,

    /**
     * The description of the method.
     */
    public readonly description: string[],

    /**
     * The declaration of the method.
     */
    public readonly declaration: DECLARATION,
    httpPath?: string,

    /**
     * The http method of the method. If not provided, it will be defaulted to ALL.
     */
    public readonly httpMethod?: Method,

    /**
     * The action of the method. If not provided, it will be defaulted to a method that throws an error.
     */
    public readonly action?: ActionFunction<DECLARATION>
  ) {
    if (!httpPath) {
      // Generate httpPath from name and declaration (expectParams)

      const name = this.name;
      const params = Object.keys(this.declaration.expectParams ?? {})
        .map((it) => `:${it}`)
        .join("/");
      const httpPath = `/${name}${params ? `/${params}` : ""}`;
      this.httpPath = httpPath;
    } else this.httpPath = httpPath;
  }

  /**
   * Get the json representation of the method. Used to get info about the method.
   * @returns The json representation of the method.
   * @see RsterApiMethodJson
   */
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

                  required: (value as { required: boolean }).required,
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

                  required: (value as { required: boolean }).required,
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

                  required: (value as { required: boolean }).required,
                },
              }))
              .reduce((prev, curr) => ({ ...prev, ...curr }), {})
          : undefined,
        returns: this.declaration.returns?.json(),
      },
    };
  }

  /**
   * Input the method into a {@link Context} object. This will add the method to the context, and it will be used for requests.
   * Defaults to the current context.
   * @param ctx The context to add the method to. Defaults to the current context.
   */
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
        returnBody: declaration.returns as AnyTypeInformation,
        expectBody: declaration.expectBody,
        expectQuery: declaration.expectQuery,
        expectParams: declaration.expectParams,
      });
      this.action(async (req, res) => {
        const params = req.params ?? {};
        const body = req.body ?? {};
        const query = req.query ?? {};

        if (declaration.expectBody) {
          for (const [key, value] of Object.entries(declaration.expectBody)) {
            if (!value.required && body[key] === undefined) continue;
            if (body[key] === undefined)
              throw $400(`Missing body parameter ${key}`);

            const type = (value as { type: AllowAnyTypeInformation }).type;
            if (!type.check(body[key]))
              throw $400(
                `Invalid body parameter ${key}: Expected ${JSON.stringify(
                  type.json()
                )}`
              );

            params[key] = body[key];
          }
        }

        if (declaration.expectQuery) {
          for (const [key, value] of Object.entries(declaration.expectQuery)) {
            if (!value.required && query[key] === undefined) continue;
            if (query[key] === undefined)
              throw $400(`Missing query parameter ${key}`);

            const type = (value as { type: AllowAnyTypeInformation }).type;
            if (!type.check(query[key]))
              throw $400(
                `Invalid query parameter ${key}: Expected ${JSON.stringify(
                  type.json()
                )}`
              );

            params[key] = query[key];
          }
        }

        if (declaration.expectParams) {
          for (const [key, value] of Object.entries(declaration.expectParams)) {
            if (!value.required && params[key] === undefined) continue;
            if (params[key] === undefined)
              throw $400(`Missing path parameter ${key}`);

            const type = (value as { type: AllowAnyTypeInformation }).type;
            if (!type.check(params[key]))
              // This should basically never happen if it has the right type
              throw $400(
                `Invalid param ${key}: Expected ${JSON.stringify(type.json())}`
              );
          }
        }

        const result = await action?.(params);
        const exported = declaration.returns?.exportToJson(result);
        res.status(200).json(exported).end();
      });
    });
  }

  /**
   * The native method of the method. This method can be used to call the method directly, without using the rest api.
   * @returns The native method of the method.
   */
  public native() {
    return ((args?: RsterArgsType<DECLARATION>) => {
      if (!this.action) throw new Error("No action defined");

      // Check args
      if (this.declaration.expectBody) {
        for (const [key, value] of Object.entries(
          this.declaration.expectBody
        )) {
          if (!value.required && args?.[key as keyof typeof args] === undefined)
            continue;
          if (args?.[key as keyof typeof args] === undefined)
            throw $400(`Missing body parameter ${key}`);

          const type = (value as { type: AllowAnyTypeInformation }).type;
          if (!type.check(args[key as keyof typeof args]))
            throw $400(
              `Invalid body parameter ${key}: Expected ${JSON.stringify(
                type.json()
              )}`
            );
        }
      }

      if (this.declaration.expectQuery) {
        for (const [key, value] of Object.entries(
          this.declaration.expectQuery
        )) {
          if (!value.required && args?.[key as keyof typeof args] === undefined)
            continue;
          if (args?.[key as keyof typeof args] === undefined)
            throw $400(`Missing query parameter ${key}`);
          if (
            !(value as { type: AllowAnyTypeInformation }).type.check(
              args[key as keyof typeof args]
            )
          )
            throw $400(
              `Invalid query parameter ${key}: Expected ${JSON.stringify(
                (value as { type: AllowAnyTypeInformation }).type.json()
              )}`
            );
        }
      }

      if (this.declaration.expectParams) {
        for (const [key, value] of Object.entries(
          this.declaration.expectParams
        )) {
          if (!value.required && args?.[key as keyof typeof args] === undefined)
            continue;
          if (args?.[key as keyof typeof args] === undefined)
            throw $400(`Missing path parameter ${key}`);
          if (
            !(value as { type: AllowAnyTypeInformation }).type.check(
              args[key as keyof typeof args]
            )
          )
            throw $400(
              `Invalid path parameter ${key}: Expected ${JSON.stringify(
                (value as { type: AllowAnyTypeInformation }).type.json()
              )}`
            );
        }
      }

      return this.action(args ?? ({} as RsterArgsType<DECLARATION>));
    }) as NeedsProperty<RsterArgsType<DECLARATION>> extends true
      ? (args: t<RsterArgsType<DECLARATION>>) => RsterReturnType<DECLARATION>
      : (args?: t<RsterArgsType<DECLARATION>>) => RsterReturnType<DECLARATION>;
  }
}

/**
 * Shortcut function to create a new {@link RsterApiMethod} object.
 * @param name The name of the method.
 * @param description The description of the method.
 * @param declaration The declaration of the method.
 * @param httpPath The http path of the method. Does not include the parent module's path, only the path for the method's condition. If not provided, it will be generated from the name and declaration.
 * @param httpMethod The http method of the method. If not provided, it will be defaulted to ALL.
 * @param action The action of the method. If not provided, it will be defaulted to a method that throws an error.
 * @returns The new {@link RsterApiMethod} object.
 */
export function method<
  NAME extends string,
  DECLARATION extends ParameterDeclaration<
    AllowAnyTypeInformation,
    {
      [key: string]: { type: AllowAnyTypeInformation; required: boolean };
    },
    {
      [key: string]: { type: AllowAnyTypeInformation; required: boolean };
    },
    {
      [key: string]: { type: AllowAnyTypeInformation; required: boolean };
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
