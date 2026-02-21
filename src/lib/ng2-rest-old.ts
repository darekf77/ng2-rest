//#region imports
import { Blob } from 'buffer'; // @backend
import { Stream } from 'node:stream'; // @backend

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { diffChars } from 'diff';
import type express from 'express';
import * as FormData from 'form-data'; // @backend
import { Circ, JSON10 } from 'json10/src';
import { walk } from 'lodash-walk-object/src';
import { Level } from 'ng2-logger/src';
import { Log, Logger } from 'ng2-logger/src';
import { firstValueFrom, from, Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { _, CoreModels } from 'tnp-core/src';
import { Helpers } from 'tnp-core/src';
import { UtilsOs } from 'tnp-core/src';
import { CLASS, SYMBOL } from 'typescript-class-helpers/src';
//#endregion

//#region cookie

export class Cookie {
  public static get Instance(): Cookie {
    if (!Cookie.__instance) {
      Cookie.__instance = new Cookie();
    }
    return Cookie.__instance as any;
  }

  private static __instance;

  private constructor() {}

  read(name: string) {
    var result = new RegExp(
      '(?:^|; )' + encodeURIComponent(name) + '=([^;]*)',
    ).exec(document.cookie);
    return result ? result[1] : null;
  }

  write(name: string, value: string, days?: number) {
    if (!days) {
      days = 365 * 20;
    }

    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    var expires = '; expires=' + date.toUTCString();

    document.cookie = name + '=' + value + expires + '; path=/';
  }

  remove(name: string) {
    this.write(name, '', -1);
  }
}

//#endregion

//#region models

class RestCommonHttpResponseWrapper {
  declare success?: boolean;
}

export class RestResponseWrapper extends RestCommonHttpResponseWrapper {
  declare data?: any;
}

export class RestErrorResponseWrapper extends RestCommonHttpResponseWrapper {
  declare message: string;

  /**
   * stack trace / more details about error
   */
  declare details?: string;

  /**
   * http status code
   */
  declare status?: number;

  /**
   * custom error code from backend
   */
  declare code?: string;
}

// const log = Log.create('rest namespace', Level.__NOTHING)

export namespace Models {
  // export import HttpMethod = CoreModels.HttpMethod;
  // export import ParamType = CoreModels.ParamType;

  export interface HandleResultOptions {
    res: Models.MockResponse;
    method: CoreModels.HttpMethod;
    jobid?: number;
    isArray?: boolean;
  }

  export interface HandleResultSourceRequestOptions {
    url: string;
    method: CoreModels.HttpMethod;
    headers?: RestHeaders,
    body: any;
    isArray: boolean;
  }

  export type BackendError = {
    msg?: string;
    stack?: string[];
    data: any;
  };

  export type MetaRequest = {
    path: string;
    endpoint: string;
    entity: Mapping.Mapping;
    circular: Circ[];
  };
  export type HttpCode = 200 | 400 | 401 | 404 | 500;

  export type PromiseObservableMix<T> = Promise<T> & {
    observable: Observable<T>;
  };

  export type Ng2RestAxiosRequestConfig = {
    doNotSerializeParams?: boolean;
  } & AxiosRequestConfig<any>;

  export type MethodWithBody<E, T, R = PromiseObservableMix<E>> = (
    item?: T,
    params?: UrlParams[],
    axiosOptions?: Ng2RestAxiosRequestConfig,
  ) => R;
  export type ReplayData = {
    subject: Subject<any>;
    data: { url: string; body: string; headers: RestHeaders; isArray: boolean };
    /**
     * jobid
     */
    id: number;
  };
  export type ReqParams = {
    url: string;
    method: CoreModels.HttpMethod;
    headers?: RestHeaders;
    body?: any;
    jobid: number;
    isArray: boolean;
  };

  export interface ResourceModel<A, TA> {
    model: (pathModels?: Object, responseObjectType?: Function) => Rest<A, TA>;
    headers: RestHeaders;
  }

  export interface Ng2RestMethods<E, T> {
    get: MethodWithBody<E, T>;
    post: MethodWithBody<E, T>;
    put: MethodWithBody<E, T>;
    patch: MethodWithBody<E, T>;
    head: MethodWithBody<E, T>;
    delete: MethodWithBody<E, T>;
    jsonp: MethodWithBody<E, T>;
  }

  export type MockController = (
    url: string,
    method: CoreModels.HttpMethod,
    headers?: RestHeaders,
    body?: any,
  ) => MockResponse;

  export type MockHttp = MockResponse | MockController;

  export interface FnMethodsHttp<T, TA> extends Ng2RestMethods<
    HttpResponse<T>,
    T
  > {
    array: Ng2RestMethods<HttpResponse<TA>, TA>;
  }

  export interface FnMethodsHttpWithMock<T, TA> extends Ng2RestMethods<
    HttpResponse<T>,
    T
  > {
    array: Ng2RestMethods<HttpResponse<TA>, TA>;
  }

  export interface NestedParams {
    [params: string]: string;
  }

  export interface UrlParams {
    [urlModelName: string]: string | number | boolean | RegExp | Object;
    regex?: RegExp;
  }
  [];

  export abstract class BaseBody {
    protected toJSON(
      data,
      opt: {
        isJSONArray?: boolean;
        parsingError?: boolean;
      },
    ): object | undefined {
      opt = opt || { isJSONArray: false };
      let r = opt.isJSONArray ? [] : {};
      if (typeof data === 'string') {
        try {
          let parsed = JSON.parse(data);
          if (typeof parsed === 'string' && parsed.trim().startsWith('{')) {
            parsed = JSON.parse(parsed);
          }
          if (opt.parsingError && parsed[CoreModels.TaonHttpErrorCustomProp]) {
            return _.merge(new RestErrorResponseWrapper(), parsed);
          }
          return parsed;
        } catch (e) {}
      } else if (typeof data === 'object') {
        return data;
      }
      return r as any;
    }
  }

  export class HttpBody<T> extends BaseBody {
    constructor(
      private responseText: string | Blob,
      private isArray = false,
      private entity: Mapping.Mapping,
      private circular: Circ[],
    ) {
      super();
    }

    public get blob(): Blob {
      return this.responseText as Blob;
    }

    public get booleanValue(): boolean | undefined {
      if (!Helpers.isBlob(this.responseText)) {
        return ['ok', 'true'].includes((this.responseText as string)?.trim());
      }
    }

    public get numericValue(): number | undefined {
      if (!Helpers.isBlob(this.responseText)) {
        return Number((this.responseText as string)?.trim());
      }
    }

    public get rawJson(): Partial<T> {
      if (!Helpers.isBlob(this.responseText)) {
        let res = this.toJSON(this.responseText, { isJSONArray: this.isArray });
        if (this.circular && Array.isArray(this.circular)) {
          res = JSON10.parse(JSON.stringify(res), this.circular);
        }

        return res;
      }
    }

    public get json(): T {
      const isBlob = Helpers.isBlob(this.responseText);
      if (isBlob) {
        return void 0;
      }
      if (this.entity && typeof this.entity === 'function') {
        return this.entity(); // @LAST
      }
      if (this.entity && typeof this.entity === 'object') {
        const json = this.toJSON(this.responseText, {
          isJSONArray: this.isArray,
        });
        return Mapping.encode(json, this.entity, this.circular) as any;
      }
      let res = this.toJSON(this.responseText, { isJSONArray: this.isArray });
      if (this.circular && Array.isArray(this.circular)) {
        res = JSON10.parse(JSON.stringify(res), this.circular);
      }
      return res as any;
    }

    /**
     * undefined when blob
     */
    public get text(): string | undefined {
      if (!Helpers.isBlob(this.responseText)) {
        return (this.responseText as string)
          .replace(/^\"/, '')
          .replace(/\"$/, '');
      }
    }
  }

  export class ErrorBody<T = RestErrorResponseWrapper> extends BaseBody {
    constructor(private data) {
      super();
    }

    public get json(): T {
      return this.toJSON(this.data, { parsingError: true }) as any;
    }

    public get text(): string {
      return this.data;
    }
  }

  export abstract class BaseResponse<T> {
    protected static readonly cookies = Cookie.Instance;

    public get cookies() {
      return BaseResponse.cookies;
    }

    constructor(
      public responseText?: string | Blob,
      public readonly headers?: RestHeaders,
      public readonly statusCode?: HttpCode | number,
      public isArray = false,
    ) {}
  }

  export class HttpResponse<T> extends BaseResponse<T> {
    public body: HttpBody<T>;
    // public readonly TOTAL_COUNT_HEADER = 'X-Total-Count'.toLowerCase();
    // public get totalElements(): number {
    //     return Number(this.headers.get(this.TOTAL_COUNT_HEADER));
    // }

    constructor(
      public sourceRequest: Models.HandleResultSourceRequestOptions,
      public responseText?: string | Blob,
      public headers?: RestHeaders,
      public statusCode?: HttpCode | number,
      public entity?: Mapping.Mapping | Function,
      public circular?: Circ[],
      public jobid?: number,
      public isArray = false,
    ) {
      // console.log({
      //   sourceRequest, responseText, headers, statusCode, entity, circular, jobid, isArray
      // })
      super(responseText, headers, statusCode, isArray);

      this.init();
    }

    public init() {
      if (typeof this.entity === 'string') {
        // const headerWithMapping = headers.get(entity);
        let entityJSON = this.headers?.getAll(this.entity);
        if (!!entityJSON) {
          this.entity = JSON.parse(entityJSON.join());
        }
      }
      if (typeof this.circular === 'string') {
        // const headerWithMapping = headers.get(circular);
        let circuralJSON = this.headers?.getAll(this.circular);
        if (!!circuralJSON) {
          this.circular = JSON.parse(circuralJSON.join());
        }
      }
      this.body = new HttpBody(
        this.responseText,
        this.isArray,
        this.entity,
        this.circular,
      ) as any;
    }
  }

  export interface MockResponse {
    data?: any;
    code?: HttpCode;
    error?: string;
    headers?: RestHeaders;
    jobid?: number;
    isArray: boolean;
  }

  export type ResponseTypeAxios =
    | 'blob'
    | 'text'
    //#region @backend
    | 'arraybuffer'
    | 'document'
    | 'stream';
  // | 'json' - I am parsing json from text...

  //#endregion
}

export class HttpResponseError<
  ERROR_BODY = object,
> extends Models.BaseResponse<any> {
  public readonly body: Models.ErrorBody<ERROR_BODY>;
  // public tryRecconect() {

  // }
  constructor(
    public message: string,
    responseText?: string,
    headers?: RestHeaders,
    statusCode?: Models.HttpCode | number,
    public jobid?: number,
    public sourceRequest?: Models.HandleResultSourceRequestOptions,
  ) {
    super(responseText, headers, statusCode);
    this.body = new Models.ErrorBody<ERROR_BODY>(responseText);
  }
}

//#endregion

//#region axios intercepstors
export interface AxiosTaonHttpHandler<T = any> {
  handle(req: AxiosRequestConfig): Observable<AxiosResponse<T>>;
}

export interface TaonClientMiddlewareInterceptOptions<T = any> {
  req: AxiosRequestConfig; // <- request config only (no AxiosResponse here)
  next: AxiosTaonHttpHandler<T>;
}

export interface TaonServerMiddlewareInterceptOptions<T = any> {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
}

export interface TaonAxiosClientInterceptor<T = any> {
  intercept(
    client: TaonClientMiddlewareInterceptOptions<T>,
  ): Observable<AxiosResponse<T>>;
}

// Optional helper for passing around context (browser/client)

// === Backend handler (last in chain) ===
export class AxiosBackendHandler<T = any> implements AxiosTaonHttpHandler<T> {
  handle(req: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    // axios returns a Promise; wrap as Observable
    return from(axios.request<T>(req));
  }
}

// === Chain builder (request: forward order, response: reverse order) ===
export const buildInterceptorChain = <T = any>(
  interceptors: Array<TaonAxiosClientInterceptor<T>>,
  backend: AxiosTaonHttpHandler<T>,
): AxiosTaonHttpHandler<T> => {
  return interceptors.reduceRight<AxiosTaonHttpHandler<T>>(
    (next, interceptor) => ({
      handle: req => interceptor.intercept({ req, next }),
    }),
    backend,
  );
};

//#endregion

//#region mapping

export namespace Mapping {
  export function decode(json: Object, autodetect = false): Mapping {
    // console.log('DECODE isBrowser', HelpersLog.isBrowser)
    if (_.isUndefined(json)) {
      return void 0;
    }

    let mapping = decodeFromDecorator(
      _.isArray(json) ? _.first(json) : json,
      !autodetect,
    );

    if (autodetect) {
      mapping = _.merge(getMappingNaive(json), mapping);
    }

    return mapping;
  }

  export function encode<T = Function>(
    json: Object,
    mapping: Mapping,
    circular: Circ[] = [],
  ): T {
    if (_.isString(json) || _.isBoolean(json) || _.isNumber(json)) {
      return json as any;
    }

    if (mapping['']) {
      const decoratorMapping = getModelsMapping(CLASS.getBy(mapping['']));
      mapping = _.merge(mapping, decoratorMapping);
    }

    let res: any;
    if (_.isArray(circular) && circular.length > 0) {
      res = setMappingCirc(json, mapping, circular);
    } else {
      res = setMapping(json, mapping);
    }
    return res;
  }

  function decodeFromDecorator(json: Object, production = false): Mapping {
    const entityClass = CLASS.getFromObject(json);
    const mappings = getModelsMapping(entityClass);
    return mappings as any;
  }

  export function getModelsMapping(entity: Function) {
    if (!_.isFunction(entity) || entity === Object) {
      return {};
    }
    const className = CLASS.getName(entity);
    // console.log(`getMaping for: '${className}' `)
    let enityOWnMapping: any[] = _.isArray(entity[SYMBOL.MODELS_MAPPING])
      ? entity[SYMBOL.MODELS_MAPPING]
      : [{ '': className }];

    let res = {};
    let parents = enityOWnMapping
      .filter(m => !_.isUndefined(m['']) && m[''] !== className)
      .map(m => m['']);

    enityOWnMapping.reverse().forEach(m => {
      m = _.cloneDeep(m);
      // console.log(`'${className}' m:`, m)
      Object.keys(m).forEach(key => {
        const v = m[key];
        const isArr = _.isArray(v);
        const model = isArr ? _.first(v) : v;
        if (parents.includes(model)) {
          m[key] = isArr ? [className] : className;
        }
      });
      res = _.merge(res, m);
    });
    res[''] = className;
    // console.log(`mapping for ${className} : ${JSON.stringify(res)}`)
    return res;
  }

  export type Mapping<T = {}> = {
    [P in keyof T]?: string | string[];
  };

  function add(o: Object, path: string, mapping: Mapping = {}) {
    if (!o || Array.isArray(o) || typeof o !== 'object') return;
    const proptotypeObj = Object.getPrototypeOf(o);
    if (!proptotypeObj) {
      return;
    }
    const objectClassName = CLASS.getName(proptotypeObj.constructor);
    const resolveClass = CLASS.getBy(objectClassName);
    if (!resolveClass) {
      if (objectClassName !== 'Object') {
        if (UtilsOs.isBrowser) {
          console.error(
            `Cannot resolve class "${objectClassName}" while mapping.`,
          );
        }
      }
      return;
    }
    if (!mapping[path]) mapping[path] = CLASS.getName(resolveClass) as any;
  }

  /**
   * USE ONLY IN DEVELOPMENT
   * @param c
   * @param path
   * @param mapping
   * @param level
   */
  function getMappingNaive(
    c: Object,
    path = '',
    mapping: Mapping = {},
    level = 0,
  ) {
    if (c === null || c === undefined) {
      return;
    }
    //#region @backend
    if (c instanceof Stream) {
      return;
    }
    //#endregion
    // console.log({c})
    if (Array.isArray(c)) {
      c.forEach(c => getMappingNaive(c, path, mapping, level));
      return mapping;
    }
    if (++level === 16) return;
    add(c, path, mapping);
    for (var p in c) {
      if (_.isFunction(c.hasOwnProperty) && c.hasOwnProperty(p)) {
        const v = c[p];
        if (Array.isArray(v) && v.length > 0) {
          // reducer as impovement
          v.forEach((elem, i) => {
            // const currentPaht = [`path[${i}]`, p].filter(c => c.trim() != '').join('.');
            const currentPaht = [path, p].filter(c => c.trim() != '').join('.');
            getMappingNaive(elem, currentPaht, mapping, level);
          });
        } else if (typeof v === 'object') {
          const currentPaht = [path, p].filter(c => c.trim() != '').join('.');
          add(v, currentPaht, mapping);
          getMappingNaive(v, currentPaht, mapping, level);
        }
      }
    }
    return mapping;
  }

  function getMappingPathFrom(pathLodhas: string) {
    if (!_.isString(pathLodhas)) {
      return void 0;
    }
    const regex = /\[([0-9a-zA-Z]|\'|\")*\]/g;
    pathLodhas = pathLodhas.replace(regex, '').replace('..', '.');
    if (pathLodhas.startsWith('.')) {
      pathLodhas = pathLodhas.slice(1);
    }
    return pathLodhas;
  }

  function setMappingCirc(
    json: Object,
    mapping: Mapping = {},
    circular: Circ[] = [],
  ) {
    const mainClassFn = !_.isArray(json) && CLASS.getBy(mapping['']);
    // console.log(mapping)
    walk.Object(json, (v, lodashPath, changeValue) => {
      if (!_.isUndefined(v) && !_.isNull(v)) {
        const mappingPath = getMappingPathFrom(lodashPath);
        if (!_.isUndefined(mapping[mappingPath])) {
          const isArray = _.isArray(mapping[mappingPath]);
          if (!isArray) {
            const className = isArray
              ? _.first(mapping[mappingPath])
              : mapping[mappingPath];
            const classFN = CLASS.getBy(className);
            if (_.isFunction(classFN)) {
              // console.log(`mapping: '${mappingPath}', lp: '${lodashPath}' class: '${className}' , set `, v.location)
              changeValue(_.merge(new (classFN as any)(), v));
            }
          }
        }
      }
    });

    circular.forEach(c => {
      const ref = _.get(json, c.circuralTargetPath);
      _.set(json, c.pathToObj, ref);
    });

    if (_.isFunction(mainClassFn)) {
      json = _.merge(new (mainClassFn as any)(), json);
    }

    return json;
  }

  function setMapping(json: Object, mapping: Mapping = {}) {
    // console.log('mapping', mapping)
    if (Array.isArray(json)) {
      return json.map(j => {
        return setMapping(j, mapping);
      });
    }

    const mainClassFn = CLASS.getBy(mapping['']);

    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        // if (mainClassFn && mainClassFn.name === 'Project') {
        //   // console.log(`OWn property: "${key}"`)
        // }
        if (_.isArray(json[key])) {
          json[key] = json[key].map(arrObj => {
            const objMapping = getModelsMapping(CLASS.getBy(mapping[key]));
            return setMapping(arrObj, objMapping);
          });
        } else if (_.isObject(json[key])) {
          const objMapping = getModelsMapping(CLASS.getBy(mapping[key]));
          json[key] = setMapping(json[key], objMapping);
        }
      }
      // else {
      //   if (mainClassFn && mainClassFn.name === 'Project') {
      //     // console.log(`Not own property: "${key}"`)
      //   }
      // }
    }

    Object.keys(mapping)
      .filter(key => key !== '' && key.split('.').length >= 2)
      .forEach(lodasPath => {
        // console.log(`Loadsh path: ${lodasPath}`)
        const objMapping = getModelsMapping(CLASS.getBy(mapping[lodasPath]));
        const input = _.get(json, lodasPath);
        if (!_.isUndefined(input)) {
          const res = setMapping(input, objMapping);
          _.set(json, lodasPath, res);
        }
      });

    if (!mainClassFn) {
      return json;
    }
    return _.merge(new (mainClassFn as any)(), json);
  }

  export type ModelValue<T> = {
    /**
     * Inside models types
     */
    [propName in keyof T]?: T[propName];
  };

  export function DefaultModelWithMapping<T = Object>(
    defaultModelValues?: ModelValue<T>,
    mapping?: Mapping<T>,
  ) {
    return function (target: Function) {
      if (!_.isArray(target[SYMBOL.MODELS_MAPPING])) {
        target[SYMBOL.MODELS_MAPPING] = [];
      }

      (target[SYMBOL.MODELS_MAPPING] as any[]).push({
        '': CLASS.getName(target),
      });
      if (_.isObject(mapping)) {
        target[SYMBOL.MODELS_MAPPING] = (
          target[SYMBOL.MODELS_MAPPING] as any[]
        ).concat(mapping);
        Object.keys(mapping).forEach(key => {
          const v = mapping;
          if (_.isUndefined(v) || _.isFunction(v)) {
            throw `


            Class: '${target.name}'
[ng2rest] Bad mapping value for path: ${key} , please use type: <string> or [<string>]
`;
          }
        });
      }

      if (_.isObject(defaultModelValues)) {
        const toMerge = {};
        const describedTarget = CLASS.describeProperites(target).filter(prop =>
          /^([a-zA-Z0-9]|\_|\#)+$/.test(prop),
        );
        // console.log(`describedTarget: ${describedTarget} for ${target.name}`)
        describedTarget.forEach(propDefInConstr => {
          if (defaultModelValues[propDefInConstr]) {
            console.warn(`

            CONFLICT: default value for property: "${propDefInConstr}"
            in class "${target.name}" already defined as typescript
            default class proprty value.

            `);
          } else {
            toMerge[propDefInConstr] = null; // TODO from toString I can't know that
          }
        });

        // console.log(`merge "${JSON.stringify(target.prototype)}" with "${JSON.stringify(defaultModelValues)}"`)

        target[SYMBOL.DEFAULT_MODEL] = _.merge(toMerge, defaultModelValues);

        const propsToOmmit = Object.keys(target[SYMBOL.DEFAULT_MODEL]).filter(
          key => {
            const descriptor = Object.getOwnPropertyDescriptor(
              target.prototype,
              key,
            );
            return !!descriptor;
          },
        );
        _.merge(
          target.prototype,
          _.omit(target[SYMBOL.DEFAULT_MODEL], propsToOmmit),
        );

        // console.log(`DEFAULT VALUE MERGE for ${target.name}`)
      }
    };
  }
}

//#endregion

//#region helpers
export namespace Ng2RestHelpers {
  export const getMapping = () => {
    return {
      encode<T = Function>(json: Object, mapping: Mapping.Mapping): T {
        return Mapping.encode(json, mapping);
      },
      decode(json: Object, autodetect = false): Mapping.Mapping {
        return Mapping.decode(json, autodetect);
      },
    };
  };
  export const checkValidUrl = (url: string): boolean => {
    let regex =
      /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(url);
  };
}
//#endregion

//#region params

const log = Log.create('[ng2-rest] params', Level.__NOTHING);

/** check if string is a valid pattern */
export function isValid(pattern: string) {
  return new RegExp('\/:[a-zA-Z]*', 'g').test(pattern.replace('://', ''));
}

export function check(url: string, pattern: string): boolean {
  if (!Ng2RestHelpers.checkValidUrl(url)) {
    log.error(`Incorrect url: ${url}`);
    return false;
  }
  if (url.charAt(url.length - 1) === '/') url = url.slice(0, url.length - 2);
  if (pattern.charAt(pattern.length - 1) === '/')
    pattern = pattern.slice(0, url.length - 2);
  pattern = pattern.replace(/\//g, '\/');
  pattern = pattern.replace(new RegExp('\/:[a-zA-Z]*', 'g'), '.+');
  let reg = new RegExp(pattern, 'g');
  return reg.test(url);
}

export function getModels(pattern: string): string[] {
  let m = pattern.match(new RegExp('[a-z-A-Z]*\/:', 'g'));
  return m.map(p => p.replace('/:', ''));
}

export function getRestPramsNames(pattern: string): string[] {
  if (pattern.charAt(pattern.length - 1) !== '/') pattern = `${pattern}/`;
  let m = pattern.match(new RegExp(':[a-zA-Z]*\/', 'g'));
  let res = m.map(p => p.replace(':', '').replace('/', ''));
  return res.filter(p => p.trim() !== '');
}

export function containsModels(url: string, models: string[]): boolean {
  if (url.charAt(0) !== '/') url = '/' + url;
  // url = url.replace(new RegExp('\/', 'g'), '');
  let res = models.filter(m => {
    let word = '/' + m;
    // log.d('word', word)
    let iii = url.indexOf(word);
    // log.d('iii', iii)
    if (
      iii + word.length < url.length &&
      url.charAt(iii + word.length) !== '/'
    ) {
      return false;
    }
    if (iii !== -1) {
      url = url.replace(new RegExp('\/' + m, 'g'), '');
      return true;
    }
    return false;
  }).length;
  // log.d('containsModels', res);
  return res === models.length;
}

export function stars(n: number): string {
  let res = '';
  for (let i = 0; i < n; i++) res += '*';
  return res;
}

export function getRestParams(url: string, pattern: string): Object {
  let res = {};
  let models = getRestPramsNames(pattern);
  // log.d('models', models);
  models.forEach(m => {
    pattern = pattern.replace(`:${m}`, stars(m.length));
  });

  let currentModel: string = void 0;
  diffChars(pattern, url).forEach(d => {
    // log.d('d', d);
    if (d.added) {
      if (!isNaN(Number(d.value))) res[currentModel] = Number(d.value);
      else if (d.value.trim() === 'true') res[currentModel] = true;
      else if (d.value.trim() === 'false') res[currentModel] = false;
      else res[currentModel] = decodeURIComponent(d.value);
      currentModel = void 0;
    }
    let m = d.value.replace(':', '');
    // log.d('model m', m)
    if (d.removed) {
      currentModel = models.shift();
    }
  });
  return res;
}

export const regexisPath = /[^\..]+(\.[^\..]+)+/g;

/**
 * Models like books/:id
 */
function cutUrlModel(params: Object, models: string[], output: string[]) {
  if (models.length === 0) return output.join('\/');
  let m = models.pop();

  let param = m.match(/:[a-zA-Z0-9\.]+/)[0].replace(':', '');
  const paramIsPath = regexisPath.test(param);
  // log.i('cut param', param)
  let model = m.match(/[a-zA-Z0-9]+\//)[0].replace('\/', '');
  if (
    params === void 0 ||
    (paramIsPath
      ? _.get(params, param) === void 0
      : params[param] === void 0) ||
    param === 'undefined'
  ) {
    output.length = 0;
    output.unshift(model);
    return cutUrlModel(params, models, output);
  } else {
    if (paramIsPath) {
      // log.i('param is path', param)
      let mrep = m.replace(
        new RegExp(`:${param}`, 'g'),
        `${_.get(params, param)}`,
      );
      output.unshift(mrep);
      return cutUrlModel(params, models, output);
    } else {
      // log.i('param is normal', param)
      let mrep = m.replace(new RegExp(`:${param}`, 'g'), `${params[param]}`);
      output.unshift(mrep);
      return cutUrlModel(params, models, output);
    }
  }
}

export function interpolateParamsToUrl(params: Object, url: string): string {
  const regexInt = /\[\[([^\..]+\.[^\..]+)+\]\]/g;

  url = url
    .split('/')
    .map(p => {
      // log.d('url parts', p)
      let isParam = p.startsWith(':');
      if (isParam) {
        let part = p.slice(1);
        // log.d('url param part', p)
        if (regexInt.test(part)) {
          // let level = (url.split('.').length - 1)
          part = part.replace('[[', '');
          part = part.replace(']]', '');
        }
        return `:${part}`;
      }
      return p;
    })
    .join('/');

  // log.i('URL TO EXPOSE', url)

  // log.i('params', params)

  let slash = {
    start: url.charAt(0) === '\/',
    end: url.charAt(url.length - 1) === '\/',
  };

  let morePramsOnEnd = url.match(/(\/:[a-zA-Z0-9\.]+){2,10}/g);
  if (
    morePramsOnEnd &&
    Array.isArray(morePramsOnEnd) &&
    morePramsOnEnd.length === 1
  ) {
    // log.i('morePramsOnEnd', morePramsOnEnd)
    let m = morePramsOnEnd[0];
    let match = m.match(/\/:[a-zA-Z0-9\.]+/g);
    // log.i('match', match)
    match.forEach(e => {
      let c = e.replace('\/:', '');
      // log.i('c', c)
      if (regexisPath.test(c)) {
        url = url.replace(e, `/${_.get(params, c)}`);
      } else {
        url = url.replace(e, `/${params[c]}`);
      }

      // log.i('prog url', url)
    });
    return url;
  }

  let nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9\.]+/g);
  if (
    !nestedParams ||
    (Array.isArray(nestedParams) && nestedParams.length === 0)
  )
    return url;

  // check alone params
  if (!slash.end) url = `${url}/`;
  let addUndefinedForAlone =
    !/:[a-zA-Z0-9\.]+\/$/g.test(url) && /[a-zA-Z0-9]+\/$/g.test(url);

  let replace =
    (nestedParams.length > 1 ? nestedParams.join('\/') : nestedParams[0]) +
    (addUndefinedForAlone ? '\/' + url.match(/[a-zA-Z0-9]+\/$/g)[0] : '\/');
  let beginHref = url.replace(replace, '');

  if (addUndefinedForAlone) {
    url = url.replace(/\/$/g, '/:undefined');
    nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9\.]+/g);
    url = cutUrlModel(params, nestedParams, []);
  } else {
    url = cutUrlModel(params, nestedParams, []);
  }
  url = beginHref + url;

  if (url.charAt(url.length - 1) !== '/' && slash.end) url = `${url}/`;
  if (url.charAt(0) !== '\/' && slash.start) url = `/${url}`;

  return url;
}

/**
 * Get query params from url, like 'ex' in /api/books?ex=value
 */
export function decodeUrl(url: string): Object {
  let regex = /[?&]([^=#]+)=([^&#]*)/g,
    params = {},
    match;
  while ((match = regex.exec(url))) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  let paramsObject = <Object>params;
  for (let p in paramsObject) {
    if (paramsObject[p] === void 0) {
      delete paramsObject[p];
      continue;
    }
    if (paramsObject.hasOwnProperty(p)) {
      // chcek if property is number
      let n = Number(params[p]);
      if (!isNaN(n)) {
        params[p] = n;
        continue;
      }
      if (typeof params[p] === 'string') {
        // check if property is object
        let json;
        try {
          json = JSON.parse(params[p]);
        } catch (error) {}
        if (json !== void 0) {
          params[p] = json;
          continue;
        }

        // chcek if property value is like regular rexpression
        // let regexExpression;
        // try {
        //     regexExpression = new RegExp(params[p]);
        // } catch (e) { }
        // if (regexExpression !== undefined) params[p] = regexExpression;
      }
    }
  }
  return params;
}

/**
 * Create query params string for url
 *
 * @export
 * @param {UrlParams[]} params
 * @returns {string}
 */
export function getParamsUrl(
  params: Models.UrlParams[],
  doNotSerialize: boolean = false,
): string {
  let urlparts: string[] = [];
  if (!params) return '';
  if (!(params instanceof Array)) return '';
  if (params.length === 0) return '';

  params.forEach(urlparam => {
    if (JSON.stringify(urlparam) !== '{}') {
      let parameters: string[] = [];
      let paramObject = <Object>urlparam;

      for (let p in paramObject) {
        if (paramObject[p] === void 0) delete paramObject[p];
        if (
          paramObject.hasOwnProperty(p) &&
          typeof p === 'string' &&
          p !== 'regex' &&
          !(paramObject[p] instanceof RegExp)
        ) {
          if (p.length > 0 && p[0] === '/') {
            let newName = p.slice(1, p.length - 1);
            urlparam[newName] = urlparam[p];
            urlparam[p] = void 0;
            p = newName;
          }
          if (p.length > 0 && p[p.length - 1] === '/') {
            let newName = p.slice(0, p.length - 2);
            urlparam[newName] = urlparam[p];
            urlparam[p] = void 0;
            p = newName;
          }
          let v: any = urlparam[p];
          if (v instanceof Object) {
            urlparam[p] = JSON.stringify(urlparam[p]);
          }
          urlparam[p] = doNotSerialize
            ? <string>urlparam[p]
            : encodeURIComponent(<string>urlparam[p]);
          if (urlparam.regex !== void 0 && urlparam.regex instanceof RegExp) {
            if (!urlparam.regex.test(<string>urlparam[p])) {
              console.warn(
                `Data: ${urlparam[p]} incostistent with regex ${urlparam.regex.source}`,
              );
            }
          }
          parameters.push(`${p}=${urlparam[p]}`);
        }
      }

      urlparts.push(parameters.join('&'));
    }
  });
  let join = urlparts.join().trim();
  if (join.trim() === '') return '';
  return `?${urlparts.join('&')}`;
}

function transform(o) {
  if (typeof o === 'object') {
    return encodeURIComponent(JSON.stringify(o));
  }
  return o;
}

export function prepareUrlOldWay(params?: TemplateStringsArray): string {
  if (!params) return this.endpoint;
  if (typeof params === 'object') {
    params = transform(params);
  }
  return this.endpoint + '/' + params;
}

//#endregion

//#region rest headers
/**
 * Based on Headers from https://github.com/angular/angular/blob/master/packages/http/src/headers.ts
 */
export type RestHeadersOptions =
  | RestHeaders
  | { [name: string]: string | string[] };

export class RestHeaders {
  /** @internal header names are lower case */
  _headers: Map<string, string[]> = new Map();

  /** @internal map lower case names to actual names */
  _normalizedNames: Map<string, string> = new Map();

  public static from(headers?: RestHeadersOptions) {
    if (!headers) {
      return void 0;
    }
    return new RestHeaders(headers);
  }

  private constructor(
    headers?: RestHeaders | { [name: string]: string | string[] },
  ) {
    if (headers instanceof RestHeaders) {
      headers.forEach((values: string[], name: string) => {
        values.forEach(value => this.set(name, value));
      });
    } else {
      Object.keys(headers).forEach((name: string) => {
        const values: string[] = (
          Array.isArray(headers[name]) ? headers[name] : [headers[name]]
        ) as any;
        this.delete(name);
        values.forEach(value => this.set(name, value));
      });
    }
  }

  /**
   * Returns a new RestHeaders instance from the given DOMString of Response RestHeaders
   */
  static fromResponseHeaderString(headersString: string): RestHeaders {
    const headers = new RestHeaders();
    // console.log({
    //   headersString
    // })
    headersString.split('\n').forEach(line => {
      const index = line.indexOf(':');
      if (index > 0) {
        const name = line.slice(0, index);
        const value = line.slice(index + 1).trim();
        headers.set(name, value);
      }
    });

    return headers;
  }

  /**
   * Appends a header to existing list of header values for a given header name.
   */
  append(name: string, value: string): void {
    const values = this.getAll(name);

    if (values === null) {
      this.set(name, value);
    } else {
      values.push(value);
    }
  }

  /**
   * Deletes all header values for the given name.
   */
  delete(name: string): void {
    const lcName = name.toLowerCase();
    this._normalizedNames.delete(lcName);
    this._headers.delete(lcName);
  }

  forEach(
    fn: (
      values: string[],
      name: string,
      headers: Map<string, string[]>,
    ) => void,
  ): void {
    this._headers.forEach((values, lcName) =>
      fn(values, this._normalizedNames.get(lcName), this._headers),
    );
  }

  /**
   * Returns first header that matches given name.
   */
  get(name: string): string {
    const values = this.getAll(name);

    if (values === null) {
      return null;
    }

    return values.length > 0 ? values[0] : null;
  }

  /**
   * Checks for existence of header by given name.
   */
  has(name: string): boolean {
    return this._headers.has(name.toLowerCase());
  }

  /**
   * Returns the names of the headers
   */
  keys(): string[] {
    return Array.from(this._normalizedNames.values());
  }

  /**
   * Sets or overrides header value for given name.
   */
  set(name: string, value: string | string[]): void {
    if (Array.isArray(value)) {
      if (value.length) {
        this._headers.set(name.toLowerCase(), [value.join(',')]);
      }
    } else {
      this._headers.set(name.toLowerCase(), [value]);
    }
    this.mayBeSetNormalizedName(name);
  }

  /**
   * Returns values of all headers.
   */
  values(): string[][] {
    return Array.from(this._headers.values());
  }

  /**
   * Returns string of all headers.
   */
  // TODO(vicb): returns {[name: string]: string[]}
  toJSON(): { [name: string]: any } {
    const serialized: { [name: string]: string[] } = {};
    if (!this._headers) {
      // debugger
    }
    // console.log('serializing headers',this._headers)
    this._headers.forEach((values: string[], name: string) => {
      const split: string[] = [];
      values.forEach(v => split.push(...v.split(',')));
      // console.log({
      //   values
      // })
      // values.forEach(v => split.push(...(v ? v : '').split(',')));
      serialized[this._normalizedNames.get(name)] = split;
    });

    return serialized;
  }

  /**
   * Returns list of header values for a given name.
   */
  getAll(name: string): string[] {
    return this.has(name) ? this._headers.get(name.toLowerCase()) : null;
  }

  private mayBeSetNormalizedName(name: string): void {
    const lcName = name.toLowerCase();

    if (!this._normalizedNames.has(lcName)) {
      this._normalizedNames.set(lcName, name);
    }
  }
}

export const CONTENT_TYPE = {
  APPLICATION_JSON: RestHeaders.from({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }),
  APPLICATINO_VND_API_JSON: RestHeaders.from({
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  }),
};
//#endregion

//#region rest

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
    method: CoreModels.HttpMethod,
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
      item?: TA,
      params: Models.UrlParams[] = void 0,
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('get', item as any, params, axiosOptions, true) as any;
    },
    head: (
      item?: TA,
      params: Models.UrlParams[] = void 0,
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('head', item as any, params, axiosOptions, true) as any;
    },
    post: (
      item?: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('post', item as any, params, axiosOptions, true) as any;
    },
    put: (
      item?: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('put', item as any, params, axiosOptions, true) as any;
    },
    patch: (
      item?: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('patch', item as any, params, axiosOptions, true) as any;
    },
    delete: (
      item?: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('delete', item as any, params, axiosOptions, true) as any;
    },
    jsonp: (
      item?: TA,
      params?: Models.UrlParams[],
      axiosOptions?: Models.Ng2RestAxiosRequestConfig,
    ): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('jsonp', item as any, params, axiosOptions, true) as any;
    },
  };

  get(
    item?: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('get', item as any, params, axiosOptions) as any;
  }

  head(
    item?: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('head', item as any, params, axiosOptions) as any;
  }

  post(
    item?: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('post', item, params, axiosOptions);
  }

  put(
    item?: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('put', item, params, axiosOptions);
  }

  patch(
    item?: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('patch', item, params, axiosOptions);
  }

  delete(
    item?: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('delete', item, params, axiosOptions);
  }

  jsonp(
    item?: T,
    params?: Models.UrlParams[],
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('jsonp', item, params, axiosOptions);
  }
  //#endregion
}

