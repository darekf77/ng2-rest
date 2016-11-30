import { HttpCode } from '../http';

export interface MockResponse {
    /**
     * This data will be returned to user in callback
     * as result of request
     * 
     * @type {*}
     * @memberOf MockResponse
     */
    data: any;
    /**
     * Default http code is 200, but to simulate othe
     * codes and responses use this poperty
     * 
     * @type {HttpCode}
     * @memberOf MockResponse
     */
    code?: HttpCode;
    /**
     * Response errors
     * 
     * @type {string}
     * @memberOf MockResponse
     */
    error?: string;
}