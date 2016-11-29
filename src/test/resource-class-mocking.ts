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
import { MockAutoBackend } from '../models';

let deepEqual = function (x, y) {
    if ((typeof x == 'object' && x != null) && (typeof y == 'object' && y != null)) {
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
                        let res = MockAutoBackend.goInside(d, ['book', 'cat', 'mouse']);
                        // console.log(d);
                        // console.log(d4);
                        // console.log(res);
                        expect(deepEqual(d, d4)).toBeTruthy();
                    }));

            it('should object to be transofrmed',
                inject([Resource, Http, MockBackend, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {

                        let t = {
                            $name: ['Dariusz', 'Adam', 'Karol', 'Maciej'],
                            $age: [2, 4, 5, 66, 9],
                            $book: [
                                { id: 1, $title: ['asdas', '21323'] },
                                { id: 2, $title: ['ddd', 'aaa'] }
                            ],
                            $square: [
                                ['1', '1'],
                                ['2', '2'],
                                ['3', '23']
                            ],
                            networth: 100000
                        };

                        let d = new MockAutoBackend(t, 7);
                        d.models.forEach(m => {
                            console.log(m);
                        });

                        // let d2 = new MockPagination(t, 4);
                        // console.log('MODEL', d.models);
                        // console.log('MODEL', d2.models);
                        // expect(deepEqual(d.model,d2.model)).toBeFalsy();

                    }));



        });
    }
}



