/**
 * Throw this error to return an HTTP error response.
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 */
export class HttpError<T extends number = number> extends Error {
  constructor(public readonly status: T, message: string) {
    super(message);
  }
}

export const HTTP_ERROR_MESSAGES = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  410: "Gone",
  429: "Too Many Requests",
  500: "Internal Server Error",
};

export type ErrorFunction<T extends number> = (message: string) => HttpError;

export function $<T extends number>(status: number): ErrorFunction<T> {
  return (message: string) => new HttpError(status, message);
}

export const ErrorFunctions = new Proxy(
  {},
  {
    get: (target, name: string) => {
      if (name === "create" || name === "$") {
        return $;
      }

      if (name.startsWith("$")) {
        const status = parseInt(name.substr(1));
        if (!isNaN(status)) {
          return $(status);
        }

        throw new Error(`Unknown error function ${name}`);
      }

      if (parseInt(name) > 0) {
        return $(parseInt(name));
      }

      throw new Error(`Unknown error function ${name}`);
    },
  }
) as {
  create: <T extends number>(status: number) => ErrorFunction<T>;
  $: <T extends number>(status: number) => ErrorFunction<T>;
  [key: number]: ErrorFunction<number>;
  $400: ErrorFunction<400>;
  $401: ErrorFunction<401>;
  $403: ErrorFunction<403>;
  $404: ErrorFunction<404>;
  $405: ErrorFunction<405>;
  $409: ErrorFunction<409>;
  $410: ErrorFunction<410>;
  $429: ErrorFunction<429>;
  $500: ErrorFunction<500>;
};

/**
 * 400 Bad Request
 *
 * ```js
 * throw $400('Invalid request');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
 */
export const $400 = ErrorFunctions.$400;

/**
 * 401 Unauthorized
 *
 * ```js
 * throw $401('Unauthorized');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401
 */
export const $401 = ErrorFunctions.$401;

/**
 * 403 Forbidden
 *
 * ```js
 * throw $403('Forbidden');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403
 */
export const $403 = ErrorFunctions.$403;

/**
 * 404 Not Found
 *
 * ```js
 * throw $404('Not found');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404
 */
export const $404 = ErrorFunctions.$404;

/**
 * 405 Method Not Allowed
 *
 * ```js
 * throw $405('Method not allowed');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
 */
export const $405 = ErrorFunctions.$405;

/**
 * 409 Conflict
 *
 * ```js
 * throw $409('Conflict');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409
 */
export const $409 = ErrorFunctions.$409;

/**
 * 410 Gone
 *
 * ```js
 * throw $410('Gone');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/410
 */
export const $410 = ErrorFunctions.$410;

/**
 * 429 Too Many Requests
 *
 * ```js
 * throw $429('Too many requests');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
 */
export const $429 = ErrorFunctions.$429;

/**
 * 500 Internal Server Error
 *
 * ```js
 * throw $500('Internal server error');
 * ```
 *
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 *
 * @param message the error message
 * @returns the error
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500
 */
export const $500 = ErrorFunctions.$500;
