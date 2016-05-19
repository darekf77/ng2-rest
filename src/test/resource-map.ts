import {
    it,
    inject,
    injectAsync,
    beforeEachProviders
} from '@angular/core/testing';

// Load the implementations that should be tested

import {provide} from '@angular/core';
import {Http, HTTP_PROVIDERS, XHRBackend, Jsonp, ConnectionBackend} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { Resource } from '../resource.service';
import { APIS, User } from './mock';

export class TestMap {

    constructor() {
        describe('mapping', () => {

            beforeEachProviders(() => [
                Http, HTTP_PROVIDERS,
                provide(XHRBackend, { useClass: MockBackend }),
                Resource,
                Jsonp, ConnectionBackend,
            ]);

            it('should map model just one time', inject([Resource, Http, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, jp) => {
                    rest = new Resource<APIS, User, User[]>(http, jp);
                    Resource.reset();
                    let url = 'https://somewhere.com';
                    expect(Resource.map(APIS.FIRST.toString(), url)).toBeTruthy();
                    expect(Resource.map(APIS.FIRST.toString(), url)).toBeFalsy();
                }));

            it('should map correct url with / ', inject([Resource, Http, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, jp) => {
                    rest = new Resource<APIS, User, User[]>(http, jp);
                    Resource.reset();
                    expect(Resource.map(APIS.FIRST.toString(), 'http://localhost:8080/')).toBeTruthy();
                }));

            it('should map correct url witout / ', inject([Resource, Http, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, jp) => {
                    rest = new Resource<APIS, User, User[]>(http, jp);
                    Resource.reset();
                    expect(Resource.map(APIS.FIRST.toString(), 'http://localhost:8080')).toBeTruthy();
                }));


            it('should reject incorrect url from random chars', inject([Resource, Http, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, jp) => {
                    rest = new Resource<APIS, User, User[]>(http, jp);
                    Resource.reset();
                    expect(Resource.map(APIS.FIRST.toString(), 'asdas')).toBeFalsy();
                }));


            it('should reject incorrect url withour addres body', inject([Resource, Http, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, jp) => {
                    rest = new Resource<APIS, User, User[]>(http, jp);
                    Resource.reset();
                    expect(Resource.map(APIS.FIRST.toString(), 'http://')).toBeFalsy();
                }));

        });
    }
}



