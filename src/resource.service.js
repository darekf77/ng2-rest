"use strict";
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var rest_class_1 = require('./rest.class');
var endpoints_enum_1 = require('./endpoints.enum');
var Resource = (function () {
    function Resource(http) {
        this.http = http;
        this.endpoints = {};
        this.endpoints[endpoints_enum_1.ENDPOINTS.API] = {
            url: 'http://localhost:3002/api/',
            models: {}
        };
    }
    Resource.prototype.add = function (endpoint, model) {
        this.endpoints[endpoints_enum_1.ENDPOINTS.API].models[model] =
            new rest_class_1.Rest(this.endpoints[endpoints_enum_1.ENDPOINTS.API].url + model, this.http);
    };
    Resource.prototype.api = function (endpoint, model) {
        return this.endpoints[endpoint].models[model];
    };
    Resource = __decorate([
        __param(0, core_1.Inject(http_1.Http)), 
        __metadata('design:paramtypes', [http_1.Http])
    ], Resource);
    return Resource;
}());
exports.Resource = Resource;
