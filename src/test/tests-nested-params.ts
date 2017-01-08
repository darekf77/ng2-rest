import {
    TestBed,
    inject
} from '@angular/core/testing';
import { ViewContainerRef } from '@angular/core';

import { UrlNestedParams } from '../nested-params';
import { Resource } from '../resource.service';
import { APIS, User } from './mock';
import {
    Http, HttpModule,
    JsonpModule, XHRBackend, JSONPBackend,
    Response, ResponseOptions, RequestMethod,
    Jsonp, ConnectionBackend,
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function TestNestedParams() {

    describe('Nested params', () => {
        let user: User;


        beforeEach(() => {
            user = {
                name: 'Dariusz',
                age: 25,
                id: 0
            };

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
            });
        });

        it('shoudl be good pattern', () => {
            let pattern = 'http://something.com/book/:boookId/author/:author';
            expect(UrlNestedParams.isValid(pattern)).toBeTruthy();
        })

        it('shoudl not be good pattern', () => {
            let pattern = 'http://something.com/book/boookId/author/author';
            expect(UrlNestedParams.isValid(pattern)).toBeFalsy();
        })


        it('shoudl valid url - pattern', () => {
            let pattern = 'http://something.com/book/:boookId/author/:author';
            let url = 'http://something.com/book/12/author/jensend';
            expect(UrlNestedParams.check(url, pattern)).toBeTruthy();
        })

        it('shoudl valid url - pattern (with slash on end) ', () => {
            let pattern = 'http://something.com/book/:boookId/author/:author/';
            let url = 'http://something.com/book/12/author/jensend';
            expect(UrlNestedParams.check(url, pattern)).toBeTruthy();
        })

        it('shoudl valid url (with slash on end) - pattern ', () => {
            let pattern = 'http://something.com/book/:boookId/author/:author';
            let url = 'http://something.com/book/12/author/jensend/';
            expect(UrlNestedParams.check(url, pattern)).toBeTruthy();
        })

        it('shoudl not valid bad urls ', () => {
            let pattern = 'http://something.com/book/:boookId/author/:author';
            let url = 'something.com/book/12/author/jensend/';
            expect(UrlNestedParams.check(url, pattern)).toBeFalsy();
        })

        it('shoudl not valid url with pattern ', () => {
            let pattern = 'http://something.com/book/:boookId/author/:author';
            let url = 'http://something.com/book/12/author';
            expect(UrlNestedParams.check(url, pattern)).toBeFalsy();
        })

        it('shoudl retrive models ', () => {
            let pattern = 'http://something.com/book/:boookId/author/:authorId';
            expect(UrlNestedParams.getModels(pattern)).toEqual(['book', 'author']);
        })

        it('shoudl check if url contains models ', () => {
            let url = 'http://something.com/book/12/author';
            expect(UrlNestedParams.containsModels(url, ['book', 'author'])).toBeTruthy();
        })

        it('shoudl check if url not contains models ', () => {
            let url = 'http://something.com/booka/12/author';
            expect(UrlNestedParams.containsModels(url, ['book', 'author'])).toBeFalsy();
        })

        it('should save nested model (1 level) ',
            inject([Resource, Http, MockBackend, Jsonp],
                (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
                    backend.connections.subscribe(
                        (c: MockConnection) => {

                            expect(c.request.method).toBe(RequestMethod.Post);
                            // expect(c.request.url).toBe('https://somewhere.com/users/12');
                            user.id = 1;
                            let res = new Response(new ResponseOptions({
                                body: JSON.stringify(user)
                            }));
                            c.mockRespond(res);

                        });

                    rest = new Resource<APIS, User, User[]>(http, jp);
                    let url = 'https://somewhere.com/users/:userid';
                    Resource.map(APIS.FIRST.toString(), url);
                    rest.add(APIS.FIRST, 'users/:userid');
                    rest.api(APIS.FIRST, `users/12`, )
                        .save(user).subscribe((res) => {
                            expect(res.id).toBeDefined();
                        }, (err) => {
                            fail;
                        });

                }));



    });


}