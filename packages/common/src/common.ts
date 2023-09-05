/**
 * @file common.ts - Common types and interfaces for the server.
 * @module common
 */
import { AllOptional } from "@rster/util";
import os from "os";

/**
 * @interface ParsedQs - Parsed query string.
 */
export interface ParsedQs {
  /**
   * @property {string | undefined} [key] - Key of the query string.
   * @property {string | string[] | ParsedQs | ParsedQs[] | undefined} [value] - Value of the query string.
   */
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

export interface Request {
  /**
   * @property {string} baseUrl - The URL path on which a router instance was mounted.
   */
  readonly baseUrl: string;

  /**
   * @property {string} body - The request body.
   */
  readonly body: any;

  /**
   * @property {string} cookies - The request cookies.
   */
  readonly cookies: any;

  /**
   * @property {string} fresh - Indicates whether the request is "fresh".
   * @description It is the opposite of req.stale.
   * @see {@link https://expressjs.com/en/4x/api.html#req.fresh}
   */
  readonly fresh: boolean;

  /**
   * @property {string} hostname - Contains the hostname derived from the Host HTTP header.
   */
  readonly hostname: string;

  /**
   * @property {string} ip - Contains the remote IP address of the request.
   */
  readonly ip: string;

  /**
   * @property {string} ips - When the trust proxy setting does not evaluate to false, this property contains an array of IP addresses, listed in reverse order, that are upstream of the proxy server.
   */
  readonly ips: string[];

  /**
   * @property {string} method - Contains a string corresponding to the HTTP method of the request: GET, POST, PUT, and so on.
   */
  readonly method: string;

  /**
   * @property {string} originalUrl - This property is much like req.url; however, it retains the original request URL, allowing you to rewrite req.url freely for internal routing purposes.
   */
  readonly originalUrl: string;

  /**
   * @property {string} params - This property is an object containing properties mapped to the named route “parameters”. For example, if you have the route /user/:name, then the “name” property is available as req.params.name. This object defaults to {}.
   */
  readonly params: any;

  /**
   * @property {string} path - Contains the path part of the request URL.
   */
  readonly path: string;

  /**
   * @property {string} protocol - Contains the request protocol string: either http or (for TLS requests) https.
   */
  readonly fullPath: string;

  /**
   * @property {string} query - This property is an object containing a property for each query string parameter in the route.
   */
  readonly fullApiPath: string;

  /**
   * @property {string} route - Contains the currently-matched route, a string.
   */
  readonly protocol: string;

  /**
   * @property {string} secure - A Boolean property that is true if a TLS connection is established.
   */
  readonly secure: boolean;

  /**
   * @property {string} signedCookies - When using cookie-parser middleware, this property contains signed cookies sent by the request, unsigned and ready for use.
   */
  readonly signedCookies: any;

  /**
   * @property {string} stale - Indicates whether the request is “stale,” and is the opposite of req.fresh.
   */
  readonly stale: boolean;

  /**
   * @property {string} subdomains - Contains an array of subdomains in the domain name of the request.
   */
  readonly subdomains: string[];

  /**
   * @property {string} xhr - A Boolean property that is true if the request’s X-Requested-With header field is “XMLHttpRequest”, indicating that the request was issued by a client library such as jQuery.
   */
  readonly xhr: boolean;

  /**
   * @property {string} headers - The request headers.
   */
  readonly headers: IncomingHttpHeaders;

  /**
   * @property {string} accepts - Returns the first accepted type (type/ subtype) as an array of strings in the order of preference.
   */
  accepts(): string[];

  /**
   * @property {string} acceptsCharsets - Returns the charsets that the request accepts, in the order of the client’s preference (most preferred first).
   */
  acceptsCharsets(): string[];

  /**
   * @property {string} acceptsEncodings - Returns the encoding that the request accepts, in the order of the client’s preference (most preferred first).
   */
  acceptsEncodings(): string[];

  /**
   * @property {string} acceptsLanguages - Returns the languages that the request accepts, in the order of the client’s preference (most preferred first).
   */
  acceptsLanguages(): string[];