//#endregion

//#region rest requst

// const log = Log.create('[ng2-rest] rest-request', Level.__NOTHING);

/**
 * TODO refactor this (remove jobid)
 */
const jobIDkey = 'jobID';
const customObs = 'customObs';
const cancelFn = 'cancelFn';
const isCanceled = 'isCanceled';

//#region mock request
//#endregion

export class RestRequest {
  //#region fields
  private static jobId = 0;

  private subjectInuUse: { [id: number]: Subject<any> } = {};

  private meta: { [id: number]: Models.MetaRequest } = {};
  //#endregion

  /**
   * key is interceptorName (just to identify who is intercepting)
   */
  interceptors = new Map<string, TaonAxiosClientInterceptor>();

  /**
   * key is a joined string METHOD-expressPath.
   * Example `GET-/api/users`
   */
  methodsInterceptors = new Map<string, TaonAxiosClientInterceptor>();

  private handlerResult(
    options: Models.HandleResultOptions,
    sourceRequest: Models.HandleResultSourceRequestOptions,
  ) {
    if (_.isUndefined(options)) {
      options = {} as any;
    }
    // log.d(`HANDLE RESULT (jobid:${options.jobid}) ${sourceRequest.url}`);
    const { res, jobid, isArray, method } = options;

    if (typeof res !== 'object') {
      throw new Error('No resposnse for request. ');
    }

    if (UtilsOs.isBrowser) {
      res.headers = RestHeaders.from(res.headers);
    }

    // error no internet
    if (res.error) {
      this.subjectInuUse[jobid].error(
        new HttpResponseError(
          res.error,
          res.data,
          res.headers,
          res.code,
          jobid,
          sourceRequest,
        ),
      );
      return;
    }
    const entity = this.meta[jobid].entity;
    const circular = this.meta[jobid].circular;

    const success = Resource['_listenSuccess'] as Subject<
      Models.HttpResponse<any>
    >;

    const reqResp = new Models.HttpResponse(
      sourceRequest,
      res.data,
      res.headers,
      res.code,
      entity,
      circular,
      jobid,
      isArray,
    );
    success.next(reqResp);

    this.subjectInuUse[jobid].next(reqResp);
    this.meta[jobid] = void 0;
    this.subjectInuUse[jobid].complete();
  }

