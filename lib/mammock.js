/*
 * mammock
 * https://github.com/earmbrust/mammock
 *
 * Copyright (c) 2013 Elden Armbrust
 * Licensed under the MIT license.
 */
'use strict';
var winston = require("winston"),
    http = require("http"),
    extend = require("node.extend"),
    dateFormat = require('dateformat'),
    DEFAULT_PORT = 3030,
    Mammock = {},
    blacklist = [
        /^.*(favicon)(?:\.ico)?$/
    ];

var Server = function (options) {
    if (!(this instanceof Server)) {
        return new Server(options);
    }
    
    if (options) {
        this.options = extend(true, {
            port: DEFAULT_PORT,
            root: process.cwd(),
            blacklist: blacklist
        }, options);
    } else {
        this.options = {
            port: DEFAULT_PORT,
            root: process.cwd(),
            blacklist: blacklist
        };
    }

    this.options.root = this.options.root.replace(/\/$/g, '');

    var logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                json: false,
                colorize: true,
                silent: this.options.silent,
                timestamp: function () {
                    var date = new Date();
                    return dateFormat(date, "isoDateTime");
                }
            })
        ],
        exitOnError: false
    });
    logger.extend(this);

    this._internals = {};
    return this;
};


Server.prototype.start = function () {
    var _this = this;
    this.info("Starting server on port " + this.options.port);
    this._internals.server = http.createServer();
    this.info("Serving data from " + this.options.root);

    this._internals.server.on("request", function (request, response) {
        var blacklisted = false,
            missing = false,
            invalidContent = false;
        for (var index in blacklist) {
            _this.info("Checking blacklist entries for " + request.url);
            var blacklist_entry = blacklist[index];
            var matches = request.url.match(blacklist_entry);
            if (matches && matches.length > 0) {
                _this.error("Found blacklist entry " + blacklist[index] + " for " + request.url);
                blacklisted = true;
            }

        }
        var route = request.url;
        route = route.replace(/^\//g, '');
        route = route.replace(/\/$/g, '');
        if (route === "") {
            _this.info("Directory root requested, serving _index module");
            route = "_index";
        }
        
        try {
            _this.info("Looking for endpoint in " + _this.options.root + "/" + route);
            require.resolve(_this.options.root + "/" + route);
        } catch (ex) {
            _this.warn("Endpoint could not be found, attempting as directory index");
            _this.warn(ex.message);
            try {
                require.resolve(_this.options.root + "/" + route + "/_index");
                _this.info("Found directory index for " + route);
            }
            catch (fbex) {
                _this.error("No index found, missing resource requested: " + request.url);
                _this.error("No module named '" + route + "' could be found.");
                _this.error(fbex.message);
            }
            
            missing = true;
        }

        if (!request.headers['content-type'] || request.headers['content-type'] !== "application/json") {
            if (request.headers['content-type']) {
                _this.error("Invalid content type provided: " + request.headers['content-type']);
            } else {
                _this.error("No content type specified");
            }
            invalidContent = true;
        } else {
            _this.info("Received content type: " + request.headers['content-type']);
        }


        if (!blacklisted && !missing && !invalidContent) {
            _this.info("Request being handled...");
            _this.info("Loading endpoint from " + require.resolve(_this.options.root + "/" + route));
            var endpoint = new(require(_this.options.root + "/" + route))();

            if (request.method === "GET" && endpoint.get && typeof endpoint.get === "function") {
                endpoint.get(route, request, response);
            }

            if (request.method === "POST" && endpoint.post && typeof endpoint.post === "function") {
                _this.info("Received POST");
                var postData = '';
                request.on('data', function (data) {
                    _this.info("Receiving POST data...");
                    postData += data;
                });
                request.on('end', function () {
                    _this.info("Finished receiving POST data");
                    var postResponse = endpoint.post(route, request, response, postData);
                    _this.info("Writing header response to POST request...");
                    response.writeHeader(postResponse.status, {
                        "Content-Type": "application/json"
                    });
                    _this.info("Writing response to POST request...");
                    response.write(postResponse.response);
                    response.end();
                });
            }

            if (request.method === "PUT" && endpoint.post && typeof endpoint.post === "function") {
                endpoint.put(route, request, response);
            }

            if (request.method === "DELETE" && endpoint.post && typeof endpoint.post === "function") {
                endpoint.delete(route, request, response);
            }
        } else if (blacklisted) {
            _this.error("Blacklisted endpoint request rejected with 404 status");
            response.writeHeader(404, {
                "Content-Type": "text/plain"
            });
            response.end();
        } else if (missing) {
            _this.error("Missing endpoint request rejected with 404 status");
            response.writeHeader(404, {
                "Content-Type": "text/plain"
            });
            response.end();
        } else if (invalidContent) {
            _this.error("Invalid content request rejected with 406 status");
            response.writeHeader(406, {
                "Content-Type": "text/plain"
            });
            response.end();
        }

    });


    this._internals.server.listen(this.options.port);


    this.info("Server started and listening...");

};
Mammock.Server = Server;


var Endpoint = function () {
    return this;
};
Mammock.Endpoint = Endpoint;

module.exports = Mammock;