import { Request, Response } from "../basic/common";
import { Context } from "../basic/context";
import crypto from "crypto";
import { $409 } from "../basic/error";

// Basic authentification verification function

type AuthentificationVerificationFunction<T = unknown> = (
  req: Request,
  res: Response
) => T | false | Promise<T | false>;

declare module "../basic/context" {
  interface Context {
    useAuthentification(
      verificationFunction: AuthentificationVerificationFunction
    ): void;
  }
}

declare module "../basic/common" {
  interface Request {
    token_data: unknown;
  }
}

Context.prototype.useAuthentification = function (
  verificationFunction: AuthentificationVerificationFunction
) {
  this.use(async (req, res, next) => {
    const verified = await verificationFunction(req, res);
    if (verified !== false) {
      req.token_data = verified;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" }).end();
    }
  });
};

export class JsonTokenManager<T> {
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
