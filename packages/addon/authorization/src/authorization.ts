import { Request, Response } from "@rster/common";
import crypto from "crypto";
import { $409, Context } from "@rster/basic";
import "@rster/info";

// Basic authentification verification function
/**
 * The function that will be called to verify the authentification token.
 *
 * @param req The request.
 * @param res The response.
 * @param ctx The context.
 *
 * @returns The token's data, false if the token is invalid or a promise that resolves to the token's data or false.
 *
 * @since 0.1.0
 */
type AuthentificationVerificationFunction<T = unknown> = (
  req: Request,
  res: Response,
  ctx: Context
) => T | false | Promise<T | false>;

declare module "@rster/basic" {
  interface Context {
    /**
     * Make this context need authentification to pass. All sub-contexts will also need authentification.
     * Will not check permissions, just that a valid authentification token is present.
     *
     * @param verificationFunction The function that will be called to verify the authentification token.
     *
     * @since 0.1.0
     */
    useAuthentification(
      verificationFunction: AuthentificationVerificationFunction
    ): void;

    /**
     * Adds a permission to the list of required permissions for the user to access this context.
     * All requests without a valid authentification token or without the required permissions will be rejected.
     *
     * Has no effect if useAuthentification() is not called with a verification function that supports permissions.
     *
     * @param permission The permission(s) to add to the list of required permissions.
     *
     * @since 0.1.0
     */
    permissions(permission: Permission | Permission[]): void;

    /**
     * Returns the list of required permissions for the user to access this context.
     *
     * @since 0.1.0
     */
    permissions(): Permission[];
  }
}

declare module "@rster/common" {
  /**
   * The authentification token's data.
   *
   * @since 0.1.0
   */
  interface Request {
    token_data: unknown;
  }
}

Context.prototype.useAuthentification = function (
  this: Context,
  verificationFunction: AuthentificationVerificationFunction
) {
  this.use(async (req, res, next) => {
    const verified = await verificationFunction(req, res, this);
    if (verified !== false) {
      req.token_data = verified;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" }).end();
    }
  });
} as any;

Context.prototype.permissions = function (
  this: Context,
  permission?: Permission | Permission[]
) {
  const required_permissions =
    (this.data("required_permissions") as Permission[]) ?? [];

  if (permission === undefined) return required_permissions;

  if (Array.isArray(permission)) required_permissions.push(...permission);
  else required_permissions.push(permission);
  this.setData("required_permissions", required_permissions);
  this.field("required_permissions", required_permissions);
} as any;

/**
 * The function that will be called to verify the json web token.
 *
 * @typeParam T The type of the token's data.
 * @param token The token to verify.
 * @returns The data the tokn should contain.
 * @throws Throw an error if the token is invalid.
 *
 * @since 0.1.0
 */
export type JsonWebTokenTester<T> = (token: JsonWebTokenData) => T;

/**
 * The data contained in the json web token.
 *
 * @since 0.1.0
 */
export type JsonWebTokenData = Record<string, unknown>;

/**
 * A permission that can be granted to a user or needed to access a context.
 *
 * @since 0.1.0
 */
export type Permission = string;

/**
 * Function to verify a permission. Returns true if the permission is granted, false otherwise.
 *
 * @param permissions The permissions the user has.
 * @param permission The permission to check.
 *
 * @returns True if the permission is granted, false otherwise.
 *
 * @since 0.1.0
 */
export function permissionIncluded(
  permissions: Permission[] | Permission,
  permission: Permission
): boolean {
  if (Array.isArray(permissions)) {
    return (
      permissions.findIndex((p) => permissionIncluded(p, permission)) !== -1
    );
  } else {
    if (permissions === permission) return true;

    const splitted = permissions.split(".");
    const splitted_permission = permission.split(".");

    if (splitted[splitted.length - 1] !== "*") return false;

    for (let i = 0; i < splitted.length - 1; i++)
      if (splitted[i] !== splitted_permission[i]) return false;

    return true;
  }
}

/**
 * Properties of a JWT
 *
 * @typeParam TEST_ARGS The type of the arguments needed to test the token.
 * @typeParam CREATION_ARGS The type of the arguments needed to create the token.
 * @typeParam JWT_PROPS The type of the token's data.
 *
 * @since 0.1.0
 */
export abstract class JsonWebTokenProperty<
  TEST_ARGS,
  CREATION_ARGS,
  JWT_PROPS extends JsonWebTokenData
