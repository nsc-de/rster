export type Token = string;
export interface Authentication {
    token: Token;
}
export type AuthenticationOption = {
    token?: Token | null;
};
export declare class ApiError extends Error {
    readonly status: number;
    readonly response: Response;
    readonly body: any;
    constructor(status: number, message: string, response: Response, body: any);
    get error(): any;
    toString(): string;
}
export type ApiHost = {
    host: string;
    basePath: string;
    token?: Token | null;
};
export declare abstract class GenericApiClient {
    readonly host: string;
    readonly basePath: string;
    constructor({ host, basePath, }: ApiHost);
    ping(): Promise<{
        message: "pong";
    }>;
    readonly basic: {
        request(path: string, init?: RequestInit | undefined): Promise<any>;
        get(path: string, init?: RequestInit): Promise<any>;
        post(path: string, init?: RequestInit): Promise<any>;
        put(path: string, init?: RequestInit): Promise<any>;
    };
}
export declare abstract class AuthenticatedGenericApiClient extends GenericApiClient {
    private _token;
    get token(): Token | null;
    constructor({ host, basePath, token, }: ApiHost);
    useToken(token: Token): void;
    ping(): Promise<{
        message: "pong";
    }>;
    readonly authenticated: {
        request(path: string, init?: RequestInit | undefined, token?: Token | null): Promise<any>;
        get(path: string, init?: RequestInit, token?: Token | null): Promise<any>;
        post(path: string, init?: RequestInit, token?: Token | null): Promise<any>;
        put(path: string, init?: RequestInit, token?: Token | null): Promise<any>;
    };
}
