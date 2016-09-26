import {
    it,
    inject,
    injectAsync,
    beforeEachProviders
} from '@angular/core/testing';

// Load the implementations that should be tested

import {provide} from '@angular/core';
import {Http, HTTP_PROVIDERS, XHRBackend,
    RequestMethod, Jsonp, ConnectionBackend,
    JSONPBackend, JSONPConnection, JSONP_PROVIDERS,
    Response, ResponseOptions} from '@angular/http';
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

            beforeEachProviders(() => [
                Http, HTTP_PROVIDERS,
                provide(XHRBackend, { useClass: MockBackend }),
                Resource,
                Jsonp, ConnectionBackend,
                MockBackend,
                provide(JSONPBackend, { useExisting: MockBackend }),
                JSONPBackend, JSONP_PROVIDERS,
            ]);

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

            });

            it('It should throw erro when no mock in MOCK_ONLY mode',

                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp: Jsonp) => {

                        backend.connections.subscribe({
                            next: connection => {
                                // console.log('I AM HERE')
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(users)
                                }));
                                setTimeout(() => {
                                    // Send a response to the request
                                    connection.mockRespond(res);
                                });
                            }
                        });

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.reset();
                        Resource.map(APIS.FIRST.toString(), url);
                        Resource.setMockingMode(MockingMode.MOCKS_ONLY);

                        rest.add(APIS.FIRST, 'users');

                        expect(() => {
                            rest.api(APIS.FIRST, 'users').query().subscribe((res) => {
                                expect(res).toEqual(user);
                            }, (err) => {
                                fail();
                            });
                        }).toThrow('In MOCKING MODE you have to define mock of query for enipoint: https://somewhere.com/users.');

                    })
            );


            it('It should use normal data in LIVE_BACKEND',

                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp: Jsonp) => {

                        backend.connections.subscribe({
                            next: connection => {
                                // bad response from LIVE BACKEND
                                let res = new Response(new ResponseOptions({
                                    body: [] //  JSON.stringify(users)
                                }));
                                setTimeout(() => {
                                    // Send a response to the request
                                    connection.mockRespond(res);
                                });
                            }
                        });

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.reset();
                        Resource.map(APIS.FIRST.toString(), url);
                        Resource.setMockingMode(MockingMode.LIVE_BACKEND_ONLY);

                        rest.add(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users')
                            .mock(users) // empty mock
                            .query()
                            .subscribe((res) => {
                                expect(res).not.toEqual(users);
                            }, (err) => {
                                fail;
                            });

                    })
            );




        // });
    }
}