  /**
   * @property {string} query - The parsed query string.
   */
  readonly query: ParsedQs;

  /**
   * @property {string} get - Returns the specified HTTP request header field (case-insensitive match).
   * @param {string} field - The header field name.
   * @returns {string | undefined} - The header field value.
   */
  get(field: string): string | undefined;

  /**
   * @property {string} header - Returns the specified HTTP request header field (case-insensitive match).
   * @param {string} field - The header field name.
   * @returns {string | undefined} - The header field value.
   */
  is(type: string | string[]): string | false | null;

  /**
   * @property {string} header - Returns the specified HTTP request header field (case-insensitive match).
   * @param {string} field - The header field name.
   * @returns {string | undefined} - The header field value.
   */
  header(field: string): string;
}

/**
 * @interface IncomingHttpHeaders - The HTTP headers.
 * @see {@link https://nodejs.org/api/http.html#http_message_headers}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers}
 */
export interface IncomingHttpHeaders {
  /**
   * @property {string | undefined} accept - Content-Types that are acceptable for the response.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept}
   * @example Accept: text/plain
   * @example Accept: text/html
   * @example Accept: application/json
   */
  accept?: string | undefined;

  /**
   * @property {string | undefined} accept-charset - Character sets that are acceptable.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset}
   * @example Accept-Charset: utf-8
   * @example Accept-Charset: iso-8859-5
   * @example Accept-Charset: utf-8, iso-8859-5;q=0.8, unicode-1-1;q=0.6
   */
  "accept-language"?: string | undefined;

  /**
   * @property {string | undefined} accept-encoding - List of acceptable encodings.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding}
   * @example Accept-Encoding: gzip, deflate
   * @example Accept-Encoding: compress, gzip
   * @example Accept-Encoding: *
   * @example Accept-Encoding: compress;q=0.5, gzip;q=1.0
   */
  "accept-patch"?: string | undefined;

  /**
   * @property {string | undefined} accept-ranges - What partial content range types this server supports.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Ranges}
   * @example Accept-Ranges: bytes
   * @example Accept-Ranges: none
   */
  "accept-ranges"?: string | undefined;

  /**
   * @property {string | undefined} access-control-allow-credentials - Indicates whether the response to request can be exposed when the omit credentials flag is unset.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials}
   * @example Access-Control-Allow-Credentials: true
   * @example Access-Control-Allow-Credentials: false
   * @example Access-Control-Allow-Credentials: omit
   */
  "access-control-allow-credentials"?: string | undefined;

  /**
   * @property {string | undefined} access-control-allow-headers - Used in response to a preflight request to indicate which HTTP headers can be used when making the actual request.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers}
   * @example Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
   * @example Access-Control-Allow-Headers: *
   */
  "access-control-allow-headers"?: string | undefined;

  /**
   * @property {string | undefined} access-control-allow-methods - Specifies the method or methods allowed when accessing the resource in response to a preflight request.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods}
   * @example Access-Control-Allow-Methods: POST, GET, OPTIONS
   * @example Access-Control-Allow-Methods: *
   * @example Access-Control-Allow-Methods: GET, PUT, DELETE, POST, PATCH
   */
  "access-control-allow-methods"?: string | undefined;

  /**
   * @property {string | undefined} access-control-allow-origin - Specifies the origins that are allowed to access the resource in response to a CORS request.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin}
   * @example Access-Control-Allow-Origin: *
   * @example Access-Control-Allow-Origin: null
   * @example Access-Control-Allow-Origin: https://developer.mozilla.org
   */
  "access-control-allow-origin"?: string | undefined;

  /**
   * @property {string | undefined} access-control-expose-headers - Indicates which headers can be exposed as part of the response by listing their names.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers}
   * @example Access-Control-Expose-Headers: Content-Length, X-Kuma-Revision
   * @example Access-Control-Expose-Headers: *
   * @example Access-Control-Expose-Headers: Content-Length
   * @example Access-Control-Expose-Headers: X-Kuma-Revision
   */
  "access-control-expose-headers"?: string | undefined;