  private async req(
    url: string,
    method: CoreModels.HttpMethod,
    headers?: RestHeaders,
    body?: any,
    jobid?: number,
    isArray = false,
    mockHttp?: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    this.subjectInuUse[jobid][cancelFn] = source.cancel;

    var response: AxiosResponse<any>;
    if (mockHttp) {
      if (typeof mockHttp === 'object') {
        response = {
          data: mockHttp.data,
          status: mockHttp.code,
          headers: mockHttp.headers as any,
          statusText: mockHttp.error,
          config: {} as any,
        };
      } else if (typeof mockHttp === 'function') {
        const r = mockHttp(url, method, headers, body);
        response = {
          data: r.data,
          status: r.code,
          headers: r.headers as any,
          statusText: r.error,
          config: {} as any,
        };
      }
    }

    const isFormData = CLASS.getNameFromObject(body) === 'FormData';
    const formData: FormData = isFormData ? (body as any) : void 0;
    //#region @backend
    if (formData) {
      const headersForm = formData.getHeaders();
      headersForm['Content-Length'] = formData.getLengthSync();
      for (const [key, value] of Object.entries(headersForm)) {
        headers.set(key, value?.toString() as string);
      }
    }
    //#endregion

    const headersJson = headers.toJSON();
    const responseType = headersJson.responsetypeaxios
      ? headersJson.responsetypeaxios
      : 'text';

    try {
      if (!response) {
        //#region @backend
        Helpers.log(
          `[${method}] (jobid=${jobid}) request to:  ${(url || '')?.split('?')[0]}`,
        );
        //#endregion

        // console.log('headers axios:', headers.toJSON())
        // console.log({ responseType, headersJson, body, method, url })
        let axiosConfig: AxiosRequestConfig<any> = {
          url,
          method,
          data: body,
          responseType,
          headers: headersJson,
          cancelToken: source.token,
          ...(axiosOptions || {}), // merge with axiosOptions
          // withCredentials: true, // this can be done manually
        };

        if (isFormData) {
          axiosConfig.maxBodyLength = Infinity;
        }

        // console.log('AXIOS CONFIG', axiosConfig);
        const uri = new URL(url);
        const backend = new AxiosBackendHandler<any>();

        const globalInterceptors = Array.from(this.interceptors.entries()).map(
          ([_, interceptor]) => interceptor,
        );

        const methodInterceptors = Array.from(
          this.methodsInterceptors.entries(),
        )
          .filter(([key]) => {
            const ending = `-${method?.toUpperCase()}-${uri.pathname}`;
            return key.endsWith(ending);
          })
          .map(([_, interceptor]) => interceptor);

        // console.log(
        //   `for ${uri.pathname} global ${globalInterceptors.length} method: ${methodInterceptors.length}`,
        // );

        const allInterceptors = [...globalInterceptors, ...methodInterceptors];

        const handler = buildInterceptorChain(allInterceptors, backend);
        response = await firstValueFrom(handler.handle(axiosConfig));
        // log.d(`after response of jobid: ${jobid}`);
      }

      // console.log('AXIOS RESPONES', response)

      if (this.subjectInuUse[jobid][isCanceled]) {
        return;
      }

      // handle normal request
      this.handlerResult(
        {
          res: {
            code: response.status as any,
            data: response.data,
            isArray,
            jobid,
            headers: RestHeaders.from(response.headers as any),
          },
          method,
          jobid,
          isArray,
        },
        {
          url,
          body,
          method,
          isArray,
        },
      );
    } catch (catchedError) {
      if (this.subjectInuUse[jobid][isCanceled]) {
        return;
      }
      // console.log('ERROR RESPONESE catchedError typeof ', typeof catchedError)
      // console.log('ERROR RESPONESE catchedError', catchedError)
      if (
        typeof catchedError === 'object' &&
        catchedError.response &&
        catchedError.response.data
      ) {
        const err = catchedError.response.data;
        const msg: string = catchedError.response.data.message || '';
        // console.log({
        //   'err.stack': err?.stack
        // })
        let stack: string[] = (err.stack || '').split('\n');

        const errObs = Resource[
          '_listenErrors'
        ] as Subject<Models.BackendError>;
        errObs.next({
          msg,
          stack,
          data: catchedError.response.data,
        });
      }
      const error =
        catchedError && catchedError.response
          ? `[${catchedError.response.statusText}]: `
          : '';

      // handle error request
      this.handlerResult(
        {
          res: {
            code:
              catchedError && catchedError.response
                ? (catchedError.response.status as any)
                : void 0,
            error: `${error}${catchedError.message}`,
            data:
              catchedError && catchedError.response
                ? JSON.stringify(catchedError.response.data)
                : void 0,
            isArray,
            jobid,
            headers: RestHeaders.from(
              catchedError &&
                catchedError.response &&
                catchedError.response.headers,
            ),
          },
          method,
          jobid,
          isArray,
        },
        {
          url,
          body,
          isArray,
          method,
        },
      );
    }
  }

