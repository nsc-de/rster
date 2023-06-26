"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
var api_base_1 = require("./api-base");
class Api extends api_base_1.GenericApiClient {
    constructor() {
        super(...arguments);
        this.baseApi = this;
        this.test = ((baseApi) => {
            return { test: (parameters) => {
                    return this.baseApi.basic.get("test", parameters);
                } };
        })(this.baseApi);
    }
}
exports.Api = Api;
exports.default = Api;
//# sourceMappingURL=index.js.map