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
var Resource = (function () {
    function Resource(http) {
        this.http = http;
        this.endpoints = {};
    }
    Resource.prototype.map = function (endpoint, url) {
        var e = (endpoint).toString();
        if (this.endpoints[e] !== undefined) {
            console.warn('Cannot use map function at the same API endpoint again');
            return false;
        }
        this.endpoints[e] = {
            url: url,
            models: {}
        };
        return true;
    };
    Resource.prototype.add = function (endpoint, model) {
        var e = (endpoint).toString();
        if (this.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped !');
            return false;
        }
        if (this.endpoints[e].models[model] !== undefined) {
            console.error("Model " + model + " is already defined in endpoint");
            return false;
        }
        this.endpoints[e].models[model] =
            new rest_class_1.Rest(this.endpoints[e].url
                + '/' + model, this.http);
        return true;
    };
    Resource.prototype.api = function (endpoint, model) {
        var e = (endpoint).toString();
        if (this.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped !');
        }
        if (this.endpoints[e].models[model] === undefined) {
            console.error("Model " + model + " is undefined in this endpoint");
        }
        return this.endpoints[(endpoint).toString()].models[model];
    };
    Resource = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(http_1.Http))
    ], Resource);
    return Resource;
}());
exports.Resource = Resource;
