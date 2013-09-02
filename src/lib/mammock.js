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
    path = require("path"),
    fs = require("fs"),
    DEFAULT_PORT = 3030,
    Mammock = {},
    blacklist = [
        /^.*(favicon)(?:\.ico)?$/
    ];

var Mammock = function (options) {
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
    this.timeStamp = function () {
        var date = new Date();
        return dateFormat(date, "isoDateTime");
    };

    this.logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                json: false,
                colorize: true,
                silent: this.options.silent,
                timestamp: this.timeStamp
            })
        ],
        exitOnError: false
    });

    this._internals = {
        pkginfo: {
            version: "0.2.3"
        }
    };
    
    return this;
};

Mammock.prototype.stop = function () {
    var _this = this;
    _this.logger.info("Shutting down...");
    this._internals.server.close();
    _this.logger.info("Server shutdown complete.");
};

Mammock.prototype.start = function (fn) {
    var _this = this;
    
    fs.realpath(this.options.root, function (pathError, rootPath) {
        _this.options.root = rootPath;

        _this.logger.info("Starting server on port " + _this.options.port);
        _this._internals.server = http.createServer();
        
        _this.logger.info("Serving data from " + _this.options.root);

        _this._internals.server.on("request", function (request, response) {
            var blacklisted = false,
                missing = false,
                invalidContent = false,
                isHandled = false;
            for (var index in blacklist) {
                _this.logger.info("Checking blacklist entries for " + request.url);
                var blacklist_entry = blacklist[index],
                    matches = request.url.match(blacklist_entry);
                if (matches && matches.length > 0) {
                    _this.logger.error("Found blacklist entry " + blacklist[index] + " for " + request.url);
                    blacklisted = true;
                }
            }
            var route = request.url;
            route = route.replace(/^\//g, '');
            route = route.replace(/\/$/g, '');
            if (route === "") {
                _this.logger.info("Directory root requested, serving _index module");
                route = "_index";
            }
            
            try {
                _this.logger.info("Looking for endpoint in " + path.join(_this.options.root, route));
                require.resolve(path.join(_this.options.root, route));
            } catch (ex) {
                _this.warn("Endpoint could not be found, attempting as directory index");
                _this.warn(ex.message);
                try {
                    require.resolve(path.join(_this.options.root, route) + "/_index");
                    _this.logger.info("Found directory index for " + route);
                }
                catch (fbex) {
                    _this.logger.error("No index found, missing resource requested: " + request.url);
                    _this.logger.error("No module named '" + route + "' could be found.");
                    _this.logger.error(fbex.message);
                    missing = true;
                }
            }

            if (request.headers['content-type']) {
                _this.logger.info("Received content type: " + request.headers['content-type']);
            }

            if (!blacklisted && !missing && !invalidContent) {
                _this.logger.info("Request being handled...");
                _this.logger.info("Loading endpoint from " + require.resolve(path.join(_this.options.root, route)));
                var endpoint = new (require(path.join(_this.options.root, route)))();
                var methods = [];
                _this.logger.extend(endpoint);
                for (var method in endpoint) {
                    if (endpoint[method] && !_this.logger[method]) {
                        methods.push(method.toUpperCase());
                    }
                }

                if (!isHandled && endpoint[request.method.toLowerCase()]) {
                    var requestResponse;
                    _this.logger.info("Serving " + request.method + " request...");
                    
                    if (!endpoint[request.method.toLowerCase()].override) {
                        if (endpoint[request.method.toLowerCase()].capture) {
                            var capturedData = "";
                            request.on('data', function (data) {
                                _this.logger.info("Receiving " + request.method + " data...");
                                capturedData += data;
                            });
                            request.on('end', function () {
                                _this.logger.info("Finished receiving " + request.method + " data");
                                requestResponse = endpoint[request.method.toLowerCase()](route, request, response, capturedData);
                                _this.logger.info("Writing header response to " + request.method + " request...");
                                response.writeHeader(requestResponse.status, requestResponse.headers || {});
                                _this.logger.info("Writing response to " + request.method + " request...");
                                
                                if (requestResponse.response) {
                                    response.write(requestResponse.response);
                                }
                                response.end();
                            });
                        } else {
                            _this.logger.info("Writing header response to " + request.method + " request...");
                            requestResponse = endpoint[request.method.toLowerCase()](route, request, response);
                            response.writeHeader(requestResponse.status, {
                                "Content-Type": "application/json"
                            });
                            _this.logger.info("Writing response to " + request.method + " request...");
                            if (requestResponse.response) {
                                response.write(requestResponse.response);    
                            }
                            response.end();
                        }                        
                    } else {
                        endpoint[request.method.toLowerCase()](route, request, response);
                    }
                    isHandled = true;
                }

                if (!isHandled) {
                    response.writeHeader(405, {
                        "Accept": methods.join(',')
                    });
                    response.end();
                }
            } else if (blacklisted) {
                _this.logger.error("Blacklisted endpoint request rejected with 404 status");
                response.writeHeader(404, {
                    "Content-Type": "text/plain"
                });
                response.end();
            } else if (missing) {
                _this.logger.error("Missing endpoint request rejected with 404 status");
                response.writeHeader(404, {
                    "Content-Type": "text/plain"
                });
                response.end();
            } else if (invalidContent) {
                _this.logger.error("Invalid content request rejected with 406 status");
                response.writeHeader(406, {
                    "Content-Type": "text/plain"
                });
                response.end();
            }
        });

        _this._internals.server.listen(_this.options.port);

        _this.logger.info("Server started and listening...");

        if (typeof fn === "function") {
            fn({ server: _this });
        }
    });
};

Mammock.prototype.getVersion = function () {
    return this._internals.pkginfo.version;
};

module.exports = Mammock;