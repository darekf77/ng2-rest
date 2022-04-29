import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Observer } from 'rxjs';

import { Models } from '../models';
import { Resource } from '../resource.service';



export interface RestPromises<A, TA, QP extends Models.UrlParams> {
  get: (queryParams?: QP) => Observable<Models.HttpResponse<A>>;
  head: (queryParams?: QP) => Observable<Models.HttpResponse<A>>;
  query: (queryParams?: QP) => Observable<Models.HttpResponse<TA>>;
  put: (item?: A, queryParams?: QP) => Observable<Models.HttpResponse<A>>;
  patch: (item?: A, queryParams?: QP) => Observable<Models.HttpResponse<A>>;
  post: (item?: A, queryParams?: QP) => Observable<Models.HttpResponse<A>>;
  delete: (queryParams?: QP) => Observable<Models.HttpResponse<A> | any>;
}

export interface Model<A, TA, RP extends Object, QP extends Models.UrlParams> {
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
class ExtendedResource<E, A, TA, RP extends Object, QP extends Models.UrlParams>  {
  public static doNotSerializeQueryParams = false;
  public static handlers: Subscription[] = [];

  rest: Models.ResourceModel<A, TA>;

  /**
   * Get model by rest params
  */
  model: Model<A, TA, RP, QP> = (restParams?: RP) => {

    return {

      get: (queryPrams?: QP) => {
        return Observable.create((observer: Observer<A>) => {
          ExtendedResource.handlers.push(this.rest.model(restParams)
            .get([queryPrams], ExtendedResource.doNotSerializeQueryParams)
            .observable
            .subscribe(
              data => observer.next(data.body.json),
              err => observer.error(err),
              () => observer.complete()))
        })
      },

      patch: (item: A, queryParams?: QP) => {
        return Observable.create((observer: Observer<A>) => {
          ExtendedResource.handlers.push(this.rest.model(restParams)
            .put(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
            .observable
            .subscribe(
              data => observer.next(data.body.json),
              err => observer.error(err),
              () => observer.complete()))
        })

      },

      head: (queryPrams?: QP) => {
        return Observable.create((observer: Observer<A>) => {
          ExtendedResource.handlers.push(this.rest.model(restParams)
            .head([queryPrams], ExtendedResource.doNotSerializeQueryParams)
            .observable
            .subscribe(
              data => observer.next(data.body.json),
              err => observer.error(err),
              () => observer.complete()))
        })
      },

      query: (queryPrams?: QP) => {
        return Observable.create((observer: Observer<TA>) => {
          ExtendedResource.handlers.push(this.rest.model(restParams).
            array
            .get([queryPrams], ExtendedResource.doNotSerializeQueryParams)
            .observable
            .subscribe(
              data => observer.next(data.body.json),
              err => observer.error(err),
              () => observer.complete()))
        })
      },


      post: (item: A, queryParams?: QP) => {
        return Observable.create((observer: Observer<A>) => {
          ExtendedResource.handlers.push(this.rest.model(restParams)
            .post(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
            .observable
            .subscribe(
              data => observer.next(data.body.json),
              err => observer.error(err),
              () => observer.complete()))
        })

      },


      put: (item: A, queryParams?: QP) => {
        return Observable.create((observer: Observer<A>) => {
          ExtendedResource.handlers.push(this.rest.model(restParams)
            .put(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
            .observable
            .subscribe(
              data => observer.next(data.body.json),
              err => observer.error(err),
              () => observer.complete()))
        })

      },


      delete: (queryPrams?: QP) => {
        return Observable.create((observer: Observer<A>) => {
          ExtendedResource.handlers.push(this.rest.model(restParams)
            .delete([queryPrams], ExtendedResource.doNotSerializeQueryParams)
            .observable
            .subscribe(
              data => observer.next(data.body.json),
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
  model: Model<A, TA, Object, Models.UrlParams>;


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

  public static __destroy() {
    ExtendedResource.handlers.forEach(h => h.unsubscribe());
  }

  constructor(endpoint: string, model: string) {
    let rest = new ExtendedResource<string, A, TA, Object, Models.UrlParams>(endpoint, model);
    this.model = rest.model;
  }

}
