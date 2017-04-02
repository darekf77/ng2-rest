
import { Observable } from 'rxjs';

export class RestHeaders {

    constructor() {

    }

    append(key: string, value: string) {

    }

    toJSON(): Object {
        return undefined;
    }

}


export class RestRequest {



    constructor() {

    }


    get(url: string, headers: RestHeaders): Observable<any> {
        return null;
    }

    delete(url: string, headers: RestHeaders): Observable<any> {
        return null;
    }

    post(url: string, body: string, headers: RestHeaders): Observable<any> {
        return null;
    }

    put(url: string, body: string, headers: RestHeaders): Observable<any> {
        return null;
    }

    jp(url: string): Observable<any> {
        return null;
    }


}