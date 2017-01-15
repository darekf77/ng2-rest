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

import { Resource } from './resource.service';

import {
    TestMap,
    TestAdd,
    TestRest,
    TestRestMock,
    TestMockingClass,
    TestProduction,
    TestContracts,
    TestQueryParams,
    TestNestedParams,
    TestSimpleRest
} from './test';




describe('ng2-rest', () => {
    // provide our implementations or mocks to the dependency injector
    beforeEach(() => {
        return TestBed.configureTestingModule({
            imports: [HttpModule, JsonpModule],
            declarations: [],
            providers: [
                Resource,
                ViewContainerRef,
                { provide: XHRBackend, useClass: MockBackend },
                { provide: JSONPBackend, useExisting: MockBackend },
            ]
        });
    });

    // it( 'shoud be done ', (done) => done() );

    new TestMockingClass();
    new TestMap();
    new TestAdd();
    new TestRest();
    new TestRestMock();
    new TestProduction();
    new TestContracts();
    TestQueryParams();
    TestNestedParams();
    new TestSimpleRest()
});
