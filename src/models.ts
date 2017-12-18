
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Log, Level } from 'ng2-logger';
import { RestHeaders } from "./rest-headers";
import * as JSON5 from 'json5';
import { Rest } from "./rest.class";


const log = Log.create('rest namespace', Level.__NOTHING)


export type HttpCode = 200 | 400 | 404 | 500;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'JSONP';
export type MethodWithoutBody<E, T> = (params?: UrlParams[], doNotSerializeParams?: boolean) => Observable<E>
export type MethodWithBody<E, T> = (item?: T, params?: UrlParams[], doNotSerializeParams?: boolean) => Observable<E>
export type ReplayData = { subject: Subject<any>, data: { url: string, body: string, headers: RestHeaders }, id: number; };
export type ReqParams = { url: string, method: HttpMethod, headers?: RestHeaders, body?: any, jobid: number, isArray: boolean };

export interface ResourceModel<A, TA> {
    model: (pathModels?: Object, responseObjectType?: Function) => Rest<A, TA>,
    replay: (method: HttpMethod) => void;
}

export interface Ng2RestMethods<E, T> {
    get: MethodWithoutBody<E, T>;
    post: MethodWithBody<E, T>;
    put: MethodWithBody<E, T>;
    delete: MethodWithoutBody<E, T>;
    jsonp: MethodWithoutBody<E, T>;
}

export interface FnMethodsHttp<T, TA> extends Ng2RestMethods<HttpResponse<T>, T> {
    array: Ng2RestMethods<HttpResponseArray<TA>, TA>;
};

export interface NestedParams {
    [params: string]: string;
}

export interface UrlParams {
    [urlModelName: string]: string | number | boolean | RegExp | Object;
    regex?: RegExp;
}[];

export abstract class BaseBody {
    public static enableWarnings = true;
    protected toJSON(data, isJSONArray = false) {
        let r = isJSONArray ? [] : {};
        if (typeof data === 'string') {
            try {
                r = JSON5.parse(data);
            } catch (error) {
                HttpBody.enableWarnings && console.warn(error);
            }
        }
        return r as any;
    }
}

export class HttpBody<T> extends BaseBody {

    constructor(private body: string, private isArray = false) {
        super();
    }
    public get json(): T {
        return this.toJSON(this.body, this.isArray);
    }
    public get text() {
        return this.body;
    }
}

export class ErrorBody extends BaseBody {
    constructor(private data) {
        super();
    }

    public get json(): Object {
        return this.toJSON(this.data);
    }
    public get text() {
        return this.data
    }
}

export abstract class BaseResponse<T> {

    constructor(
        responseText?: string,
        public readonly headers?: RestHeaders,
        public readonly cookies?: Object,
        public readonly statusCode?: HttpCode | number,
        isArray = false
    ) {

    }
}

export class HttpResponse<T> extends BaseResponse<T> {
    public readonly body?: HttpBody<T>;
    constructor(
        responseText?: string,
        headers?: RestHeaders,
        cookies?: Object,
        statusCode?: HttpCode | number,
        isArray = false
    ) {
        super(responseText, headers, cookies, statusCode, isArray);
        this.body = new HttpBody(responseText, isArray)
    }
}

export class HttpResponseError extends BaseResponse<T> {
    private error: ErrorBody;
    public tryRecconect() {

    }
    constructor(
        responseText?: string,
        headers?: RestHeaders,
        cookies?: Object,
        statusCode?: HttpCode | number,
        subject?: Subject<any>
    ) {
        super(responseText, headers, cookies, statusCode);
        this.error = new ErrorBody(responseText)
    }
}



export class HttpResponseArray<T> extends HttpResponse<T> {
    public readonly TOTAL_COUNT_HEADER = 'X-Total-Count'.toLowerCase();
    public get totalElements(): number {
        return Number(this.headers.get(this.TOTAL_COUNT_HEADER));
    }
    constructor(
        responseText?: string,
        headers?: RestHeaders,
        cookies?: Object,
        statusCode?: HttpCode | number,
        isArray = true
    ) {
        super(responseText, headers, cookies, statusCode, isArray)
    }
}



export interface MockRequest<T> {
    data: any;
    params: Object;
    restParams?: Object;
    body: Object;
    method: HttpMethod;
}
//#endregion

//#region mock repos
export interface MockResponse {
    data?: any;
    code?: HttpCode;
    error?: string;
    headers?: RestHeaders;
    jobid?: number;
    isArray: boolean;
}