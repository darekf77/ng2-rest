import {
    it,
    inject,
    injectAsync,
    beforeEachProviders
} from '@angular/core/testing';

// Load the implementations that should be tested

import {provide} from '@angular/core';
import {Http, HTTP_PROVIDERS, XHRBackend} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { Resource } from './resource.service';

import { 
    TestMap, 
    TestAdd,
    TestRest,
    TestRestExp
 } from './test';




describe('ng2-rest', () => {
    // provide our implementations or mocks to the dependency injector
    beforeEachProviders(() => [
        Http, HTTP_PROVIDERS,
        provide(XHRBackend, { useClass: MockBackend }),
        Resource
    ]);

    new TestMap();
    new TestAdd();
    new TestRest();
    new TestRestExp();



});
