import { Request, Response } from "../basic/common";
import { Context } from "../basic/context";
import crypto from "crypto";
import { $409 } from "../basic/error";

// Basic authentification verification function

type AuthentificationVerificationFunction<T = unknown> = (
  req: Request,
  res: Response,
  ctx: Context
) => T | false | Promise<T | false>;

declare module "../basic/context" {
  interface Context {
    /**
     * Make this context need authentification to pass. All sub-contexts will also need authentification.
     * Will not check permissions, just that a valid authentification token is present.
     *
     * @param verificationFunction The function that will be called to verify the authentification token.
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
     */
    permissions(permission: Permission | Permission[]): void;

    /**
     * Returns the list of required permissions for the user to access this context.
     */
    permissions(): Permission[];
  }
}

declare module "../basic/common" {
  /**
   * The authentification token's data.
   */
  interface Request {
    token_data: unknown;
  }
}

Context.prototype.useAuthentification = function (
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
};

Context.prototype.permissions = function (
  permission?: Permission | Permission[]
) {
  const required_permissions = this.data("required_permissions") ?? [];

  if (permission === undefined) return required_permissions;

  if (Array.isArray(permission)) {
    required_permissions.push(...permission);
  }
  required_permissions.push(permission);
  this.setData("required_permissions", required_permissions);
  this.field("required_permissions", required_permissions);
};

export type JsonWebTokenTester<T> = (token: JsonWebTokenData) => T;

export type JsonWebTokenData = Record<string, unknown>;

export type Permission = string;
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

export abstract class JsonWebTokenProperty<
  TEST_ARGS,
  CREATION_ARGS,
  JWT_PROPS extends JsonWebTokenData
> {
  constructor() {}
  public abstract check(jwt: JWT_PROPS, args: TEST_ARGS): boolean;
  public abstract transform(
    jwt: JsonWebTokenData,
    args: CREATION_ARGS
  ): JWT_PROPS;
}

export class JsonWebTokenPropertyExpireAt extends JsonWebTokenProperty<
  Record<string, never>,
  { duration: number } | { expire_at: number },
  { exp: number }
> {
  constructor() {
    super();
  }
  public check(jwt: { exp: number }): boolean {
    return jwt.exp > Date.now();
  }

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

export class JsonWebTokenPropertyPermissions extends JsonWebTokenProperty<
  { permissions_required: Permission[] },
  { permissions: Permission[] },
  { perms: Permission[] }
> {
  constructor() {
    super();
  }
  public check(
    jwt: { perms: Permission[] },
    { permissions_required }: { permissions_required: Permission[] }
  ) {
    return permissions_required.every((permission) =>
      permissionIncluded(jwt.perms, permission)
    );
  }

  public transform(
    jwt: JsonWebTokenData,
    args: { permissions: Permission[] }
  ): { perms: Permission[] } {
    return { ...jwt, perms: args.permissions };
  }
}

type TokenTypeForProperty<
  T extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>
> = T extends JsonWebTokenProperty<unknown, unknown, infer JWT_PROPS>
  ? JWT_PROPS
  : never;

type TokenTypeMatchingForAllProperties<
  PROPS extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>[]
> = PROPS extends Array<infer T>
  ? T extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>
    ? TokenTypeForProperty<T>
    : never
  : never;

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

type TEST_ARGS_FOR_ALL_PROPERTIES<
  PROPS extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>[]
> = PROPS extends Array<infer T>
  ? T extends JsonWebTokenProperty<unknown, infer TEST_ARGS, JsonWebTokenData>
    ? TEST_ARGS
    : never
  : never;

export class JsonWebTokenManager<
  PROPS extends JsonWebTokenProperty<unknown, unknown, JsonWebTokenData>[],
  JWT_PROPS extends JsonWebTokenData &
    TokenTypeMatchingForAllProperties<PROPS> = TokenTypeMatchingForAllProperties<PROPS>,
  CREATION_ARGS extends CREATION_ARGS_FOR_ALL_PROPERTIES<PROPS> = CREATION_ARGS_FOR_ALL_PROPERTIES<PROPS>,
  TEST_ARGS extends TEST_ARGS_FOR_ALL_PROPERTIES<PROPS> = TEST_ARGS_FOR_ALL_PROPERTIES<PROPS>
> {
  constructor(
    private readonly secret: string,
    private readonly properties: PROPS = [] as unknown as PROPS
  ) {}

  public create(args: CREATION_ARGS): string {
    let jwt: JsonWebTokenData = {};

    for (const property of this.properties) {
      jwt = { ...jwt, ...property.transform(jwt, args) };
    }

    return this.sign(jwt as JWT_PROPS);
  }

  public verify(token: string, args: TEST_ARGS): JWT_PROPS {
    const jwt = this.unpack(token) as JWT_PROPS;

    for (const property of this.properties) {
      if (!property.check(jwt, args)) throw $409("Invalid token");
    }

    return jwt;
  }

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

  private unpack(token: string): JWT_PROPS {
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
