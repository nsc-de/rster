import fetch from "cross-fetch";

export interface InfoResponseField {
  name: string;
  value: string;
}

export type InfoResponseDescription = string[];

export interface InfoResponseMapInner {
  path?: string;
  method?: string;
  description?: InfoResponseDescription;
}

export interface InfoResponseMap {
  path?: string;
  method?: string;
  description?: InfoResponseDescription;
  fields?: InfoResponseField[];
  map?: InfoResponseMapInner[];
}

export interface InfoClientOptions {
  url: string;
  basePath: string;
  proxy?: string;
  customFetchFunction?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>;
}

type InfoField = InfoResponseField;
type InfoDescription = InfoResponseDescription;

export abstract class InfoMap {
  abstract get path(): Promise<string>;
  abstract get method(): Promise<string>;
  abstract get description(): Promise<InfoDescription>;
  abstract get fields(): Promise<InfoField[]>;
  abstract get map(): Promise<InfoMap[]>;
  abstract get absolutePath(): Promise<string>;
  abstract get parent(): Promise<InfoMap | undefined>;
}

export class InfoMapImpl extends InfoMap {
  readonly path: Promise<string>;
  readonly method: Promise<string>;
  readonly description: Promise<InfoDescription>;
  readonly fields: Promise<InfoField[]>;
  readonly map: Promise<InfoMap[]>;
  readonly absolutePath: Promise<string>;
  readonly parent: Promise<InfoMap | undefined>;

  constructor(
    private readonly api: InfoClient,
    it: InfoResponseMap,
    apiBasePath: string,
    parent?: InfoMap
  ) {
    super();
    this.path = Promise.resolve(it.path ?? "");
    this.method = Promise.resolve(it.method ?? "any");
    this.description = Promise.resolve(it.description ?? []);
    this.fields = Promise.resolve(it.fields ?? []);
    this.map = Promise.resolve(
      it.map?.map((it) => new InfoMapImpl2(api, it, apiBasePath, this)) ?? []
    );
    this.absolutePath = Promise.resolve(apiBasePath + it.path ?? "");
    this.parent = Promise.resolve(parent);
  }
}

export class InfoMapImpl2 extends InfoMap {
  private __promise?: Promise<InfoMap>;
  private get __infoMaplPromise(): Promise<InfoMap> {
    if (!this.__promise) {
      this.__promise = (async () => await this.api.getInfo(await this.path))();
    }
    return this.__promise;
  }

  readonly path: Promise<string>;
  readonly method: Promise<string>;
  readonly description: Promise<InfoDescription>;
  readonly absolutePath: Promise<string>;
  readonly parent: Promise<InfoMap | undefined>;

  get fields(): Promise<InfoField[]> {
    return this.__infoMaplPromise.then((it) => it.fields);
  }

  get map(): Promise<InfoMap[]> {
    return this.__infoMaplPromise.then((it) => it.map);
  }

  constructor(
    private readonly api: InfoClient,
    it: InfoResponseMapInner,
    apiBasePath: string,
    parent?: InfoMap
  ) {
    super();
    this.path = Promise.resolve(it.path ?? "");
    this.method = Promise.resolve(it.method ?? "any");
    this.description = Promise.resolve(it.description ?? []);
    this.absolutePath = Promise.resolve(apiBasePath + it.path ?? "");
    this.parent = Promise.resolve(parent);
  }
}

export class InfoClientResponseError extends Error {
  constructor(message: string, readonly response: Response) {
    super(message);
  }

  get code() {
    return this.response.status;
  }

  static async fromResponse(response: Response) {
    const body = await jsonPipe(response);
    if (response.status === 404) {
      return new InfoClientNotFoundError(
        body.message ?? response.statusText,
        response
      );
    }
    return new InfoClientResponseError(
      body.message ?? `${response.status} (${response.statusText})`,
      response
    );
  }
}

export class InfoClientNotFoundError extends InfoClientResponseError {
  constructor(message: string, response: Response) {
    super(message, response);
  }

  get code() {
    return 404;
  }
}

export class InfoClientNoHostError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class InfoClientCorsError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class InfoClient {
  constructor(readonly options: InfoClientOptions) {}

  private requestViaProxy(path: string) {
    return handleErrors(
      fetch(this.options.proxy!, {
        method: "POST",
        body: JSON.stringify({
          url: `${this.options.url ?? ""}${this.options.basePath ?? ""}${path}`,
          body: "",
          method: "GET",
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw InfoClientResponseError.fromResponse(response);
          }
          return response;
        })
        .catch((error) => {
          if (error instanceof InfoClientResponseError) {
            throw error;
          }
          if (error instanceof Response) {
            throw InfoClientResponseError.fromResponse(error);
          }

          throw error;
        })
    );
  }

  private requestNoProxy(path: string) {
    return handleErrors(
      (this.options.customFetchFunction ?? fetch)(
        `${this.options.url ?? ""}${this.options.basePath ?? ""}${path}`,
        {
          method: "GET",
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw InfoClientResponseError.fromResponse(response);
          }
          return response;
        })
        .catch((error) => {
          if (error instanceof InfoClientResponseError) {
            throw error;
          }
          if (error instanceof Response) {
            throw InfoClientResponseError.fromResponse(error);
          }

          throw error;
        })
    );
  }

  async request(path: string) {
    if (this.options.proxy) {
      return jsonPipeProxy(await this.requestViaProxy(path));
    } else {
      return jsonPipe(await this.requestNoProxy(path));
    }
  }

  async getIndex(): Promise<InfoMap> {
    return new InfoMapImpl(
      this,
      await this.request("/"),
      this.options.basePath,
      undefined
    );
  }

  async getInfo(path: string): Promise<InfoMap> {
    return new InfoMapImpl(
      this,
      await this.request(path),
      this.options.basePath,
      undefined
    ); // TODO: parent
  }
}

function handleErrors<T extends Promise<Response>>(fetchPromise: T): T {
  return fetchPromise.catch(async (error) => {
    if (error instanceof Promise) error = await handleErrors(error);

    const msg = error.message;
    if (!error.message) throw error;
    if (msg.includes("Failed to fetch")) {
      throw new InfoClientNoHostError(
        msg +
          "; This means that the server is not running or the url is wrong or it does not allow this origin to access it (CORS). See console logs for more details."
      );
    }

    throw error;
  }) as T;
}

async function jsonPipe(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new InfoClientResponseError(
      "Unable to parse json response!\n" + text,
      response
    );
  }
}

async function jsonPipeProxy(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text);

    const code = json.code;

    if (code !== 200) {
      throw new InfoClientResponseError(
        "Unable to parse json response! Proxy returned " + code,
        response
      );
    }

    const body = JSON.parse(json.body);
    return body;
  } catch (err) {
    throw new InfoClientResponseError(
      "Unable to parse json response!\n" + text,
      response
    );
  }
}

export default InfoClient;