  private getReplay(
    method: CoreModels.HttpMethod,
    meta: Models.MetaRequest,
    onlyGetLastReplayForMethod: boolean,
  ): Models.ReplayData {
    let replay: Models.ReplayData;

    //#region prevent empty tree
    if (_.isUndefined(this.replaySubjects[meta.endpoint])) {
      // log.i(`(${meta.endpoint}) `);
      this.replaySubjects[meta.endpoint] = {};
    }
    if (_.isUndefined(this.replaySubjects[meta.endpoint][meta.path])) {
      // log.i(`(${meta.endpoint})(${meta.path}) `);
      this.replaySubjects[meta.endpoint][meta.path] = {};
    }
    if (_.isUndefined(this.replaySubjects[meta.endpoint][meta.path][method])) {
      // log.i(`(${meta.endpoint})(${meta.path}) `);
      this.replaySubjects[meta.endpoint][meta.path][method] = {};
    }
    //#endregion

    const objectIDToCreateOrLast =
      Object.keys(
        this.replaySubjects[meta.endpoint][meta.path][method] as Object,
      ).length + (onlyGetLastReplayForMethod ? 0 : 1);
    if (onlyGetLastReplayForMethod && objectIDToCreateOrLast === 0) {
      return replay;
    }

    if (
      _.isUndefined(
        this.replaySubjects[meta.endpoint][meta.path][method][
          objectIDToCreateOrLast
        ],
      )
    ) {
      // log.i(`(${meta.endpoint})(${meta.path})(${method}) `);
      this.replaySubjects[meta.endpoint][meta.path][method][
        objectIDToCreateOrLast
      ] = <Models.ReplayData>{
        subject: new Subject(),
        data: void 0,
      };
    }

    replay =
      this.replaySubjects[meta.endpoint][meta.path][method][
        objectIDToCreateOrLast
      ];

    if (!_.isNumber(replay.id)) {
      if (RestRequest.jobId === Number.MAX_SAFE_INTEGER) {
        RestRequest.jobId = 0;
      }

      const jobid: number = RestRequest.jobId++;
      replay.id = jobid;
      const subject: Subject<any> = replay.subject;
      subject[jobIDkey] = jobid; // modify internal rxjs subject obj

      this.meta[jobid] = meta;
      this.subjectInuUse[jobid] = subject;

      this.subjectInuUse[jobid][customObs] = new Observable(observer => {
        // observer.remove(() => {

        // });
        observer.add(() => {
          // console.log(`cancel observable job${jobid}`)
          if (!this.subjectInuUse[jobid][isCanceled]) {
            this.subjectInuUse[jobid][isCanceled] = true;
            if (typeof this.subjectInuUse[jobid][cancelFn] === 'function') {
              this.subjectInuUse[jobid][cancelFn](
                '[ng2-rest] on purpose canceled http request',
              );
            }
          } else {
            // console.log(`somehow second time cancel ${jobid}`)
          }
        });
        const sub = subject.subscribe({
          next: a => observer.next(a),
          error: a => observer.error(a),
          complete: () => {
            setTimeout(() => {
              sub.unsubscribe();
              observer.complete();
            });
          },
        });
      });

      //#region DISPOSE  @UNCOMMENT AFTER TESTS
      // if (objectIDToCreateOrLast > 2) {
      //   const oldReq: Models.ReplayData = this.replaySubjects[meta.endpoint][meta.path][method][(objectIDToCreateOrLast - 2)];
      //   if (_.isUndefined(this.meta[oldReq.id])) {
      //     // cant delete this - for counter purpose
      //     this.replaySubjects[meta.endpoint][meta.path][method][(objectIDToCreateOrLast - 2)] = {};
      //     delete this.subjectInuUse[oldReq.id];
      //     delete this.meta[oldReq.id];
      //   }
      // }
      //#endregion
    }

    return replay;
  }

