import { GenericApiClient, AuthenticatedGenericApiClient } from "./api-base";
class Api extends GenericApiClient {
    baseApi: Api = this;
    ping = (parameters?: {}): Promise<{
        message: string;
    }> => {
        return (this.baseApi.basic.execute("/test", "GET", "", parameters) as any);
    };
}
export { Api };
export default Api;
