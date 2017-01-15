import { Inject } from '@angular/core';
import { Http, Jsonp } from '@angular/http';

import { Subscription } from 'rxjs';

import { Resource } from './resource.service';
import { Rest } from './rest';
import { UrlNestedParams } from './nested-params';
import { MockBackend, MockRequest, MockResponse } from './mock-backend';



interface Mock<A> {
    controller: (req: MockRequest<A>, timeout?: number, howManyModels?: number) => MockResponse;
    timeout: number;
    howManyMock: number;
    data: any;
}


interface RestPromises<A, TA, QP extends Rest.UrlParams> {
    get: (queryParams?: QP) => Promise<A>;
    query: (queryParams?: QP) => Promise<TA>;
    save: (item: A, queryParams?: QP) => Promise<A>;
    update: (item: A, queryParams?: QP) => Promise<A>;
    remove: (queryParams?: QP) => Promise<A>;
}

interface Model<A, TA, RP extends Object, QP extends Rest.UrlParams> {
    (restParams?: RP): RestPromises<A, TA, QP>;
}

/**
 *
 * @export
 * @abstract
 * @class SimpleResource
 * @extends {Resource<T, A, TA>}
 * @template E  Endpoint type
 * @template A Single modle type
 * @template TA Array Model Type
 * @template RP rest url parameters type
 * @template QP query parameter type
 */
class ExtendedResource<E, A, TA, RP extends Object, QP extends Rest.UrlParams> extends Resource<E, A, TA> {

    private handlers: Subscription[] = [];
    mock: Mock<A> = <Mock<A>>{ timeout: 100, howManyMock: 100, data: {} };

    /**
     * Get model by rest params
    */
    model: Model<A, TA, RP, QP> = (restParams?: RP) => {
        console.log('AM HERE model')
        return {

            get: (queryPrams?: QP) => {
                return new Promise<A>((resolve, reject) => {
                    if (this.mock.controller !== undefined || this.mock.data !== undefined) {
                        console.log('FAKE DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                            .get([queryPrams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    } else {
                        console.log('REAL DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .get([queryPrams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    }
                })
            },

            query: (queryPrams?: QP) => {
                return new Promise<TA>((resolve, reject) => {
                    if (this.mock.controller !== undefined || this.mock.data !== undefined) {
                        console.log('FAKE DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                            .query([queryPrams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    } else {
                        console.log('REAL DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .query([queryPrams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    }
                })
            },


            save: (item: A, queryParams?: QP) => {
                return new Promise<A>((resolve, reject) => {
                    if (this.mock.controller !== undefined || this.mock.data !== undefined) {
                        console.log('FAKE DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                            .save(item, [queryParams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    } else {
                        console.log('REAL DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .save(item, [queryParams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    }
                })
            },


            update: (item: A, queryParams?: QP) => {
                return new Promise<A>((resolve, reject) => {
                    if (this.mock.controller !== undefined || this.mock.data !== undefined) {
                        console.log('FAKE DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                            .update(item, [queryParams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    } else {
                        console.log('REAL DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .update(item, [queryParams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    }
                })
            },


            remove: (queryPrams?: QP) => {
                return new Promise<A>((resolve, reject) => {
                    if (this.mock.controller !== undefined || this.mock.data !== undefined) {
                        console.log('FAKE DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                            .remove([queryPrams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    } else {
                        console.log('REAL DATA OPTOIN')
                        this.handlers.push(this.api(this.endpoint,
                            UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                            .remove([queryPrams]).subscribe(
                            data => resolve(data),
                            err => reject(err)))
                    }
                })
            }


        }
    }
    __destroy() {
        this.handlers.forEach(h => h.unsubscribe());
    }

    // add(endpoint: E, model: string, group?: string, name?: string, description?: string) { }

    public constructor(private endpoint: E, private path_model: string) {
        super();
    }

}



/**
 *
 * @export
 * @class SimpleResource
 * @template E endpoint type
 * @template A single model type
 * @template TA array model type
 * @template RP rest parameters type
 * @template QP query parameters type
 */
export class SimpleResource<E, A, TA, RP extends Object, QP extends Rest.UrlParams> {
    model: Model<A, TA, RP, QP>;
    mock: Mock<A>;
    /**
     * Should be called in ngDestroy()
     */
    unsubscribeEvents: () => void;

    constructor(endpoint: E, model: string) {
        let rest = new ExtendedResource<E, A, TA, RP, QP>(endpoint, model);
        this.model = rest.model;
        this.mock = rest.mock;
        this.unsubscribeEvents = rest.__destroy;
    }

}
