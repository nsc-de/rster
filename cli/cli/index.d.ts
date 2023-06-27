import { GenericApiClient } from "./api-base";
declare class Api extends GenericApiClient {
    baseApi: Api;
    ping: (parameters: {}) => Promise<{
        message: string;
    }>;
}
export { Api };
export default Api;
