
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

    /**
     * Get collection of item from database
     * 
     * @type {FnMethodQuery<TA>}
     * @memberOf FnMethodsHttp
     */
    query: FnMethodQuery<TA>;
    /**
     * Get item from database
     * 
     * @type {FnMethodGet<T>}
     * @memberOf FnMethodsHttp
     */
    get: FnMethodGet<T>;
    /**
     * Save object in database
     * 
     * @type {FnMethodSave<T>}
     * @memberOf FnMethodsHttp
     */
    save: FnMethodSave<T>;
    /**
     * Update object in databse
     * 
     * @type {FnMethodUpdate<T>}
     * @memberOf FnMethodsHttp
     */
    update: FnMethodUpdate<T>;
    /**
     * Remove object from database
     * 
     * @type {FnMethodRemove<T>}
     * @memberOf FnMethodsHttp
     */
    remove: FnMethodRemove<T>;
    /**
     * Get item from JSONP 
     * 
     * @type {FnMethodJsonp<T>}
     * @memberOf FnMethodsHttp
     */
    jsonp: FnMethodJsonp<T>;
};
