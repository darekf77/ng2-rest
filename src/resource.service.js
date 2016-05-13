"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
        __param(0, core_1.Inject(http_1.Http))
    ], Resource);
    return Resource;
}());
exports.Resource = Resource;
