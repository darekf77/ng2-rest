import { Inject } from '@angular/core';
import { Http, Jsonp, Headers } from '@angular/http';

import { Subscription } from 'rxjs';

import { Resource } from './resource.service';
import { Rest } from './rest';
import { UrlNestedParams } from './nested-params';
import { MockBackend, MockRequest, MockResponse } from './mock-backend';



export interface Mock<A> {
    controller: (req: MockRequest<A>, timeout?: number, howManyModels?: number) => MockResponse;
    timeout: number;
    howManyMock: number;
    data: any;
}

export interface RestPromises<A, TA, QP extends Rest.UrlParams> {
    get: (queryParams?: QP) => Promise<A>;
    query: (queryParams?: QP) => Promise<TA>;
    save: (item?: A, queryParams?: QP) => Promise<A>;
    update: (item?: A, queryParams?: QP) => Promise<A>;
    remove: (queryParams?: QP) => Promise<A>;
}

export interface Model<A, TA, RP extends Object, QP extends Rest.UrlParams> {
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

    public static handlers: Subscription[] = [];
    mock: Mock<A> = <Mock<A>>{ timeout: 100, howManyMock: 100, data: undefined };

    /**
     * Get model by rest params
    */
    model: Model<A, TA, RP, QP> = (restParams?: RP) => {

        return {

            get: (queryPrams?: QP) => {
                return new Promise<A>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.api(<any>this.endpoint,
                        UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .get([queryPrams]).subscribe(
                        data => resolve(data),
                        err => reject(err)))
                })
            },

            query: (queryPrams?: QP) => {
                return new Promise<TA>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.api(<any>this.endpoint,
                        UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .query([queryPrams]).subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            },


            save: (item: A, queryParams?: QP) => {
                return new Promise<A>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.api(<any>this.endpoint,
                        UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .save(item, [queryParams]).subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            },


            update: (item: A, queryParams?: QP) => {
                return new Promise<A>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.api(<any>this.endpoint,
                        UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .update(item, [queryParams]).subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            },


            remove: (queryPrams?: QP) => {
                return new Promise<A>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.api(<any>this.endpoint,
                        UrlNestedParams.interpolateParamsToUrl(restParams, this.path_model))
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .remove([queryPrams]).subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            }


        }
    }


    // add(endpoint: E, model: string, group?: string, name?: string, description?: string) { }

    public constructor(private endpoint: E | string, private path_model: string) {
        super();
        Resource.map(<any>endpoint, <any>endpoint);
        this.add(<any>endpoint, path_model);
    }

}



/**
 *
 * @export
 * @class SimpleResource
 * @template A single model type
 * @template TA array model type
 * @template RP rest parameters type
 * @template QP query parameters type
 */
export class SimpleResource<A, TA> {
    model: Model<A, TA, Object, Rest.UrlParams>;
    mock: Mock<A>;

    /**
     * Should be called in ngDestroy()
     */
    destroy: () => void;

    public static get mockingMode() {
        return Resource.mockingMode;
    }

    public static get headers() {
        return Resource.Headers;
    }

    public static __destroy() {
        ExtendedResource.handlers.forEach(h => h.unsubscribe());
    }

    constructor(endpoint: string, model: string) {
        let rest = new ExtendedResource<string, A, TA, Object, Rest.UrlParams>(endpoint, model);
        this.model = rest.model;
        this.mock = rest.mock;
        this.destroy = () => {
            ExtendedResource.handlers.forEach(h => h.unsubscribe());
        }
    }

}
