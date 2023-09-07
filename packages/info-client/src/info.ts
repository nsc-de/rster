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
    const body = await response.json();
    if (response.status === 404) {
      return new InfoClientNotFoundError(
        body.message ?? response.statusText,
        response
      );
    }
    return new InfoClientResponseError(
      body.message ?? response.statusText,
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

export class InfoClient {
  fetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>;
  constructor(readonly options: InfoClientOptions) {
    this.fetch = options.customFetchFunction ?? fetch;
  }

  private request(path: string) {
    return this.fetch(
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
      });
  }

  async getIndex(): Promise<InfoMap> {
    const response = await this.request(`/`);
    return new InfoMapImpl(
      this,
      await response.json(),
      this.options.basePath,
      undefined
    );
  }

  async getInfo(path: string): Promise<InfoMap> {
    const response = await this.request(path);
    return new InfoMapImpl(
      this,
      await response.json(),
      this.options.basePath,
      undefined
    ); // TODO: parent
  }
}
