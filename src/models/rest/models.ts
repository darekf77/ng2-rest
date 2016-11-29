
import { Observable } from 'rxjs';
import { UrlParams } from '../../models';
import { Subject } from 'rxjs/Subject';

type FnMethodQuery<T> = (params?: Object | UrlParams[], _sub?: Subject<T>) => Observable<T>;
type FnMethodGet<T> = (params: Object | UrlParams[], _sub?: Subject<T>) => Observable<T>
type FnMethodSave<T> = (item: T, params?: Object | UrlParams[], _sub?: Subject<T>) => Observable<T>
type FnMethodUpdate<T> = (params: Object | UrlParams[], itemToUpdate: T, _sub?: Subject<T>) => Observable<T>
type FnMethodRemove<T> = (params?: Object | UrlParams[], _sub?: Subject<T>) => Observable<T>;
type FnMethodJsonp<T> = (params?: Object | UrlParams[], _sub?: Subject<T>) => Observable<T>;
export interface FnMethodsHttp<T, TA> {
    query: FnMethodQuery<TA>;
    get: FnMethodGet<T>;
    save: FnMethodSave<T>;
    update: FnMethodUpdate<T>;
    remove: FnMethodRemove<T>;
    jsonp: FnMethodJsonp<T>;
};
