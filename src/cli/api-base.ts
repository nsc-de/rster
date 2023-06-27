import fetch from 'cross-fetch';

export type Token = string;

export interface Authentication {
  token: Token;
}

export type AuthenticationOption = {
  token?: Token | null;
}


export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly response: Response,
    public readonly body: any) {
    super(message);
  }


  get error() {
    return this.body.error;
  }

  toString() {
    return `ApiError[${this.status}]: ${this.message}`;
  }
}

export type ApiHost = {
  host: string,
  basePath: string,
  token?: Token | null,
}

export abstract class GenericApiClient {
  public readonly host: string;
  public readonly basePath: string;

  constructor({
    host,
    basePath,
  }: ApiHost) {
    this.host = host;
    this.basePath = basePath;
  }

  public readonly basic = ((ApiClient_THIS: GenericApiClient) => ({
    request(path: string, init?: RequestInit | undefined) {
      const url = `${ApiClient_THIS.host}${ApiClient_THIS.basePath}${path}`;
      console.debug(`[ApiClient] ${init?.method ?? 'GET'} ${url}`);
      return fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      }).then(async (res) => {
        if (res.ok) {
          return await res.json();
        }
        return await res.json().then((body: any) => {
          throw new ApiError(res.status, body.message ?? res.statusText, res, body);
        });
      });
    },

    get(path: string, init?: RequestInit) {
      return this.request(path, {
        method: 'GET',
        ...init,
      });
    },

    post(path: string, init?: RequestInit) {
      return this.request(path, {
        method: 'POST',
        ...init,
      });
    },

    put(path: string, init?: RequestInit) {
      return this.request(path, {
        method: 'PUT',
        ...init,
      });
    },

    execute(path: string, method: string, urlSchema: string, body: any, urlParams: { [key: string]: string } = {}, query: { [key: string]: string } = {}) {
      //TODO urlSchema and urlParams and query
      return this.request(path, {
        method: method,
        body: JSON.stringify(body),
      });
    },
  }))(this);
}



export abstract class AuthenticatedGenericApiClient extends GenericApiClient {

  private _token: Token | null;
  get token(): Token | null {
    return this._token;
  }

  constructor({
    host,
    basePath,
    token = null,
  }: ApiHost) {
    super({
      host,
      basePath,
    });
    this._token = token;
  }

  useToken(token: Token) {
    this._token = token;
  }

  ping(): Promise<{
    message: "pong"
  }> {
    return this.basic.get('/ping');
  }

  public readonly authenticated = ((ApiClient_THIS: AuthenticatedGenericApiClient) => ({
    request(path: string, init?: RequestInit | undefined, token?: Token | null) {
      return ApiClient_THIS.basic.request(path, {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${token !== undefined ? token : ApiClient_THIS.token}`,
        },
      });
    },

    get(path: string, init?: RequestInit, token?: Token | null) {
      return this.request(path, {
        method: 'GET',
        ...init,
      }, token);
    },

    post(path: string, init?: RequestInit, token?: Token | null) {
      return this.request(path, {
        method: 'POST',
        ...init,
      }, token);
    },

    put(path: string, init?: RequestInit, token?: Token | null) {
      return this.request(path, {
        method: 'PUT',
        ...init,
      }, token);
    },

    execute(path: string, method: string, urlSchema: string, body: any, urlParams: { [key: string]: string } = {}, query: { [key: string]: string } = {}) {
      //TODO urlSchema and urlParams and query
      return this.request(path, {
        method: method,
        body: JSON.stringify(body),
      });
    },
  }))(this);
}

