//#region imports
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Log, Level } from 'ng2-logger';
const log = Log.create('resouce-service',
  Level.__NOTHING
)

import { Rest } from './rest.class';
import { RestRequest } from './rest-request';
import { RestHeaders } from './rest-headers';
import { Cookie } from './cookie';
import { Mapping } from './mapping';
import { Models } from './models';
import { interpolateParamsToUrl, isValid, containsModels, getModels } from './params';
import { Circ } from 'json10';
//#endregion

declare const global: any;


export class Resource<E, T, TA> {

  public static DEFAULT_HEADERS = RestHeaders.from({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  private static _listenErrors = new Subject<Models.BackendError>();
  public static get listenErrors() {
    return this._listenErrors.asObservable();
  }
  public static enableWarnings: boolean = true;

  //#region private mthods and fields
  private getZone() {
    const isNode = (typeof window === 'undefined')
    if (isNode) { return };
    const ng = window['ng'];
    const getAllAngularRootElements = window['getAllAngularRootElements'];
    if (!ng || !getAllAngularRootElements) { return; }
    const probe = ng.probe;
    const coreTokens = ng.coreTokens;
    if (!coreTokens || !coreTokens.NgZone) { return; }
    const zoneClass = coreTokens.NgZone;
    if (!probe || typeof probe !== 'function' || !getAllAngularRootElements) { return; }
    const angularElements: any[] = getAllAngularRootElements();
    if (!Array.isArray(angularElements) || angularElements.length === 0) { return; }
    const rootElement = ng.probe(angularElements[0]);
    if (!rootElement) { return; }
    const injector = rootElement.injector;
    if (!injector || !injector.get || typeof injector.get !== 'function') { return; }
    const zone = injector.get(zoneClass)
    return zone;
  }


  public static initAngularNgZone(zone) {
    RestRequest.zone = zone;
  }

  private checkNestedModels(model: string, allModels: Object) {
    // if (model.indexOf('/') !== -1) { //TODO make this better, becouse now I unecesary checking shit
    for (let p in allModels) {
      if (allModels.hasOwnProperty(p)) {
        let m = allModels[p];
        if (isValid(p)) {
          let urlModels = getModels(p);
          if (containsModels(model, urlModels)) {
            model = p;
            break;
          }
        }
      }
    }
    // }
    return model;
  }

  private static instance = new Resource<string, any, any>();
  private static endpoints = {};
  public static getModel(endpoint: string, model: string): Rest<any> {
    model = Resource.prepareModel(model);
    const e = Resource.endpoints[endpoint];
    if (!e) { return void 0; }
    const r = Resource.endpoints[endpoint].models[model];
    return Resource.endpoints[endpoint].models[model];
  }
  private static request: RestRequest = new RestRequest();
  //#endregion


  //#region create
  public static create<A, TA = A[]>(
    e: string,
    model?: string,
    entityMapping?: Mapping.Mapping,
    circular?: Circ[]
  ): Models.ResourceModel<A, TA> {
    const badRestRegEX = new RegExp('((\/:)[a-z]+)+', 'g');
    const matchArr = model.match(badRestRegEX) || [];
    const badModelsNextToEachOther = matchArr.join();
    const atleas2DoubleDots = ((badModelsNextToEachOther.match(new RegExp(':', 'g')) || []).length >= 2);
    if (atleas2DoubleDots && model.search(badModelsNextToEachOther) !== -1) {
      throw new Error(`

Bad rest model: ${model}

Do not create rest models like this:    /book/author/:bookid/:authorid
Instead use nested approach:            /book/:bookid/author/:authorid
            `)
    };
    Resource.map(e, e);
    Resource.instance.add(e, model ? model : '', entityMapping, circular);
    // if (model.charAt(model.length - 1) !== '/') model = `${model}/`;
    return {
      model: (params?: Object) => Resource.instance.api(
        e,
        interpolateParamsToUrl(params, model)
      ),
      replay: (method: Models.HttpMethod) => {
        Resource.getModel(e, model).replay(method);
      },
      get headers() {
        return Resource.getModel(e, model).headers;
      }
    }
  }
  //#endregion

  //#region reset
  public static reset() {
    Resource.endpoints = {};
  }
  //#endregion

  //#region constructor
  private constructor() {
    setTimeout(() => {
      const zone = this.getZone();
      if (!RestRequest.zone) { RestRequest.zone = zone };
    })
  }
  //#endregion

  public static Cookies = Cookie.Instance;

  //#region map
  private static map(endpoint: string, url: string): boolean {

    log.i('url', url)
    let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    let e = endpoint;
    if (!regex.test(url)) {
      throw `Url address is not correct: ${url}`;
    }
    if (url.charAt(url.length - 1) === '/') url = url.slice(0, url.length - 1);
    log.i('url after', url)
    if (Resource.endpoints[e] !== void 0) {
      console.warn('Cannot use map function at the same API endpoint again ('
        + Resource.endpoints[e].url + ')');
      return false;
    }
    Resource.endpoints[e] = {
      url: url,
      models: {},
      entity: null
    };
    log.i('enpoints', Resource.endpoints)
    return true;
  }
  //#endregion

  private static prepareModel(model) {
    if (model.charAt(model.length - 1) === '/') model = model.slice(0, model.length - 1);
    if (model.charAt(0) === '/') model = model.slice(1, model.length);
    return model;
  }


  //#region add
  /**
   * And enipoint to application
   *
   * @param {E} endpoint
   * @param {string} model
   * @returns {boolean}
   */
  private add(endpoint: E, model: string, entity: Mapping.Mapping, circular?: Circ[]) {
    log.i(`I am maping ${model} on ${<any>endpoint}`);
    model = Resource.prepareModel(model);

    let e: string;
    e = <string>(endpoint).toString();

    if (Resource.endpoints[e] === void 0) {
      console.error('Endpoint is not mapped ! Cannot add model ' + model);
      return;
    }
    if (Resource.endpoints[e].models[model] !== void 0) {
      if (Resource.enableWarnings) console.warn(`Model '${model}' is already defined in endpoint: `
        + Resource.endpoints[e].url);
      return;
    }
    Resource.endpoints[e].models[model] =
      new Rest<T, TA>(Resource.endpoints[e].url
        + '/' + model, Resource.request, {
        endpoint: e,
        path: model,
        entity,
        circular
      });
    return;
  }
  //#endregion

  //#region api
  /**
   * Access api throught endpoint
   *
   * @param {E} endpoint
   * @param {string} model
   * @returns {Rest<T, TA>}
   */
  private api(endpoint: E, model: string): Rest<T, TA> {
    // log.i(`[api]

    // creating for endpoint: "${endpoint}"
    // model: "${model}"

    // `)
    if (model.charAt(0) === '/') model = model.slice(1, model.length);
    let e = <string>(endpoint).toString();
    if (Resource.endpoints[e] === void 0) {
      throw `Endpoint: ${<any>endpoint} is not mapped ! Cannot add model: ${model}`;
    }
    let allModels: Object = Resource.endpoints[e].models;
    let orgModel = model;
    model = this.checkNestedModels(model, allModels);

    if (Resource.endpoints[e].models[model] === void 0) {
      // log.d('Resource.endpoints', Resource.endpoints);
      throw `Model '${model}' is undefined in endpoint: ${Resource.endpoints[e].url} `;
    }

    let res: Rest<T, TA> = Resource.endpoints[<string>(endpoint).toString()].models[model];

    // log.d(`
    // orgModel: ${orgModel}
    // model: ${model}

    // `)
    if (orgModel !== model) {
      let baseUrl = Resource.endpoints[<string>(endpoint).toString()].url;
      // log.d('base', Resource.endpoints[<string>(endpoint).toString()])
      // log.d('baseUrl', baseUrl)
      // log.d('orgModel', orgModel)
      res.__rest_endpoint = `${baseUrl}/${orgModel}`;
    } else {
      res.__rest_endpoint = void 0;
    };

    // log.i(`Resource.endpoints`, Resource.endpoints)
    return res;
  }
  //#endregion

}



// const res = Resource.create('')
// res.model()
//   .mock({
//     code: 500,
//     data: {},
//     isArray: true
//   })
//   .array.