  /**
   * @property {string | undefined} access-control-max-age - Indicates how long the results of a preflight request can be cached.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age}
   * @example Access-Control-Max-Age: 600
   * @example Access-Control-Max-Age: "600"
   * @example Access-Control-Max-Age: "600, public"
   */
  "access-control-max-age"?: string | undefined;

  /**
   * @property {string | undefined} access-control-request-headers - Used when issuing a preflight request to let the server know which HTTP headers will be used when the actual request is made.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Request-Headers}
   * @example Access-Control-Request-Headers: X-PINGOTHER, Content-Type
   * @example Access-Control-Request-Headers: *
   */
  "access-control-request-headers"?: string | undefined;

  /**
   * @property {string | undefined} access-control-request-method - Used when issuing a preflight request to let the server know which HTTP method will be used when the actual request is made.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Request-Method}
   * @example Access-Control-Request-Method: POST
   * @example Access-Control-Request-Method: GET
   * @example Access-Control-Request-Method: OPTIONS
   * @example Access-Control-Request-Method: DELETE
   * @example Access-Control-Request-Method: PUT
   * @example Access-Control-Request-Method: PATCH
   * @example Access-Control-Request-Method: HEAD
   * @example Access-Control-Request-Method: CONNECT
   * @example Access-Control-Request-Method: TRACE
   * @example Access-Control-Request-Method: *
   */
  "access-control-request-method"?: string | undefined;

  /**
   * @property {string | undefined} age - The age the object has been in a proxy cache in seconds.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Age}
   * @example Age: 12
   * @example Age: 123456
   * @example Age: 12.001
   * @example Age: 12, 15
   */
  age?: string | undefined;

  /**
   * @property {string | undefined} allow - Valid actions for a specified resource. To be used for a 405 Method not allowed.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Allow}
   * @example Allow: GET, HEAD
   * @example Allow: GET, HEAD, PUT, OPTIONS
   * @example Allow: *
   */
  allow?: string | undefined;

  /**
   * @property {string | undefined} alt-svc - A server uses "Alt-Svc" header (meaning Alternative Services) to indicate that its resources can also be accessed at a different network location (host or port) or using a different protocol.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Alt-Svc}
   * @example Alt-Svc: h2="https://example.com:443"; ma=7200
   * @example Alt-Svc: http/1.1="https://example.com:443"; ma=7200
   * @example Alt-Svc: http/1.1="https://example.com:443"; ma=7200; persist=1
   * @example Alt-Svc: http/1.1="https://example.com:443"; ma=7200; persist=1, http/1.1="https://example2.com:443"; ma=7200; persist=1
   */
  "alt-svc"?: string | undefined;

  /**
   * @property {string | undefined} authorization - Authentication credentials for HTTP authentication.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization}
   * @example Basic <credentials>
   * @example Bear <token>
   */
  authorization?: string | undefined;

  /**
   * @property {string | undefined} cache-control - Used to specify directives that must be obeyed by all caching mechanisms along the request-response chain.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control}
   * @example Cache-Control: no-cache
   * @example Cache-Control: no-store
   * @example Cache-Control: max-age=31536000
   * @example Cache-Control: max-age=31536000, must-revalidate
   * @example Cache-Control: max-age=31536000, public
   */
  "cache-control"?: string | undefined;

  /**
   * @property {string | undefined} connection - Control options for the current connection and list of hop-by-hop response fields.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Connection}
   * @example Connection: keep-alive
   * @example Connection: Upgrade
   * @example Connection: keep-alive, Upgrade
   * @example Connection: close
   */
  connection?: string | undefined;

  /**
   * @property {string | undefined} content-disposition - In a regular HTTP response, the Content-Disposition response header is a header indicating if the content is expected to be displayed inline in the browser, that is, as a Web page or as part of a Web page, or as an attachment, that is downloaded and saved locally.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/content-disposition}
   */
  "content-disposition"?: string | undefined;

  /**
   * @property {string | undefined} content-encoding - The Content-Encoding entity header is used to compress the media-type.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding}
   * @example Content-Encoding: gzip
   * @example Content-Encoding: compress
   * @example Content-Encoding: deflate
   * @example Content-Encoding: br
   * @example Content-Encoding: identity
   * @example Content-Encoding: gzip, identity
   * @example Content-Encoding: gzip, identity;q=0.5, *;q=0
   */
  "content-encoding"?: string | undefined;

