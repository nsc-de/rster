"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatedGenericApiClient = exports.GenericApiClient = exports.ApiError = void 0;
var cross_fetch_1 = __importDefault(require("cross-fetch"));
class ApiError extends Error {
    constructor(status, message, response, body) {
        super(message);
        this.status = status;
        this.response = response;
        this.body = body;
    }
    get error() {
        return this.body.error;
    }
    toString() {
        return `ApiError[${this.status}]: ${this.message}`;
    }
}
exports.ApiError = ApiError;
class GenericApiClient {
    constructor({ host, basePath, }) {
        this.basic = ((ApiClient_THIS) => ({
            request(path, init) {
                const url = `${ApiClient_THIS.host}${ApiClient_THIS.basePath}${path}`;
                console.debug(`[ApiClient] ${init?.method ?? 'GET'} ${url}`);
                return (0, cross_fetch_1.default)(url, {
                    ...init,
                    headers: {
                        'Content-Type': 'application/json',
                        ...init?.headers
                    }
                }).then(async (res) => {
                    if (res.ok) {
                        return await res.json();
                    }
                    return await res.json().then((body) => {
                        throw new ApiError(res.status, body.message ?? res.statusText, res, body);
                    });
                });
            },
            get(path, init) {
                return this.request(path, {
                    method: 'GET',
                    ...init
                });
            },
            post(path, init) {
                return this.request(path, {
                    method: 'POST',
                    ...init
                });
            },
            put(path, init) {
                return this.request(path, {
                    method: 'PUT',
                    ...init
                });
            }
        }))(this);
        this.host = host;
        this.basePath = basePath;
    }
    ping() {
        return this.basic.get('/ping');
    }
}
exports.GenericApiClient = GenericApiClient;
class AuthenticatedGenericApiClient extends GenericApiClient {
    get token() {
        return this._token;
    }
    constructor({ host, basePath, token = null, }) {
        super({
            host,
            basePath
        });
        this.authenticated = ((ApiClient_THIS) => ({
            request(path, init, token) {
                return ApiClient_THIS.basic.request(path, {
                    ...init,
                    headers: {
                        ...init?.headers,
                        Authorization: `Bearer ${token !== undefined ? token : ApiClient_THIS.token}`
                    }
                });
            },
            get(path, init, token) {
                return this.request(path, {
                    method: 'GET',
                    ...init
                }, token);
            },
            post(path, init, token) {
                return this.request(path, {
                    method: 'POST',
                    ...init
                }, token);
            },
            put(path, init, token) {
                return this.request(path, {
                    method: 'PUT',
                    ...init
                }, token);
            }
        }))(this);
        this._token = token;
    }
    useToken(token) {
        this._token = token;
    }
    ping() {
        return this.basic.get('/ping');
    }
}
exports.AuthenticatedGenericApiClient = AuthenticatedGenericApiClient;
//# sourceMappingURL=api-base.js.map