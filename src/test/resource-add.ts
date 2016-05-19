import {
    it, xit,
    inject,
    injectAsync,
    beforeEachProviders
} from '@angular/core/testing';

// Load the implementations that should be tested

import {provide} from '@angular/core';
import {Http, HTTP_PROVIDERS, XHRBackend, Jsonp, ConnectionBackend, } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { Resource } from '../resource.service';
import { APIS, User } from './mock';

export class TestAdd {

    constructor() {
        describe('adding', () => {

            let rest;

            beforeEachProviders(() => [
                Http, HTTP_PROVIDERS,
                provide(XHRBackend, { useClass: MockBackend }),
                Resource,
                Jsonp, ConnectionBackend
            ]);


            it('should add model to endpoint just one time', inject([Resource, Http, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, jp: Jsonp) => {
                    rest = new Resource<APIS, User, User[]>(http, jp);
                    let url = 'https://somewhere.com';
                    Resource.map(APIS.FIRST.toString(), url);

                    expect(rest.add(APIS.FIRST, 'user')).toBeTruthy();
                    expect(rest.add(APIS.FIRST, 'user')).toBeFalsy()

                }));

            xit('should not add model', inject([Resource, Http, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, jp: Jsonp) => {
                    rest = new Resource<APIS, User, User[]>(http, jp);
                    let url = 'https://somewhere.com';
                    Resource.map(APIS.FIRST.toString(), url);

                    expect(rest.add(APIS.FIRST, 'user')).toBeFalsy();

                }));

        });
    }
}