  /**
   * @property {string | undefined} content-language - The Content-Language entity header is used to describe the language(s) intended for the audience, so that it allows a user to differentiate according to the users' own preferred language.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Language}
   * @example Content-Language: da
   * @example Content-Language: mi, en
   * @example Content-Language: en-US, en-CA
   * @example Content-Language: en-US, en;q=0.5
   * @example Content-Language: *
   * @example Content-Language: da, en-gb;q=0.8, en;q=0.7
   * @example Content-Language: en-US, *;q=0.5
   */
  "content-language"?: string | undefined;

  /**
   * @property {string | undefined} content-length - The Content-Length entity header indicates the size of the entity-body, in bytes, sent to the recipient.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length}
   * @example Content-Length: 3495
   * @example Content-Length: 0
   * @example Content-Length: 123
   */
  "content-length"?: string | undefined;

  /**
   * @property {string | undefined} content-location - The Content-Location entity header is used to supply the resource location for the entity enclosed in the message when that entity is accessible from a location separate from the requested resource's URI.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Location}
   * @example Content-Location: /index.htm
   * @example Content-Location: https://developer.mozilla.org/index.htm
   */
  "content-location"?: string | undefined;

  /**
   * @property {string | undefined} content-range - The Content-Range response HTTP header indicates where in a full body message a partial message belongs.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range}
   * @example Content-Range: bytes 21010-47021/47022
   * @example Content-Range: bytes 21010-47021/*
   * @example Content-Range: bytes 42-123/123
   */
  "content-range"?: string | undefined;

  /**
   * @property {string | undefined} content-type - The Content-Type entity header is used to indicate the media type of the resource.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type}
   * @example Content-Type: text/html; charset=utf-8
   * @example Content-Type: multipart/form-data; boundary=something
   * @example Content-Type: application/octet-stream
   * @example Content-Type: application/json
   * @example Content-Type: application/x-www-form-urlencoded
   * @example Content-Type: text/plain;charset=UTF-8
   */
  "content-type"?: string | undefined;

  /**
   * @property {string | undefined} cookie - An HTTP cookie previously sent by the server with Set-Cookie (below).
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie}
   * @example Cookie: $Version=1; Skin=new;
   * @example Cookie: Customer="WILE_E_COYOTE"; $Path=/acme
   */
  cookie?: string | undefined;

  /**
   * @property {string | undefined} date - The Date general HTTP header contains the date and time at which the message was originated.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date}
   * @example Date: Tue, 15 Nov 1994 08:12:31 GMT
   */
  date?: string | undefined;

  /**
   * @property {string | undefined} etag - The ETag HTTP response header is an identifier for a specific version of a resource.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag}
   * @example ETag: "737060cd8c284d8af7ad3082f209582d"
   * @example ETag: W/"0815"
   * @example ETag: ""
   */
  etag?: string | undefined;

  /**
   * @property {string | undefined} expect - Indicates that particular server behaviors are required by the client.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect}
   * @example Expect: 100-continue
   */
  expect?: string | undefined;

  /**
   * @property {string | undefined} expires - The Expires header contains the date/time after which the response is considered stale.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires}
   * @example Expires: Thu, 01 Dec 1994 16:00:00 GMT
   */
  expires?: string | undefined;

  /**
   * @property {string | undefined} forwarded - Disclose original information of a client connecting to a web server through an HTTP proxy.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded}
   * @example Forwarded: for=
   */
  forwarded?: string | undefined;

  /**
   * @property {string | undefined} from - The From request header contains an Internet email address for a human user who controls the requesting user agent.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/From}
   * @example From:
   */
  from?: string | undefined;

  /**
   * @property {string | undefined} host - The Host request header specifies the host and port number of the server to which the request is being sent.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host}
   * @example Host: developer.mozilla.org
   * @example Host: developer.mozilla.org:443
   */
  host?: string | undefined;