  //#region http methods

  private generalReq(
    method: CoreModels.HttpMethod,
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    const replay: Models.ReplayData = this.getReplay(method, meta, false);
    replay.data = { url, body, headers, isArray };

    ((
      pthis,
      purl,
      pmethod,
      pheaders,
      pbody,
      pid,
      pisArray,
      pmockHttp,
      axiosOpt,
    ) => {
      // log.d(`for ${purl} jobid ${pid}`);
      setTimeout(() =>
        pthis.req(
          purl,
          pmethod,
          pheaders,
          pbody,
          pid,
          pisArray,
          pmockHttp,
          axiosOpt,
        ),
      );
    })(
      this,
      url,
      method,
      headers,
      body,
      replay.id,
      isArray,
      mockHttp,
      axiosOptions,
    );

    const resp: Models.PromiseObservableMix<any> = firstValueFrom(
      replay.subject[customObs],
    ) as any;
    resp.observable = replay.subject[customObs];
    return resp;
  }

  get(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    return this.generalReq(
      'get',
      url,
      body,
      headers,
      meta,
      isArray,
      mockHttp,
      axiosOptions,
    );
  }

  head(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    return this.generalReq(
      'head',
      url,
      body,
      headers,
      meta,
      isArray,
      mockHttp,
      axiosOptions,
    );
  }

