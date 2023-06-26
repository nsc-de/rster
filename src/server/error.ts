/**
 * Throw this error to return an HTTP error response.
 * 
 * @warning This error should is caught by the framework and sent as an HTTP response. The message therefore should not contain any sensitive information!
 */
export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}


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
export function $400(message: string): HttpError {
  return new HttpError(400, message);
}

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
export function $401(message: string): HttpError {
  return new HttpError(401, message);
}

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
export function $403(message: string): HttpError {
  return new HttpError(403, message);
}

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
export function $404(message: string): HttpError {
  return new HttpError(404, message);
}

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
export function $405(message: string): HttpError {
  return new HttpError(405, message);
}

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
export function $409(message: string): HttpError {
  return new HttpError(409, message);
}

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
export function $410(message: string): HttpError {
  return new HttpError(410, message);
}

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
export function $429(message: string): HttpError {
  return new HttpError(429, message);
}

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
export function $500(message: string): HttpError {
  return new HttpError(500, message);
}