  /**
   * @property {string | undefined} if-match - The If-Match HTTP request header makes the request conditional.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match}
   * @example If-Match: "737060cd8c284d8af7ad3082f209582d"
   * @example If-Match: "737060cd8c284d8af7ad3082f209582d", "66502c1d4730458ab5354831e2b78699"
   * @example If-Match: *
   */
  "if-match"?: string | undefined;

  /**
   * @property {string | undefined} if-modified-since - The If-Modified-Since request HTTP header makes the request conditional: the server will send back the requested resource, with a 200 status, only if it has been last modified after the given date.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since}
   * @example If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT
   */
  "if-modified-since"?: string | undefined;

  /**
   * @property {string | undefined} if-none-match - The If-None-Match HTTP request header makes the request conditional.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match}
   * @example If-None-Match: "737060cd8c284d8af7ad3082f209582d"
   * @example If-None-Match: "737060cd8c284d8af7ad3082f209582d", "66502c1d4730458ab5354831e2b78699"
   * @example If-None-Match: *
   */
  "if-none-match"?: string | undefined;

  /**
   * @property {string | undefined} if-unmodified-since - Only send the response if the entity has not been modified since a specific time.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Unmodified-Since}
   * @example If-Unmodified-Since: Sat, 29 Oct 1994 19:43:31 GMT
   */
  "if-unmodified-since"?: string | undefined;

  /**
   * @property {string | undefined} last-modified - The Last-Modified response HTTP header indicates the date and time at which the origin server believes the resource was last modified.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified}
   * @example Last-Modified: Tue, 15 Nov 1994 12:45:26 GMT
   * @example Last-Modified: Tue, 15 Nov 1994 12:45:26 GMT; length=13774
   */
  "last-modified"?: string | undefined;

  /**
   * @property {string | undefined} link - Used to express a typed relationship with another resource, where the relation type is defined by RFC 5988.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link}
   * @example Link: <https://example.com/>; rel="canonical"
   * @example Link: <https://fonts.googleapis.com/css?family=Roboto>; rel=preload; as=style
   */
  link?: string | undefined;

  /**
   * @property {string | undefined} location - Used in redirection, or when a new resource has been created.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
   * @example Location: https://developer.mozilla.org
   * @example Location: /errors/404
   * @example Location: https://developer.mozilla.org/errors/404
   */
  location?: string | undefined;

  /**
   * @property {string | undefined} origin - Initiates a request for cross-origin resource sharing (asks server for an 'Access-Control-Allow-Origin' response header) .
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin}
   * @example Origin: http://example.com
   * @example Origin: https://developer.mozilla.org
   */
  origin?: string | undefined;

  /**
   * @property {string | undefined} pragma - Implementation-specific fields that may have various effects anywhere along the request-response chain.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Pragma}
   * @example Pragma: no-cache
   * @example Pragma: cache
   * @example Pragma: no-cache, x-my-pragma
   */
  pragma?: string | undefined;

  "proxy-authenticate"?: string | undefined;
  "proxy-authorization"?: string | undefined;
  "public-key-pins"?: string | undefined;

  /**
   * @property {string | undefined} range - Request only part of an entity. Bytes are numbered from 0.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range}
   * @example Range: bytes=500-999
   * @example Range: bytes=500-600,601-999
   */
  range?: string | undefined;

  /**
   * @property {string | undefined} referer - This is the address of the previous web page from which a link to the currently requested page was followed.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer}
   * @example Referer: https://developer.mozilla.org/hotels/Hotel_San_Carlo
   */
  referer?: string | undefined;

  /**
   * @property {string | undefined} retry-after - If an entity is temporarily unavailable, this instructs the client to try again later.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After}
   * @example Retry-After: 120
   * @example Retry-After: Fri, 07 Nov 2014 23:59:59 GMT
   * @example Retry-After: 120; retry="http://example.com/maintenance.html"
   * @example Retry-After: max=120
   * @example Retry-After: max=120, retry="http://example.com/maintenance.html"
   */
  "retry-after"?: string | undefined;
  "sec-websocket-accept"?: string | undefined;
  "sec-websocket-extensions"?: string | undefined;
  "sec-websocket-key"?: string | undefined;
  "sec-websocket-protocol"?: string | undefined;
  "sec-websocket-version"?: string | undefined;