  delete(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    return this.generalReq(
      'delete',
      url,
      body,
      headers,
      meta,
      isArray,
      mockHttp,
      axiosOptions,
    );
  }

  post(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    return this.generalReq(
      'post',
      url,
      body,
      headers,
      meta,
      isArray,
      mockHttp,
      axiosOptions,
    );
  }

  put(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    return this.generalReq(
      'put',
      url,
      body,
      headers,
      meta,
      isArray,
      mockHttp,
      axiosOptions,
    );
  }

  patch(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    return this.generalReq(
      'patch',
      url,
      body,
      headers,
      meta,
      isArray,
      mockHttp,
      axiosOptions,
    );
  }

  jsonp(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp,
    axiosOptions?: Models.Ng2RestAxiosRequestConfig,
  ): Models.PromiseObservableMix<any> {
    const method = 'jsonp';

    if (UtilsOs.isSSRMode) {
      const emptyStuff = Promise.resolve() as Models.PromiseObservableMix<any>;
      emptyStuff.observable = new Observable<any>();
      console.warn(`Cannot perform jsonp request in SSR mode`);
      return emptyStuff;
    }

    const replay: Models.ReplayData = this.getReplay('jsonp', meta, false);
    const jobid = replay.id;

    setTimeout(() => {
      if (url.endsWith('/')) url = url.slice(0, url.length - 1);
      let num = Math.round(10000 * Math.random());
      let callbackMethodName = 'cb_' + num;
      let win: any = globalThis; // TODO not a good idea! @LAST
      win[callbackMethodName] = data => {
        // handle jsonp result data
        this.handlerResult(
          {
            res: {
              data,
              isArray,
            },
            method,
            jobid,
            isArray,
          },
          {
            url,
            body,
            isArray,
            method,
          },
        );
      };
      let sc = document.createElement('script');
      sc.src = `${url}?callback=${callbackMethodName}`;
      document.body.appendChild(sc);
      document.body.removeChild(sc);
    });

    const resp: Models.PromiseObservableMix<any> = firstValueFrom(
      replay.subject[customObs],
    ) as any;
    resp.observable = replay.subject[customObs];
    return resp;
  }

