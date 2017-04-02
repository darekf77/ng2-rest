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

import { Resource } from '../resource.service';
import { APIS, User } from './mock';
import { MockBackend as MockBackendModule, MockRequest, MockResponse } from '../mock-backend';
import { MockingMode } from '../mocking-mode';

export class TestRestMock {

    clone(u: User, id: string = ''): User {
        let t: User = JSON.parse(JSON.stringify(u));
        t.name += id;
        return t;
    }

    areEqual(o1: Object, o2: Object): boolean {
        let equal = true;
        for (let u in o1) {
            if (o1.hasOwnProperty(u) && o2.hasOwnProperty(u)) {
                expect(o1[u]).toBe(o2[u]);
            }
            else {
                equal = false;
                return false;
            }
        }
        return equal;
    }

    constructor() {
        describe('mock rest api', () => {

            let user: User;
            let users: User[];

            beforeEach(() => {

                user = {
                    name: 'Dariusz',
                    age: 25,
                    id: 0
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


            // it('should retrive mocked model with get request',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             rest.api(APIS.FIRST, 'users').mock(JSON.stringify(user)).get([{ id: 0 }]).subscribe((res) => {
            //                 let o = JSON.parse(JSON.stringify(user))
            //                 expect(this.areEqual(o, res)).toBeTruthy();
                            
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));

            // it('should retrive deleted mocked model with remove request',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             rest.api(APIS.FIRST, 'users').mock(JSON.stringify(user)).remove([{ id: 0 }]).subscribe((res) => {
            //                 let o = JSON.parse(JSON.stringify(user))
            //                 expect(this.areEqual(o, res)).toBeTruthy();
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));


            // it('should retrive created mocked model with  save',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             rest.api(APIS.FIRST, 'users').mock(JSON.stringify(user)).save(user).subscribe((res) => {
            //                 let o = JSON.parse(JSON.stringify(user))
            //                 expect(this.areEqual(o, res)).toBeTruthy();
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));

            // it('should retrive update mocked model with remove update',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             rest.api(APIS.FIRST, 'users').mock(JSON.stringify(user)).update(user, [{ id: 0 }]).subscribe((res) => {
            //                 let o = JSON.parse(JSON.stringify(user))
            //                 expect(this.areEqual(o, res)).toBeTruthy();
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));

            // it('should retrive json mocked model with jsonp method',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             rest.api(APIS.FIRST, 'users').mock(JSON.stringify(user)).jsonp().subscribe((res) => {
            //                 let o = JSON.parse(JSON.stringify(user))
            //                 expect(this.areEqual(o, res)).toBeTruthy();
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));

            // it('should retrive mocked models with query request',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');
            //             rest.api(APIS.FIRST, 'users').mock(JSON.stringify(users)).query().subscribe((res) => {
            //                 res.forEach((resp, key) => {
            //                     let o = JSON.parse(JSON.stringify(users[key]))
            //                     expect(this.areEqual(res[key], o)).toBe(true);
            //                 })

            //             }, (err) => {
            //                 fail;
            //             });

            //         }));

            // it('should changed mocked model trough controller with proper params',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             let ctrl = (req: MockRequest<User>) => {
                            
            //                 req.data.id = 100;
            //                 expect(req.params['id']).toBe(0);
            //                 return { data: req.data };
            //             }

            //             rest.api(APIS.FIRST, 'users').mock(user, 0, ctrl).get([{ id: 0 }]).subscribe((res) => {
            //                 expect(res.id).toBe(100);
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));

            // it('should retrive model with get request even if mock is defined',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
            //             backend.connections.subscribe(
            //                 (c: MockConnection) => {

            //                     expect(c.request.method).toBe(RequestMethod.Get);
            //                     expect(c.request.url).toBe('https://somewhere.com/users/0');
            //                     let res = new Response(new ResponseOptions({
            //                         body: JSON.stringify(user)
            //                     }));
            //                     c.mockRespond(res);

            //                 });

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.mockingMode.setBackendOnly();
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');
            //             rest.api(APIS.FIRST, 'users').mock({ something: 'something bad' }).get([{ id: 0 }]).subscribe((res) => {
            //                 expect(res).toEqual(user);
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));


            // it('should generate models throuh auto backend',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             let ctrl = (request: MockRequest<User>) => {
            //                 expect(backend).toBeDefined();
                            
            //                 request.data.id = 100;
            //                 expect(request.params['id']).toBe(0);
            //                 return undefined;
            //             }

            //             rest.api(APIS.FIRST, 'users').mock(user, 0, ctrl, 1).get([{ id: 0 }]).subscribe((res) => {
            //                 expect(res.id).toBe(100);
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));

            // it('should not generate models throuh auto backend',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             let ctrl = (request: MockRequest<User>) => {
            //                 expect(backend).toBeUndefined();
            //                 request.data.id = 100;
            //                 expect(request.params['id']).toBe(0);
            //                 return request.data;
            //             }

            //             rest.api(APIS.FIRST, 'users').mock(user, 0, ctrl).get([{ id: 0 }]).subscribe((res) => {
            //                 expect(res.id).toBe(100);
            //             }, (err) => {
            //                 fail;
            //             });

            //         }));


            // it('should not generate models throuh auto backend',
            //     inject([Resource, Http, MockBackend, Jsonp],
            //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

            //             rest = new Resource<APIS, User, User[]>(http, jp);
            //             let url = 'https://somewhere.com';
            //             Resource.map(APIS.FIRST.toString(), url);
            //             rest.add(APIS.FIRST, 'users');

            //             let ctrl = (request: MockRequest<User>) => {
            //                 expect(backend).toBeUndefined();
            //                 request.data.id = 100;
            //                 expect(request.params['id']).toBe(0);
            //                 return request.data;
            //             }

            //             rest.api(APIS.FIRST, 'users')
            //                 .mock(user, 0, ctrl)
            //                 .get([{ id: 0 }]).subscribe((res) => {
            //                     expect(res.id).toBe(100);
            //                 }, (err) => {
            //                     fail;
            //                 });

            //         }));



        });
    }
}



