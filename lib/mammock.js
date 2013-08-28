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
    DEFAULT_PORT = 3030,
    Mammock = {},
    blacklist = [
        /^.*(favicon)(?:\.ico)?$/
    ];

var Server = function (options) {
    if (!(this instanceof Server)) {
        return new Server(options);
    }
    if (typeof options === 'undefined') {
        throw new Error("options must be specified", "mammock.js", 13);
    }
    this.options = extend(true, {
        port: DEFAULT_PORT,
        root: process.cwd(),
        blacklist: blacklist
    }, options);

    this.logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                handleExceptions: true,
                json: false,
                colorize: true
            })
        ],
        exitOnError: false
    });

    this._internals = {};
    return this;
};


Server.prototype.start = function () {
    var _this = this;
    this.logger.info("Starting server on port " + this.options.port);
    this._internals.server = http.createServer();
    this.logger.info("Serving data from " + this.options.root);

    this._internals.server.on("request", function (request, response) {
        var blacklisted = false,
            missing = false,
            invalidContent = false;
        for (var index in blacklist) {
            _this.logger.info("Checking blacklist entries for " + request.url);
            var blacklist_entry = blacklist[index];
            var matches = request.url.match(blacklist_entry);
            if (matches && matches.length > 0) {
                _this.logger.error("Found blacklist entry " + blacklist[index] + " for " + request.url);
                blacklisted = true;
            }

        }
        var route = request.url;
        route.replace(/^\/|\/$/g, '');
        route = route.split("/");
        var currentPath = route.splice(0, 1)[0];
        if (route.length === 1 && currentPath === "") {
            _this.logger.info("No resource requested, providing index.");
            currentPath = "index";
        }
        try {
            require.resolve("./" + currentPath);
        } catch (ex) {
            _this.logger.error("Missing resource requested: " + request.url);
            _this.logger.error("No module named '" + currentPath + "' could be found.");
            missing = true;
        }

        if (!request.headers['content-type'] || request.headers['content-type'] !== "application/json") {
            if (request.headers['content-type']) {
                _this.logger.error("Invalid content type provided: " + request.headers['content-type']);
            } else {
                _this.logger.error("No content type specified");
            }
            invalidContent = true;
        } else {
            _this.logger.info("Received content type: " + request.headers['content-type']);
        }


        if (!blacklisted && !missing && !invalidContent) {
            _this.logger.info("Request being handled...");
            //@TODO: This should be done differently...
            _this.logger.info("Loading view from " + require.resolve("./" + currentPath));
            var view = new(require("./" + currentPath)).view();

            if (request.method === "GET" && view.get && typeof view.get === "function") {
                view.get(route, request, response);
            }

            if (request.method === "POST" && view.post && typeof view.post === "function") {
                _this.logger.info("Received POST");
                var postData = '';
                request.on('data', function (data) {
                    _this.logger.info("Receiving POST data...");
                    postData += data;
                });
                request.on('end', function () {
                    _this.logger.info("Finished receiving POST data");
                    var postResponse = view.post(route, request, response, postData);
                    _this.logger.info("Writing header response to POST request...");
                    response.writeHeader(postResponse.status, {
                        "Content-Type": "application/json"
                    });
                    _this.logger.info("Writing response to POST request...");
                    response.write(postResponse.response);
                    response.end();
                });
            }

            if (request.method === "PUT" && view.post && typeof view.post === "function") {
                view.put(route, request, response);
            }

            if (request.method === "DELETE" && view.post && typeof view.post === "function") {
                view.delete(route, request, response);
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


    this._internals.server.listen(this.options.port);


    this.logger.info("Server started and listening...");

};
Mammock.Server = Server;


var Endpoint = function () {
    return this;
};
Mammock.Endpoint = Endpoint;

module.exports = Mammock;