import fetch from "cross-fetch";

export interface InfoResponseField {
  name: string;
  value: string;
}

export type InfoResponseDescription = string[];
export type InfoResponseFields = InfoResponseField[];

export interface InfoResponseMap {
  path?: string;
  method?: string;
  description?: InfoResponseDescription;
  fields?: InfoResponseFields;
  map?: InfoResponseMap[];
}

export interface InfoClientOptions {
  url: string;
  basePath: string;
  customFetchFunction?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined
  ) => Promise<Response>;
}

export type InfoField = InfoResponseField;
export type InfoDescription = InfoResponseDescription;
export type InfoFields = InfoResponseFields;

export interface InfoMap {
  path?: string;
  absolutePath?: string;
  method?: string;
  description?: InfoDescription;
  fields?: InfoFields;
  map?: InfoMap[];
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

  async getIndex() {
    const response = await this.request(`/`);
    return this.deepMapResponse(await response.json(), []);
  }

  private deepMapResponse(item: InfoResponseMap, path: string[]): InfoMap {
    const newPath = [...path, item.path ?? ""];
    return {
      ...item,
      map: item.map?.map((item) => this.deepMapResponse(item, newPath)) ?? [],
      absolutePath: newPath.join(""),
    };
  }
}