> {
  constructor() {}

  /**
   * Checks if the token is valid.
   *
   * @param jwt The JWT to check.
   * @param args The arguments needed to check the token.
   * @returns True if the token is valid, false otherwise.
   *
   * @since 0.1.0
   */
  public abstract check(jwt: JWT_PROPS, args: TEST_ARGS): boolean;

  /**
   * Transforms the token.
   *
   * @param jwt The JWT to transform.
   * @param args The arguments needed to transform the token.
   * @returns The transformed token.
   *
   * @since 0.1.0
   */
  public abstract transform(
    jwt: JsonWebTokenData,
    args: CREATION_ARGS
  ): JWT_PROPS;
}

/**
 * Property map for a JWT containing Expiration date.
 *
 * @typeParam TEST_ARGS The type of the arguments needed to test the token.
 * @typeParam CREATION_ARGS The type of the arguments needed to create the token.
 * @typeParam JWT_PROPS The type of the token's data.
 *
 * @since 0.1.0
 */
export class JsonWebTokenPropertyExpireAt extends JsonWebTokenProperty<
  Record<string, never>,
  { duration: number } | { expire_at: number },
  { exp: number }
> {
  constructor() {
    super();
  }

  /**
   * Checks if the token is valid.
   * @param jwt The JWT to check.
   * @returns true if the token is valid, false otherwise.
   *
   * @since 0.1.0
   */
  public check(jwt: { exp: number }): boolean {
    return jwt.exp > Date.now();
  }

  /**
   * Transforms the JWT by adding an expiration date.
   * @param jwt The JWT to transform.
   * @param args The arguments needed to transform the JWT.
   * @returns The transformed JWT.
   *
   * @since 0.1.0
   */
  public transform(
    jwt: JsonWebTokenData,
    args: { duration: number } | { expire_at: number }
  ): { exp: number } {
    if ("duration" in args) {
      return { ...jwt, exp: Date.now() + args.duration };
    } else {
      return { ...jwt, exp: args.expire_at };
    }
  }
}

/**
 * Property map for a JWT containing permissions.
 *
 * @typeParam TEST_ARGS The type of the arguments needed to test the token.
 * @typeParam CREATION_ARGS The type of the arguments needed to create the token.
 * @typeParam JWT_PROPS The type of the token's data.
 *
 * @since 0.1.0
 */
export class JsonWebTokenPropertyPermissions extends JsonWebTokenProperty<
  { permissions_required: Permission[] },
  { permissions: Permission[] },
  { perms: Permission[] }
> {
  constructor() {
    super();
  }

  /**
   * Tests if the token contains the required permissions.
   * @param jwt The JWT to test.
   * @param param1 The arguments needed to test the token.
   * @returns True if the token contains the required permissions, false otherwise.
   *
   * @since 0.1.0
   */
  public check(
    jwt: {
      /**
       * The permissions the user has.
       *
       * @since 0.1.0
       */
      perms: Permission[];
    },
    {
      permissions_required,
    }: {
      /**
       * The permissions required to access the context.
       *
       * @since 0.1.0
       */
      permissions_required: Permission[];
    }
  ) {
    return permissions_required.every((permission) =>
      permissionIncluded(jwt.perms, permission)
    );
  }

  /**
   * Transforms the JWT by adding the permissions.
   * @param jwt The JWT to transform.
   * @param args The arguments needed to transform the JWT.
   * @returns The transformed JWT.
   *
   * @since 0.1.0
   */
  public transform(
    jwt: JsonWebTokenData,
    args: {
      /**
       * The permissions to add to the JWT.
       *
       * @since 0.1.0
       */
      permissions: Permission[];
    }
  ): { perms: Permission[] } {
    return { ...jwt, perms: args.permissions };
  }
}

/**
 * Gets the type of the token's data. Used internally to create types for the token's data.
 *
 * @since 0.1.0
 */
type TokenTypeForProperty<
  T extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>
> = T extends JsonWebTokenProperty<unknown, unknown, infer JWT_PROPS>
  ? JWT_PROPS
  : never;

/**
 * Transforms an array of TokenTypes to a union of their properties. Used internally to create types for the token's data.
 *
 * @since 0.1.0
 */
type TokenTypeMatchingForAllProperties<
  PROPS extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>[]
> = PROPS extends Array<infer T>
  ? T extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>
    ? TokenTypeForProperty<T>
    : never
  : never;

