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

export class JsonWebTokenManager<T> {
  constructor(private secret: string) {}

  public sign(payload: T): string {
    const payload_str = JSON.stringify(payload);
    const signature = crypto
      .createHash("sha512")
      .update(payload_str)
      .update(this.secret)
      .digest("base64");

    const payload_b64 = Buffer.from(payload_str).toString("base64");
    return `${payload_b64}:${signature}`;
  }

  public verify(token: string): T {
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

  public dataOfRequest(req: Request): T {
    return req.token_data as T;
  }

  public middleware(): AuthentificationVerificationFunction<T> {
    return (req, res) => {
      const token = req.headers.authorization;
      if (!token) return false;
      if (!token.startsWith("Bearer ")) return false;
      const token_data = this.verify(token.slice(7));
      return token_data;
    };
  }
}

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

export class PermissionedJsonWebTokenManager<
  T extends {
    permissions: Permission[];
  }
> extends JsonWebTokenManager<T> {
  public middleware(): AuthentificationVerificationFunction<T> {
    return (req, _res, ctx) => {
      const token = req.headers.authorization;
      if (!token) return false;
      if (!token.startsWith("Bearer ")) return false;
      const token_data = this.verify(token.slice(7));
      if (!token_data.permissions) return false;
      if (!Array.isArray(token_data.permissions)) return false;

      const required_permissions = ctx.permissions();
      if (required_permissions.length === 0) return token_data;

      for (const required_permission of required_permissions) {
        if (
          !token_data.permissions.find((p) =>
            permissionIncluded(p, required_permission)
          )
        )
          return false;
      }

      return token_data;
    };
  }
}