  /**
   * @property {string | undefined} server - Contains information about the software used by the origin server to handle the request.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server}
   * @example Server: Apache/2.4.1 (Unix)
   * @example Server: Apache/2.4.1 (Unix) OpenSSL/1.0.0g
   * @example Server: Apache/2.4.1 (Unix) OpenSSL/1.0.0g PHP/5.3.6
   * @example Server: Apache/2.4.1 (Unix) OpenSSL/1.0.0g PHP/5.3.6 mod_perl/2.0.9 Perl/v5.10.1
   * @example Server: nginx/1.0.4
   * @example Server: Microsoft-IIS/7.5
   * @example Server: CherryPy/3.2.0
   * @example Server: CherryPy/3.2.0 WSGI Server
   * @example Server: gunicorn/0.16.1
   * @example Server: Google Frontend
   * @example Server: ECS (oxr/8321)
   */
  server?: string | undefined;

  /**
   * @property {string | undefined} set-cookie - Send cookies from the server to the user agent.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie}
   * @example Set-Cookie: UserID=JohnDoe; Max-Age=3600; Version=1
   * @example Set-Cookie: lang=en-US; Path=/; Domain=example.com
   * @example Set-Cookie: name=value; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly
   * @example Set-Cookie: name=value; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; SameSite=Strict
   * @example Set-Cookie: name=value; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; SameSite=Lax
   * @example Set-Cookie: name=value; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; SameSite=None
   */
  "set-cookie"?: string[] | undefined;

  /**
   * @property {string | undefined} strict-transport-security - A HSTS Policy informing the HTTP client how long to cache the HTTPS only policy and whether this applies to subdomains.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security}
   * @example Strict-Transport-Security: max-age=16070400; includeSubDomains
   * @example Strict-Transport-Security: max-age=16070400; includeSubDomains; preload
   */
  "strict-transport-security"?: string | undefined;

  /**
   * @property {string | undefined} tk - Implemented as a misunderstanding of the HTTP specifications.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/TK}
   * @example Tk: N
   * @example Tk: ?
   * @example Tk: G
   * @example Tk: N, G
   * @example Tk: N, ?
   * @example Tk: G, ?
   * @example Tk: N, G, ?
   */
  tk?: string | undefined;

  /**
   * @property {string | undefined} trailer - The Trailer general field value indicates that the given set of header fields is present in the trailer of a message encoded with chunked transfer coding.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Trailer}
   * @example Trailer: Max-Forwards
   * @example Trailer: Content-MD5
   * @example Trailer: Max-Forwards, Content-MD5
   */
  trailer?: string | undefined;

  /**
   * @property {string | undefined} transfer-encoding - The Transfer-Encoding header specifies the form of encoding used to safely transfer the payload body to the user.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding}
   * @example Transfer-Encoding: chunked
   * @example Transfer-Encoding: compress
   * @example Transfer-Encoding: deflate
   * @example Transfer-Encoding: gzip
   * @example Transfer-Encoding: identity
   * @example Transfer-Encoding: gzip, chunked
   * @example Transfer-Encoding: gzip, identity;q=0.5, *;q=0
   */
  "transfer-encoding"?: string | undefined;

  /**
   * @property {string | undefined} upgrade - Ask the client to upgrade to another protocol.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Upgrade}
   * @example Upgrade: h2c, HTTPS/1.3, IRC/6.9, RTA/x11, websocket
   * @example Upgrade: HTTP/2.0, SHTTP/1.3, IRC/6.9, RTA/x11
   * @example Upgrade: websocket
   */
  upgrade?: string | undefined;

  /**
   * @property {string | undefined} user-agent - The User-Agent request header contains a characteristic string that allows the network protocol peers to identify the application type, operating system, software vendor or software version of the requesting software user agent.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent}
   * @example User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0
   * @example User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)
   * @example User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1
   */
  "user-agent"?: string | undefined;

