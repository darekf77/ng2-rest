"use strict";
var testing_1 = require('@angular/core/testing');
// Load the implementations that should be tested
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var testing_2 = require('@angular/http/testing');
var resource_service_1 = require('./resource.service');
var APIS;
(function (APIS) {
    APIS[APIS["FIRST"] = 0] = "FIRST";
    APIS[APIS["SECOND"] = 1] = "SECOND";
})(APIS || (APIS = {}));
describe('ng2-rest', function () {
    // provide our implementations or mocks to the dependency injector
    testing_1.beforeEachProviders(function () { return [
        http_1.Http, http_1.HTTP_PROVIDERS,
        core_1.provide(http_1.XHRBackend, { useClass: testing_2.MockBackend }),
        resource_service_1.Resource
    ]; });
    testing_1.it('should map model withour problems', testing_1.inject([resource_service_1.Resource, http_1.Http], function (rest, http) {
        rest = new resource_service_1.Resource(http);
        expect(rest.map(APIS.FIRST, 'https://somewhere')).toBeTruthy();
        expect(rest.map(APIS.FIRST, 'https://somewhere')).toBeFalse();
        
    }));
});
