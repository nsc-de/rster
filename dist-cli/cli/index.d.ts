import { GenericApiClient } from "./api-base";
declare class Api extends GenericApiClient {
    baseApi: Api;
    test: {
        test: (parameters: {}) => any;
    };
}
export { Api };
export default Api;
