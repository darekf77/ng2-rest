import {
    TestBed,
    inject, async
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

export class TestSimpleRest {

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


            it('get data by simple resource', async(
                inject([Resource, Http, MockBackend, Jsonp],
                    (http: Http, backend: MockBackend, jp) => {
                        // backend.connections.subscribe(
                        //     (c: MockConnection) => {

                        // expect(c.request.method).toBe(RequestMethod.Delete);
                        // expect(c.request.url).toBe('https://somewhere.com/users/0');
                        // let res = new Response(new ResponseOptions({
                        //     body: JSON.stringify(user)
                        // }));
                        // c.mockRespond(res);

                        // });

                        let url = 'https://somewhere.com';
                        let rest = new SimpleResource<APIS, User, User[], any, any>(APIS.FIRST, 'users/:id');

                        Resource.map(APIS.FIRST.toString(), url);

                        console.log('what the fuck')

                        rest.model({ id: 0 }).get().then(res => {
                            expect(res).toEqual(user);
                        }, (err) => {
                            fail;
                        })

                        // rest.add(APIS.FIRST, 'users');
                        // rest.api(APIS.FIRST, 'users').remove([{ id: 0 }]).subscribe((res) => {
                        //     expect(res).toEqual(user);
                        // }, (err) => {
                        //     fail;
                        // });

                    })));






        });
    }
}