  //#endregion
  private replaySubjects = {};
}

//#endregion

//#region resource
export class Resource<E, T, TA> {
  protected static _listenErrors = new Subject<Models.BackendError>();

  protected static _listenSuccess = new Subject<Models.HttpResponse<any>>();

  public static get listenErrors() {
    return this._listenErrors.asObservable();
  }

  public static get listenSuccessOperations() {
    return this._listenSuccess.asObservable();
  }

  public static enableWarnings: boolean = true;

  //#region private mthods and fields

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
    if (!e) {
      return void 0;
    }
    const r = Resource.endpoints[endpoint].models[model];
    return Resource.endpoints[endpoint].models[model];
  }

  public static request: RestRequest = new RestRequest();
  //#endregion

  //#region create
  public static create<A, TA = A[]>(
    e: string,
    model?: string,
    entityMapping?: Mapping.Mapping,
    circular?: Circ[],
    customContentType?: RestHeaders,
  ): Models.ResourceModel<A, TA> {
    const badRestRegEX = new RegExp('((\/:)[a-z]+)+', 'g');
    const matchArr = model.match(badRestRegEX) || [];
    const badModelsNextToEachOther = matchArr.join();
    const atleas2DoubleDots =
      (badModelsNextToEachOther.match(new RegExp(':', 'g')) || []).length >= 2;
    if (atleas2DoubleDots && model.search(badModelsNextToEachOther) !== -1) {
      throw new Error(`

Bad rest model: ${model}

Do not create rest models like this:    /book/author/:bookid/:authorid
Instead use nested approach:            /book/:bookid/author/:authorid
            `);
    }
    Resource.map(e, e);
    Resource.instance.add(
      e,
      model ? model : '',
      entityMapping,
      circular,
      customContentType,
    );
    // if (model.charAt(model.length - 1) !== '/') model = `${model}/`;
    return {
      model: (params?: Object) =>
        Resource.instance.api(e, interpolateParamsToUrl(params, model)),
      get headers() {
        return Resource.getModel(e, model).headers;
      },
    };
  }
  //#endregion

  //#region reset
  public static reset() {
    Resource.endpoints = {};
  }
  //#endregion

  //#region constructor
  private constructor() {}
  //#endregion

  public static Cookies = Cookie.Instance;

  //#region map
  private static map(endpoint: string, url: string): boolean {
    // log.i('url', url);
    let regex =
      /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    let e = endpoint;
    if (!regex.test(url)) {
      throw `Url address is not correct: ${url}`;
    }
    if (url.charAt(url.length - 1) === '/') url = url.slice(0, url.length - 1);
    // log.i('url after', url);
    if (Resource.endpoints[e] !== void 0) {
      // Helpers.log(
      //   'Cannot use map function at the same API endpoint again (' +
      //     Resource.endpoints[e].url +
      //     ')',
      // );
      return false;
    }
    Resource.endpoints[e] = {
      url: url,
      models: {},
      entity: null,
    };
    // log.i('enpoints', Resource.endpoints);
    return true;
  }
  //#endregion

  private static prepareModel(model) {
    if (model.charAt(model.length - 1) === '/') {
      model = model.slice(0, model.length - 1);
    }
    if (model.charAt(0) === '/') {
      model = model.slice(1, model.length);
    }
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
  private add(
    endpoint: E,
    model: string,
    entity: Mapping.Mapping,
    circular?: Circ[],
    customContentType?: RestHeaders,
  ) {
    // log.i(`I am maping ${model} on ${<any>endpoint}`);
    model = Resource.prepareModel(model);

    let e: string;
    e = <string>endpoint.toString();

    if (Resource.endpoints[e] === void 0) {
      console.error('Endpoint is not mapped ! Cannot add model ' + model);
      return;
    }
    if (Resource.endpoints[e].models[model] !== void 0) {
      if (Resource.enableWarnings)
        console.warn(
          `Model '${model}' is already defined in endpoint: ` +
            Resource.endpoints[e].url,
        );
      return;
    }
    Resource.endpoints[e].models[model] = new Rest<T, TA>(
      Resource.endpoints[e].url + '/' + model,
      Resource.request,
      {
        endpoint: e,
        path: model,
        entity,
        circular,
      },
      customContentType,
    ); // TODO put custom content type in meta ?
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
    let e = <string>endpoint.toString();
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

    let res: Rest<T, TA> =
      Resource.endpoints[<string>endpoint.toString()].models[model];

    // log.d(`
    // orgModel: ${orgModel}
    // model: ${model}

    // `)
    if (orgModel !== model) {
      let baseUrl = Resource.endpoints[<string>endpoint.toString()].url;
      // log.d('base', Resource.endpoints[<string>(endpoint).toString()])
      // log.d('baseUrl', baseUrl)
      // log.d('orgModel', orgModel)
      res.__rest_endpoint = `${baseUrl}/${orgModel}`;
    } else {
      res.__rest_endpoint = void 0;
    }

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

//#endregion


// const rest = Resource.create('asd','asd');
// rest.model().get();
