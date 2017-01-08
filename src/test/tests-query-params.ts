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
import { APIS, User } from './mock';


export function TestQueryParams() {

    this.clone = (u: User, id: string = ''): User => {
        let t: User = JSON.parse(JSON.stringify(u));
        t.name += id;
        return t;
    }


    describe('Query params', () => {

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



        it('Shoud transform url params from array', () => {
            let res = Rest.getParamsUrl([
                { 'super': 122 },
                { 'reg': 'ttt', regex: new RegExp('t{3}', 'g') }
            ])
            expect(res).toEqual('?super=122&reg=ttt');

        });


        it('Shoud transform url params from one object', () => {
            let res = Rest.getParamsUrl([
                { 'super': 122, 'reg': 'ttt', dd: 12 }
            ])
            expect(res).toEqual('?super=122&reg=ttt&dd=12');

        });

        it('Shoud not put undefined in query param', () => {
            let res = Rest.getParamsUrl([
                { 'super': 122, 'reg': undefined }
            ])
            expect(res).toEqual('?super=122');

        });

        it('Shoud decode params for string', () => {
            let p = '?super=122&reg=ttt&dd=12'
            expect(Rest.decodeUrl(p)).toEqual({ 'super': 122, 'reg': 'ttt', dd: 12 });
        });

        it('Shoud decode params for string', () => {
            let p = '?super=%7B%22name%22%3A%22Dariusz%22%7D'
            expect(Rest.decodeUrl(p)).toEqual({ 'super': { name: 'Dariusz' } });
        });


        it('Shoud transform url param into query string with object', () => {
            let p = '?super=%7B%22name%22%3A%22Dariusz%22%7D';
            let o = [{ 'super': { name: 'Dariusz' } }];
            expect(Rest.getParamsUrl(o)).toEqual(p);
        });


        it('Shoud transform url param into query string with object and other parasm', () => {
            let p = '?super=%7B%22name%22%3A%22Dariusz%22%7D&da=10&hi=5';
            let o = [{ 'super': { name: 'Dariusz' }, haha: undefined, da: 10, hi: 5 }];
            expect(Rest.getParamsUrl(o)).toEqual(p);
        });


        it('Shoud transform url param with empty shits', () => {
            let p = '?super=&da=10&hi=5&aa=';
            let o = [{ 'super': '' }, {}, {}, { haha: undefined, da: 10, hi: 5 }, {}, {}, { aa: '' }];
            expect(Rest.getParamsUrl(o)).toEqual(p);
        });

        it('Should transofrm url without problems', () => {
            let u = 'http://10.48.0.173:16185/search?phrase=&pagination=\
%7B%22number%22%3A1%2C%22numberOfElements%22%3A10%7D&isFromLiveSearch=true'
            let e = {
                phrase: 0,
                pagination: {
                    number: 1,
                    numberOfElements: 10
                },
                isFromLiveSearch: true
            };
            expect(Rest.decodeUrl(u)).toEqual(e);

        })



    });


}