  /**
   * @property {string | undefined} vary - Tells downstream proxies how to match future request headers to decide whether the cached response can be used rather than requesting a fresh one from the origin server.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary}
   * @example Vary: *
   * @example Vary: Accept-Language
   * @example Vary: Accept-Encoding, Accept-Language
   * @example Vary: Accept-Encoding, Accept-Language, Accept
   */
  vary?: string | undefined;

  /**
   * @property {string | undefined} via - Informs the client of proxies through which the response was sent.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Via}
   * @example Via: 1.0 fred, 1.1 example.com (Apache/1.1)
   * @example Via: 1.0 fred, 1.1 example.com (Apache/1.1), 1.0 cache.example.com
   */
  via?: string | undefined;

  /**
   * @property {string | undefined} warning - A general warning about possible problems with the entity body.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Warning}
   * @example Warning: 199 Miscellaneous warning
   * @example Warning: 199 example.com "Revalidation failed"
   * @example Warning: 199 example.com "Miscellaneous warning" "Tue, 27 May 2014 17:38:34 GMT"
   * @example Warning: 199 - "Miscellaneous warning" "Tue, 27 May 2014 17:38:34 GMT"
   * @example Warning: 199 - "Miscellaneous warning"
   * @example Warning: 199 example.com -
   */
  warning?: string | undefined;

  /**
   * @property {string | undefined} www-authenticate - Indicates the authentication scheme that should be used to access the requested entity.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate}
   * @example WWW-Authenticate: Basic
   * @example WWW-Authenticate: Basic realm="simple"
   * @example WWW-Authenticate: Basic realm="simple", charset="UTF-8"
   */
  "www-authenticate"?: string | undefined;
}

/**
 * @interface Response - The response object.
 */
export interface Response {
  /**
   * Set return status code.
   * @param {string} code - The status code.
   * @returns {Response} - The response object.
   * @example
   * res.status(200);
   * res.status(404);
   * res.status(500);
   * res.status(200).json({ message: "OK" });
   */
  status(code: number): Response;

  /**
   * Send json response.
   * @param {any} body - The response body.
   * @returns {Response} - The response object.
   * @example
   * res.json({ message: "OK" });
   * res.json({ message: "Not found" });
   * res.json({ message: "Internal server error" });
   * res.json({ message: "OK" }).status(200);
   */
  json(body: any): Response;

  /**
   * Send error response.
   * @param {number} code - The status code.
   * @param {string} message - The error message.
   * @returns {Response} - The response object.
   * @example
   * res.error(404, "Not found");
   * res.error(500, "Internal server error");
   * res.error(404, "Not found").json({ message: "Not found" });
   */
  error(code: number, message: string): Response;

  /**
   * End response.
   * @returns {Response} - The response object.
   * @example
   * res.end();
   */
  end(): Response;

  /**
   * Send file.
   * @param {string} path - The file path.
   * @returns {Response} - The response object.
   * @example
   * res.sendFile("/path/to/file");
   * res.sendFile("/path/to/file").status(200);
   */
  sendFile(path: string): Response;

  /**
   * Send response.
   * @param {any} body - The response body.
   * @returns {Response} - The response object.
   * @example
   * res.send({ message: "OK" });
   * res.send({ message: "Not found" });
   * res.send({ message: "Internal server error" });
   * res.send({ message: "OK" }).status(200);
   */
  send(body: any): Response;

  /**
   * Set response header.
   * @param {string} field - The header field.
   * @param {string} value - The header value.
   * @returns {Response} - The response object.
   * @example
   * res.header("Content-Type", "application/json");
   * res.header("Content-Type", "text/html");
   * res.header("Content-Type", "text/plain");
   * res.header("Content-Type", "text/plain").status(200);
   */
  header(field: string, value: string): Response;

