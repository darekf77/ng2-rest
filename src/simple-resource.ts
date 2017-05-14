
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observer } from "rxjs/Observer";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { Resource, ResourceModel } from './resource.service';
import { Rest as ModuleRest } from './rest';
import { UrlNestedParams } from './nested-params';
import { MockBackend, MockRequest, MockResponse } from './mock-backend';
import { Rest } from "./rest.class";
import { RestHeaders } from './rest-headers';


export interface Mock<A> {
    controller: (req: MockRequest<A>, timeout?: number, howManyModels?: number) => MockResponse;
    timeout: number;
    howManyMock: number;
    data: any;
}

export interface RestPromises<A, TA, QP extends ModuleRest.UrlParams> {
    get: (queryParams?: QP) => Observable<A>;
    query: (queryParams?: QP) => Observable<TA>;
    save: (item?: A, queryParams?: QP) => Observable<A>;
    update: (item?: A, queryParams?: QP) => Observable<A>;
    remove: (queryParams?: QP) => Observable<A | any>;
}

export interface Model<A, TA, RP extends Object, QP extends ModuleRest.UrlParams> {
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
class ExtendedResource<E, A, TA, RP extends Object, QP extends ModuleRest.UrlParams>  {
    public static doNotSerializeQueryParams = false;
    public static handlers: Subscription[] = [];

    rest: ResourceModel<A, TA>;

    /**
     * Get model by rest params
    */
    model: Model<A, TA, RP, QP> = (restParams?: RP) => {

        return {

            get: (queryPrams?: QP) => {
                return Observable.create((observer: Observer<A>) => {
                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .get([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => observer.next(data),
                        err => observer.error(err),
                        () => observer.complete()))
                })
            },

            query: (queryPrams?: QP) => {
                return Observable.create((observer: Observer<TA>) => {
                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .query([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => observer.next(data),
                        err => observer.error(err),
                        () => observer.complete()))
                })
            },


            save: (item: A, queryParams?: QP) => {
                return Observable.create((observer: Observer<A>) => {
                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .save(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => observer.next(data),
                        err => observer.error(err),
                        () => observer.complete()))
                })

            },


            update: (item: A, queryParams?: QP) => {
                return Observable.create((observer: Observer<A>) => {
                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .update(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => observer.next(data),
                        err => observer.error(err),
                        () => observer.complete()))
                })

            },


            remove: (queryPrams?: QP) => {
                return Observable.create((observer: Observer<A>) => {
                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .remove([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => observer.next(data),
                        err => observer.error(err),
                        () => observer.complete()))
                })
            }


        }
    }


    // add(endpoint: E, model: string, group?: string, name?: string, description?: string) { }

    public constructor(private endpoint: E | string, private path_model: string) {
        this.rest = <any>Resource.create<A, TA>(<any>endpoint, path_model);

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
    model: Model<A, TA, Object, ModuleRest.UrlParams>;


    private static _isSetQueryParamsSerialization = false;
    public static set doNotSerializeQueryParams(value) {
        if (!SimpleResource._isSetQueryParamsSerialization) {
            SimpleResource._isSetQueryParamsSerialization = true;
            ExtendedResource.doNotSerializeQueryParams = value
            return;
        }
        console.warn(`Query params serialization already set as 
        ${ExtendedResource.doNotSerializeQueryParams},`);
    }



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
        let rest = new ExtendedResource<string, A, TA, Object, ModuleRest.UrlParams>(endpoint, model);
        this.model = rest.model;
    }

}

