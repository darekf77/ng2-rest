//#region import
// import { Log, Level } from 'ng2-logger/src';

// const log = Log.create('rest.class', Level.__NOTHING)

import { CLASS } from 'typescript-class-helpers/src';

import { CONTENT_TYPE } from './content-type';
import { Models } from './models';
import { getRestParams, getParamsUrl } from './params';
import { RestHeaders } from './rest-headers';
import { RestRequest } from './rest-request';
//#endregion

export class Rest<T, TA = T[]> implements Models.FnMethodsHttpWithMock<T, TA> {
  private mockHttp: Models.MockHttp;
  mock(mock: Models.MockHttp): Models.FnMethodsHttp<T, TA> {
    if (typeof mock === 'function' || typeof mock === 'object') {
      this.mockHttp = mock;
    } else {
      throw `[ng2-rest]
      .model(...)
      .mock( < BAD MOCK DATA > )
      ...
      `;
    }
    return this;
  }

  //#region  private fields
  private __meta_endpoint: string;
  private _endpointRest: string;
  private get endpoint() {
    let e = this.__meta_endpoint;
    if (
      this.restQueryParams !== void 0 &&
      this._endpointRest !== void 0 &&
      typeof this._endpointRest === 'string' &&
      this._endpointRest.trim() !== ''
    )
      e = this._endpointRest;
    return e;
  }
  private restQueryParams: Object;
  public set __rest_endpoint(endpoint) {
    this._endpointRest = endpoint;
    if (endpoint === void 0) {
      this.restQueryParams = void 0;
    } else {
      this.restQueryParams = getRestParams(endpoint, this.__meta_endpoint);
    }
  }

  private creatUrl(params: any, doNotSerializeParams: boolean = false) {
    return `${this.endpoint}${getParamsUrl(params, doNotSerializeParams)}`;
  }

  //#endregion

  //#region  constructor
  private _headers = RestHeaders.from(CONTENT_TYPE.APPLICATION_JSON);
  get headers() {
    return this._headers;
  }
  constructor(
    endpoint: string,
    private request: RestRequest,
    private meta: Models.MetaRequest,
    private customContentType: RestHeaders,
  ) {
    this.__meta_endpoint = endpoint;
  }
  //#endregion

  //#region  req

  private req(
    method: Models.HttpMethod,
    requestBody: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    isArray: boolean = false,
  ) {
    axiosOptions = axiosOptions || {};
    const modelUrl = this.creatUrl(params, !!axiosOptions.doNotSerializeParams);

    const isFormData = CLASS.getNameFromObject(requestBody) === 'FormData';

    const body = isFormData
      ? requestBody
      : requestBody
        ? JSON.stringify(requestBody)
        : void 0;

    // console.log('this.customContentType', this.customContentType)
    if (this.customContentType) {
      const customHeaderKeys = this.customContentType.keys();
      const currentHeaderKeys = this._headers.keys();
      currentHeaderKeys
        .filter(key => !customHeaderKeys.includes(key))
        .forEach(key => {
          this.customContentType.set(key, this._headers.get(key));
        });
      this._headers = this.customContentType;
    } else {
      this._headers = RestHeaders.from(CONTENT_TYPE.APPLICATION_JSON);
    }

    // console.log("_headers", this.headers)

    const result = this.request[method.toLowerCase()](
      modelUrl,
      body,
      this.headers,
      this.meta,
      isArray,
      this.mockHttp,
      axiosOptions,
    );

    this.mockHttp = void 0;
    return result;
  }
  //#endregion

  //#region http methods

  array = {
    get: (
      item: TA,
      params: Models.UrlParams[] = void 0,
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('get', item as any, params, axiosOptions, true) as any;
    },
    head: (
      item: TA,
      params: Models.UrlParams[] = void 0,
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('head', item as any, params, axiosOptions, true) as any;
    },
    post: (
      item: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('post', item as any, params, axiosOptions, true) as any;
    },
    put: (
      item: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('put', item as any, params, axiosOptions, true) as any;
    },
    patch: (
      item: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('patch', item as any, params, axiosOptions, true) as any;
    },
    delete: (
      item: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('delete', item as any, params, axiosOptions, true) as any;
    },
    jsonp: (
      item: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('jsonp', item as any, params, axiosOptions, true) as any;
    },
  };

  get(
    item: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('get', item as any, params, axiosOptions) as any;
  }

  head(
    item: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('head', item as any, params, axiosOptions) as any;
  }

  post(
    item: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('post', item, params, axiosOptions);
  }

  put(
    item: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('put', item, params, axiosOptions);
  }

  patch(
    item: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('patch', item, params, axiosOptions);
  }

  delete(
    item: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('delete', item, params, axiosOptions);
  }

  jsonp(
    item: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('jsonp', item, params, axiosOptions);
  }
  //#endregion
}