  /**
   * Redirect to path.
   * @param {string} path - The redirect path.
   * @returns {Response} - The response object.
   * @example
   * res.redirect("/path/to/redirect");
   * res.redirect("/path/to/redirect").status(200);
   * res.redirect("/path/to/redirect").json({ message: "OK" });
   * res.redirect("/path/to/redirect").json({ message: "OK" }).status(200);
   */
  redirect(path: string): Response;
}

/**
 * @interface Request - The request object.
 */
export type Method =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "head"
  | "options"
  | "trace";

export function createSyntheticRequest(
  info: AllOptional<Request> = {}
): Request {
  return {
    accepts: info.accepts ?? (() => ["application/json"]),
    acceptsCharsets: info.acceptsCharsets ?? (() => ["utf-8"]),
    acceptsEncodings: info.acceptsEncodings ?? (() => ["identity"]),
    acceptsLanguages: info.acceptsLanguages ?? (() => ["en"]),
    body: info.body ?? {},
    cookies: info.cookies ?? {},
    fresh: info.fresh ?? false,
    hostname: info.hostname ?? "localhost",
    ip: info.ip ?? getLocalIP(),
    ips: info.ips ?? [getLocalIP()],
    method: info.method ?? "GET",
    originalUrl: info.originalUrl ?? "/",
    params: info.params ?? {},
    path: info.path ?? "/",
    protocol: info.protocol ?? "http",
    query: info.query ?? {},
    baseUrl: info.baseUrl ?? "/",
    fullApiPath: info.fullApiPath ?? info.path ?? "/",
    fullPath: info.fullPath ?? info.path ?? "/",
    get(field: string): string | undefined {
      if (info.get) {
        return info.get(field);
      }
      return (
        Object.entries(this.headers).find(
          ([key, value]) => key.toLowerCase() === field.toLowerCase()
        )?.[1] ?? ""
      );
    },
    header(name: string): string {
      if (info.header) {
        return info.header(name);
      }
      return (
        Object.entries(this.headers).find(
          ([key, value]) => key.toLowerCase() === name.toLowerCase()
        )?.[1] ?? ""
      );
    },
    headers: info.headers ?? {
      accept: "application/json",
      host: "localhost",
    },
    is: info.is ?? (() => false),
    secure: info.secure ?? false,
    signedCookies: info.signedCookies ?? {},
    stale: info.stale ?? false,
    subdomains: info.subdomains ?? [],
    xhr: info.xhr ?? false,
  };
}

export function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((iface) => iface?.family === "IPv4" && !iface.internal)
    .map((iface) => iface?.address);
  return addresses[0] ?? "";
}

export function createSyntheticResponse(): {
  response: Response;
  promise: Promise<{
    code: number;
    data: string;
    headers: Record<string, string>;
    sendFile?: string;
  }>;
} {
  let resolver: (value: {
    code: number;
    data: string;
    headers: Record<string, string>;
    sendFile?: string;
    redirect?: string;
  }) => void;

  let rejecter: (reason?: any) => void;

  const promise = new Promise<{
    code: number;
    data: string;
    headers: Record<string, string>;
    sendFile?: string;
  }>((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });

  let statusCode = 200;
  let data = "";
  const headers: Record<string, string> = {};
  let sendFile: string | undefined;

  return {
    response: {
      end() {
        resolver({
          code: statusCode,
          data,
          headers,
          sendFile,
        });
        return this;
      },
      error(code: number, message: string) {
        statusCode = code;
        if (data === "") {
          data = message;
        }
        return this;
      },
      header(field: string, value: string) {
        headers[field] = value;
        return this;
      },
      json(body: any) {
        data = JSON.stringify(body);
        this.header("Content-Type", "application/json");
        return this;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      send(body: any) {
        data = body;
        return this;
      },
      sendFile(path: string) {
        sendFile = path;
        return this;
      },
      redirect(path: string) {
        this.header("Location", path);
        this.status(302);
        return this;
      },
    },
    promise,
  };
}

export function createSyntheticContext(info: AllOptional<Request> = {}): {
  request: Request;
  response: Response;
  pass: [Request, Response];
  promise: Promise<{
    code: number;
    data: string;
    headers: Record<string, string>;
    sendFile?: string;
    redirect?: string;
  }>;
} {
  const { response, promise } = createSyntheticResponse();
  const request = createSyntheticRequest(info);
  const pass: [Request, Response] = [request, response];
  return {
    request,
    response,
    pass,
    promise,
  };
}
