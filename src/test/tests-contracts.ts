import {
    TestBed,
    inject, async
} from '@angular/core/testing';
import { ApplicationRef, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import {
    Http, HttpModule,
    JsonpModule, XHRBackend, JSONPBackend,
    Response, ResponseOptions,
    Jsonp, ConnectionBackend,
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { Resource } from '../resource.service';
import { MockingMode } from '../mocking-mode';

import { APIS, User } from './mock';

export class TestContracts {

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



        describe('Contract gather form', () => {

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

                Resource.reset();

                return TestBed.configureTestingModule({
                    imports: [HttpModule, JsonpModule],
                    declarations: [],
                    providers: [
                        Resource,
                        ViewContainerRef,
                        { provide: XHRBackend, useClass: MockBackend },
                        { provide: JSONPBackend, useExisting: MockBackend },
                    ]
                })

            });



            it('should not throw error with empty form', async(() => {
                let d = inject([Resource, Http, Jsonp],
                    (rest: Resource<APIS, User, User[]>, http: Http, jp: Jsonp) => {

                        rest = new Resource<APIS, User, User[]>(http, jp);
                        let url = 'https://somewhere.com';
                        Resource.map(APIS.FIRST.toString(), url);
                        Resource.setMockingMode(MockingMode.MOCKS_ONLY);
                        rest.add(APIS.FIRST, 'user');

                        let form = new FormBuilder();

                        let aa = rest.api(APIS.FIRST, 'user').contract(form.group({}))
                            .mock(JSON.stringify(user)).get([{ id: 1 }]).subscribe(dd => {
                                console.log('SUPER')
                            }, err => {
                                console.log('ERORRO :(', err)
                            });

                    })

                d();
            }));






        });


    }

}