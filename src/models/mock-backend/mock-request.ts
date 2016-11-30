import { MockAutoBackend } from './mock-auto-backend.class';

export interface MockRequest<T> {
    /**
     * .mock(..) function second argument
     * This data is usualy Object or Array
     * 
     * @type {*}
     * @memberOf MockRequest
     */
    data: any;
    /**
     * Query params passed by user. This is object
     * with poperties from them, but they usualy 
     * look like this in <url>?example=value&emaple2=value2
     * 
     * @type {Object}
     * @memberOf MockRequest
     */
    params: Object;
    /**
     * POST, PUT http request have also body
     * in request to carry large amount of data
     * 
     * @type {Object}
     * @memberOf MockRequest
     */
    body: Object;
    /**
     * With MockAutobacken you can do:
     * pagination, fitlering, sorting
     * for your models lists
     * 
     * @type {MockAutoBackend<T>}
     * @memberOf MockRequest
     */
    backend?: MockAutoBackend<T>
}