/**
 * Get the creation args for all given properties. Used internally to create types for the token's data.
 *
 * @since 0.1.0
 *
 */
type CREATION_ARGS_FOR_ALL_PROPERTIES<
  PROPS extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>[]
> = PROPS extends Array<infer T>
  ? T extends JsonWebTokenProperty<
      infer CREATION_ARGS,
      unknown,
      JsonWebTokenData
    >
    ? CREATION_ARGS
    : never
  : never;

/**
 * Get the test args for all given properties. Used internally to create types for the token's data.
 *
 * @since 0.1.0
 */
type TEST_ARGS_FOR_ALL_PROPERTIES<
  PROPS extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>[]
> = PROPS extends Array<infer T>
  ? T extends JsonWebTokenProperty<unknown, infer TEST_ARGS, JsonWebTokenData>
    ? TEST_ARGS
    : never
  : never;

/**
 * Manages the creation and verification of json web tokens.
 *
 * @typeParam PROPS The properties of the token.
 * @typeParam JWT_PROPS The type of the token's data.
 * @typeParam CREATION_ARGS The type of the arguments needed to create the token.
 * @typeParam TEST_ARGS The type of the arguments needed to test the token.
 *
 * @since 0.1.0
 */
export class JsonWebTokenManager<
  PROPS extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>[],
  JWT_PROPS extends JsonWebTokenData &
    TokenTypeMatchingForAllProperties<PROPS> = TokenTypeMatchingForAllProperties<PROPS>,
  CREATION_ARGS extends CREATION_ARGS_FOR_ALL_PROPERTIES<PROPS> = CREATION_ARGS_FOR_ALL_PROPERTIES<PROPS>,
  TEST_ARGS extends TEST_ARGS_FOR_ALL_PROPERTIES<PROPS> = TEST_ARGS_FOR_ALL_PROPERTIES<PROPS>
> {
  /**
   * Creates a new JsonWebTokenManager.
   * @param secret The secret used to sign the token. Must be the same for all instances of the same type and **must** be kept secret.
   * @param properties The properties of the token.
   *
   * @since 0.1.0
   */
  constructor(
    private readonly secret: string,
    private readonly properties: PROPS = [] as unknown as PROPS
  ) {}

  /**
   * Creates a new token.
   * @param args The arguments needed to create the token.
   * @returns The created and signed token.
   *
   * @since 0.1.0
   */
  public create(args: CREATION_ARGS): string {
    let jwt: JsonWebTokenData = {};

    for (const property of this.properties) {
      jwt = { ...jwt, ...property.transform(jwt, args) };
    }

    return this.sign(jwt as JWT_PROPS);
  }

  /**
   * Verifies a token.
   * @param token The token to verify.
   * @param args The arguments needed to verify the token.
   * @returns The token's data.
   * @throws Throws an error if the token is invalid.
   *
   * @since 0.1.0
   */
  public verify(token: string, args: TEST_ARGS): JWT_PROPS {
    const jwt = this.unpack(token) as JWT_PROPS;

    for (const property of this.properties) {
      if (!property.check(jwt, args)) throw $409("Invalid token");
    }

    return jwt;
  }

  /**
   * Signs the token.
   * @param payload The payload to sign.
   * @returns The signed token.
   *
   * @since 0.1.1
   */
  public sign(payload: JWT_PROPS): string {
    const payload_str = JSON.stringify(payload);
    const signature = crypto
      .createHash("sha512")
      .update(payload_str)
      .update(this.secret)
      .digest("base64");

    const payload_b64 = Buffer.from(payload_str).toString("base64");
    return `${payload_b64}:${signature}`;
  }

  /**
   * Unpacks the token.
   * @param token The token to unpack.
   * @returns The token's data.
   * @throws Throws an error if the token is invalid.
   *
   * @since 0.1.1
   */
  public unpack(token: string): JWT_PROPS {
    const splitted = token.split(":");
    if (splitted.length !== 2) throw $409("Invalid token");

    const [payload_b64, signature] = splitted;
    const payload_str = Buffer.from(payload_b64, "base64").toString("utf-8");

    const expected_signature = crypto
      .createHash("sha512")
      .update(payload_str)
      .update(this.secret)
      .digest("base64");

    if (signature !== expected_signature) throw $409("Invalid token");

    return JSON.parse(payload_str);
  }
}
