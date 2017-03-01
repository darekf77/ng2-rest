import {
    TestBed,
    inject
} from '@angular/core/testing';
import { ApplicationRef, ViewContainerRef } from '@angular/core';
import {
    Http, HttpModule,
    JsonpModule, XHRBackend, JSONPBackend,
    Response, ResponseOptions, RequestMethod,
    Jsonp, ConnectionBackend,
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Rest } from '../rest';

import { Resource } from '../resource.service';
import { SimpleResource } from '../simple-resource';
import { APIS, User } from './mock';

export class TestRest {

    clone(u: User, id: string = ''): User {
        let t: User = JSON.parse(JSON.stringify(u));
        t.name += id;
        return t;
    }

    constructor() {
        describe('rest api', () => {

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


            it('should retrive model with get request',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Get);
                                expect(c.request.url).toBe('https://somewhere.com/users/0');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(user)
                                }));
                                c.mockRespond(res);

                            });

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.map(APIS.FIRST.toString(), url);
                        rest.add(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').get([{ id: 0 }]).subscribe((res) => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        });

                    }));

            it('should retrive models array with get request',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Get);
                                expect(c.request.url).toBe('https://somewhere.com/users');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(users)
                                }));
                                c.mockRespond(res);



                            });

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.map(APIS.FIRST.toString(), url);
                        rest.add(APIS.FIRST, 'users');
                        let r = rest.api(APIS.FIRST, 'users').query();
                        expect(r).toBeDefined();
                        r.subscribe((res) => {
                            expect(res).toEqual(users);
                        }, (err) => {
                            fail;
                        });

                    }));


            it('should save model',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Post);
                                expect(c.request.url).toBe('https://somewhere.com/users');
                                user.id = 1;
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(user)
                                }));
                                c.mockRespond(res);

                            });

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.map(APIS.FIRST.toString(), url);
                        rest.add(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').save(user).subscribe((res) => {
                            expect(res.id).toBeDefined();
                        }, (err) => {
                            fail;
                        });

                    }));


            it('should update model',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Put);
                                expect(c.request.url).toBe('https://somewhere.com/users/0');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(user)
                                }));
                                c.mockRespond(res);

                            });

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.map(APIS.FIRST.toString(), url);
                        rest.add(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').update(user, [{ id: 0 }]).subscribe((res) => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        });

                    }));


            it('should delete model',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Delete);
                                expect(c.request.url).toBe('https://somewhere.com/users/0');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(user)
                                }));
                                c.mockRespond(res);

                            });

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.map(APIS.FIRST.toString(), url);
                        rest.add(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').remove([{ id: 0 }]).subscribe((res) => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        });

                    }));

           
            xit('should get jsonp data',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp: Jsonp) => {

                        backend.connections.subscribe({
                            next: connection => {

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
                        Resource.map(APIS.FIRST.toString(), url);
                        rest.add(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').jsonp().subscribe((res) => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        });

                    }));








        });
    }
}



