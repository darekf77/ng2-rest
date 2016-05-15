"use strict";
var http_1 = require('@angular/http');
require('rxjs/add/operator/map');
var Rest = (function () {
    function Rest(endpoint, http) {
        var _this = this;
        this.endpoint = endpoint;
        this.http = http;
        this.query = function () {
            return _this.http.get(_this.endpoint).map(function (res) { return res.json(); });
        };
        this.get = function (id) {
            return _this.http.get(_this.endpoint + '/' + id).map(function (res) { return res.json(); });
        };
        this.save = function (item) {
            var toAdd = JSON.stringify(item);
            return _this.http.post(_this.endpoint, toAdd, { headers: _this.headers }).map(function (res) { return res.json(); });
        };
        this.update = function (id, itemToUpdate) {
            return _this.http.put(_this.endpoint + '/' + id, JSON.stringify(itemToUpdate), { headers: _this.headers }).map(function (res) { return res.json(); });
        };
        this.remove = function (id) {
            return _this.http.delete(_this.endpoint + '/' + id);
        };
        this.headers = new http_1.Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }
    return Rest;
}());
exports.Rest = Rest;
