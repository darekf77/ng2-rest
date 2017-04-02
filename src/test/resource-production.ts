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
import { MockingMode } from '../mocking-mode';

export class TestProduction {

    clone(u: User, id: string = ''): User {
        let t: User = JSON.parse(JSON.stringify(u));
        t.name += id;
        return t;
    }

    constructor() {
        // describe('Porduction mode', () => {

            let user: User;
            let users: User[];

            beforeEach(() => {

                user = {
                    name: 'Dariusz',
                    age: 25,
                    id: undefined
                };
                users = [];
                users.push(this.clone(user, '1'));
                users.push(this.clone(user, '2'));
                users.push(this.clone(user, '3'));

                return TestBed.configureTestingModule({
                    imports: [HttpModule, JsonpModule],
                    declarations: [],
                    providers: [
                        MockBackend,
                        Resource,
                        ViewContainerRef,
                        { provide: XHRBackend, useClass: MockBackend },
                        { provide: JSONPBackend, useExisting: MockBackend },
                    ]
                })
            });


            // it('It should throw erro when no mock in MOCK_ONLY mode',

            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp: Jsonp) => {

            //             backend.connections.subscribe({
            //                 next: connection => {
            //                     let res = new Response(new ResponseOptions({
            //                         body: JSON.stringify(users)
            //                     }));
            //                     setTimeout(() => {
            //                         // Send a response to the request
            //                         connection.mockRespond(res);
            //                     });
            //                 }
            //             });

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.reset();
            //             Resource.map(APIS.FIRST.toString(), url);
            //             Resource.mockingMode.setMocksOnly();

            //             rest.add(APIS.FIRST, 'users');

            //             expect(() => {
            //                 rest.api(APIS.FIRST, 'users').query().subscribe((res) => {
            //                     expect(res).toEqual(user);
            //                 }, (err) => {
            //                     fail();
            //                 });
            //             }).toThrow('In MOCKING MODE you have to define mock of query for enipoint: https://somewhere.com/users.');

            //         })
            // );


            // it('It should use normal data in LIVE_BACKEND',

            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp: Jsonp) => {

            //             backend.connections.subscribe({
            //                 next: connection => {
            //                     // bad response from LIVE BACKEND
            //                     let res = new Response(new ResponseOptions({
            //                         body: [] //  JSON.stringify(users)
            //                     }));
            //                     setTimeout(() => {
            //                         // Send a response to the request
            //                         connection.mockRespond(res);
            //                     });
            //                 }
            //             });

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.reset();
            //             Resource.map(APIS.FIRST.toString(), url);
            //             Resource.mockingMode.setBackendOnly();

            //             rest.add(APIS.FIRST, 'users');
            //             rest.api(APIS.FIRST, 'users')
            //                 .mock(users) // empty mock
            //                 .query()
            //                 .subscribe((res) => {
            //                     expect(res).not.toEqual(users);
            //                 }, (err) => {
            //                     fail;
            //                 });

            //         })
            // );




        // });
    }
}



