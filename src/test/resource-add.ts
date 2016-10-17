import {
    TestBed,
    inject
} from '@angular/core/testing';
import { ApplicationRef, ViewContainerRef } from '@angular/core';
import {
    Http, HttpModule,
    JsonpModule, XHRBackend, JSONPBackend,
    Response, ResponseOptions,
    Jsonp, ConnectionBackend,
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { Resource } from '../resource.service';


import { APIS, User } from './mock';

export class TestAdd {

    constructor() {
        describe('adding', () => {

            let rest;

            beforeEach(() => TestBed.configureTestingModule({
                imports: [HttpModule, JsonpModule],
                declarations: [],
                providers: [
                    Resource,
                    ViewContainerRef,
                    { provide: XHRBackend, useClass: MockBackend },
                    { provide: JSONPBackend, useExisting: MockBackend },
                ]
            }));



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



