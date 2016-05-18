import {
    it,
    inject,
    injectAsync,
    beforeEachProviders
} from '@angular/core/testing';

// Load the implementations that should be tested

import {provide} from '@angular/core';
import {Http, HTTP_PROVIDERS, XHRBackend, RequestMethod,
    Response, ResponseOptions} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { Resource } from '../resource.service';
import { APIS, User } from './mock';

export class TestRest {
    
    clone(u:User,id:string = ''):User {
        let t:User = JSON.parse(JSON.stringify(u));
        t.name += id;
        return t;
    }
    
    constructor() {
        describe('rest api', () => {

            let user: User;
            let users: User[];

            beforeEachProviders(() => [
                Http, HTTP_PROVIDERS,
                provide(XHRBackend, { useClass: MockBackend }),
                Resource,
                MockBackend
            ]);

            beforeEach(() => {
                user = {
                    name: 'Dariusz',
                    age: 25,
                    id: undefined
                };
                users = [];
                users.push(this.clone(user,'1'));
                users.push(this.clone(user,'2'));
                users.push(this.clone(user,'3'));
                
            });

            it('should retrive model with get request',
                inject([Resource, Http, MockBackend],
                    (rest: Resource<APIS>, http: Http, backend: MockBackend) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Get);
                                expect(c.request.url).toBe('https://somewhere.com/users/0');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(user)
                                }));
                                c.mockRespond(res);

                            });

                        rest = new Resource<APIS>(http);
                        let url = 'https://somewhere.com';
                        rest.map(APIS.FIRST, url);
                        rest.add<User,User[]>(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').get(0).subscribe((res) => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        });

                    }));
                    
            it('should retrive models array with get request',
                inject([Resource, Http, MockBackend],
                    (rest: Resource<APIS>, http: Http, backend: MockBackend) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Get);
                                expect(c.request.url).toBe('https://somewhere.com/users');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(users)
                                }));
                                c.mockRespond(res);



                            });

                        rest = new Resource<APIS>(http);
                        let url = 'https://somewhere.com';
                        rest.map(APIS.FIRST, url);
                        rest.add<User,User[]>(APIS.FIRST, 'users');
                        let r = rest.api(APIS.FIRST, 'users').query();
                        expect(r).toBeDefined();
                        r.subscribe((res) => {
                            expect(res).toEqual(users);
                        }, (err) => {
                            fail;
                        });

                    }));
            
            
            it('should save model',
                inject([Resource, Http, MockBackend],
                    (rest: Resource<APIS>, http: Http, backend: MockBackend) => {
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

                        rest = new Resource<APIS>(http);
                        let url = 'https://somewhere.com';
                        rest.map(APIS.FIRST, url);
                        rest.add<User,User[]>(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').save(user).subscribe((res) => {
                            expect(res.id).toBeDefined();
                        }, (err) => {
                            fail;
                        });

                    }));
            
            
            it('should update model',
                inject([Resource, Http, MockBackend],
                    (rest: Resource<APIS>, http: Http, backend: MockBackend) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Put);
                                expect(c.request.url).toBe('https://somewhere.com/users/0');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(user)
                                }));
                                c.mockRespond(res);

                            });

                        rest = new Resource<APIS>(http);
                        let url = 'https://somewhere.com';
                        rest.map(APIS.FIRST, url);
                        rest.add<User,User[]>(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').update(0,user).subscribe((res) => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        });

                    }));
                    
                    
            it('should delete model',
                inject([Resource, Http, MockBackend],
                    (rest: Resource<APIS>, http: Http, backend: MockBackend) => {
                        backend.connections.subscribe(
                            (c: MockConnection) => {

                                expect(c.request.method).toBe(RequestMethod.Delete);
                                expect(c.request.url).toBe('https://somewhere.com/users/0');
                                let res = new Response(new ResponseOptions({
                                    body: JSON.stringify(user)
                                }));
                                c.mockRespond(res);

                            });

                        rest = new Resource<APIS>(http);
                        let url = 'https://somewhere.com';
                        rest.map(APIS.FIRST, url);
                        rest.add<User,User[]>(APIS.FIRST, 'users');
                        rest.api(APIS.FIRST, 'users').remove(0).subscribe((res) => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        });

                    }));
            


        });
    }
}



