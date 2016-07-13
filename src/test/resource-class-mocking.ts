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
import { MockAutoBackend } from '../mock-auto-backend.class';

let deepEqual = function (x, y) {
    if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
        if (Object.keys(x).length != Object.keys(y).length)
            return false;

        for (let prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop]))
                    return false;
            }
            else
                return false;
        }

        return true;
    }
    else if (x !== y)
        return false;
    else
        return true;
}

export class TestMockingClass {

    clone(u: User, id: string = ''): User {
        let t: User = JSON.parse(JSON.stringify(u));
        t.name += id;
        return t;
    }

    constructor() {
        describe('mock rest api', () => {

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
                    id: 0
                };
                users = [];
                users.push(this.clone(user, '1'));
                users.push(this.clone(user, '2'));
                users.push(this.clone(user, '3'));

            });

            it('should go inside objectc on first level',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

                        let d = {
                            'name': 'aa'
                        };

                        let d2 = {
                            'name': 'aa',
                            book: {}
                        };
                        let res = (MockAutoBackend.goInside(d, ['book']));
                        // console.log(d);
                        // console.log(d2);
                        // console.log(res);
                        expect(deepEqual(d, d2)).toBeTruthy();
                    }));

            it('should go inside objectc on second level',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

                        let d = {
                            'name': 'aa'
                        };

                        let d3 = {
                            'name': 'aa',
                            book: {
                                'cat': {

                                }
                            }
                        };
                        let res = MockAutoBackend.goInside(d, ['book', 'cat']);
                        // console.log(d);
                        // console.log(d3);
                        // console.log(res);
                        expect(deepEqual(d, d3)).toBeTruthy();
                    }));

                it('should go inside objectc on third level',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

                        let d = {
                            'name': 'aa'
                        };

                        let d4 = {
                            'name': 'aa',
                            book: {
                                'cat': {
                                    'mouse': {

                                    }
                                }
                            }
                        };
                        let res = MockAutoBackend.goInside(d, ['book', 'cat','mouse']);
                        // console.log(d);
                        // console.log(d4);
                        // console.log(res);
                        expect(deepEqual(d, d4)).toBeTruthy();
                    }));

                it('should object to be transofrmed',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

                        let t = {
                            name: ["Dariusz", "Adam"],
                            age: [2, 4, 5, 66],
                            book: [
                                { id: 1, title: ['asdas', '21323'] },
                                { id: 2, title: 'ii' }
                            ],
                            networth : 100000
                        };

                        let d = new MockAutoBackend(t, 4);
                        // let d2 = new MockPagination(t, 4);
                        // console.log('MODEL', d.models);
                        // console.log('MODEL', d2.models);
                        // expect(deepEqual(d.model,d2.model)).toBeFalsy();

                    }));



        });
    }
}



