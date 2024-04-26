/*
 * mammock
 * https://github.com/earmbrust/mammock
 *
 * Copyright (c) 2013 Elden Armbrust
 * Licensed under the MIT license.
 */
'use strict';
import Logger from './Logger';
const http = require('http');
const extend = require('node.extend');
const dateFormat = require('dateformat');
const path = require('path');
const fs = require('fs');
const DEFAULT_PORT = 3030;
const blacklist = [/^.*(favicon)(?:\.ico)?$/];

interface Options {
  silent?: boolean;
  port: number;
  root: string;
  blacklist: RegExp[];
}

interface PackageInfo {
  version: string;
}


interface ActionFunc {
    (): boolean;
}

interface EventFunc {
    (event: string, func: ActionFunc): void;
}

interface Server {
    close (): void;
    on (event: string, func: EventFunc);
    listen (port: number): void;
}

interface InternalSettings {
  server?: Server;
  pkginfo: PackageInfo;
  delayTimer?: NodeJS.Timeout
}

class MammockEngine {
  options: Options = {
    port: DEFAULT_PORT,
    root: process.cwd(),
    blacklist: blacklist,
  };
  private _internals: InternalSettings = {
    pkginfo: {
      version: '0.2.4',
    },
  };

  constructor(options?) {
    if (options) {
      this.options = extend(
        true,
        {
          port: DEFAULT_PORT,
          root: process.cwd(),
          blacklist: blacklist,
        },
        options,
      );
    }
  }

  timeStamp() {
    var date = new Date();
    return dateFormat(date, 'isoDateTime');
  }

  stop() {
    Logger.info('Shutting down...');
    this._internals.server.close();
    Logger.info('Server shutdown complete.');
  }

  start(fn) {
    fs.realpath(this.options.root, (pathError, rootPath) => {
      this.options.root = rootPath;

      Logger.info('Starting server on port ' + this.options.port);
      this._internals.server = http.createServer();

      Logger.info('Serving data from ' + this.options.root);

      this._internals.server.on('request', function () {
        this.handleRequest.apply(this, arguments);
      });

      this._internals.server.listen(this.options.port);

      Logger.info('Server started and listening...');

      if (typeof fn === 'function') {
        fn({ server: this });
      }
    });
  }

  getVersion() {
    return this._internals.pkginfo.version;
  }

  handleRequest(request, response) {
    var _this = this,
      blacklisted = false,
      missing = false,
      invalidContent = false,
      isHandled = false;
    for (var index in blacklist) {
      Logger.info('Checking blacklist entries for ' + request.url);
      const blacklist_entry = blacklist[index],
        matches = request.url.match(blacklist_entry);
      if (matches && matches.length > 0) {
        Logger.error(
          'Found blacklist entry ' + blacklist[index] + ' for ' + request.url,
        );
        blacklisted = true;
      }
    }
    var route = request.url;
    route = route.replace(/^\//g, '');
    route = route.replace(/\/$/g, '');
    if (route === '') {
      Logger.info('Directory root requested, serving _index module');
      route = '_index';
    }

    try {
      Logger.info(
        'Looking for endpoint in ' + path.join(_this.options.root, route),
      );
      require.resolve(path.join(_this.options.root, route));
    } catch (ex) {
      Logger.warn('Endpoint could not be found, attempting as directory index');
      Logger.warn(ex.message);
      try {
        require.resolve(path.join(_this.options.root, route) + '/_index');
        Logger.info('Found directory index for ' + route);
      } catch (fbex) {
        Logger.error(
          'No index found, missing resource requested: ' + request.url,
        );
        Logger.error("No module named '" + route + "' could be found.");
        Logger.error(fbex.message);
        missing = true;
      }
    }

    if (request.headers['content-type']) {
      Logger.info(
        'Received content type: ' + request.headers['content-type'],
      );
    }

    if (!blacklisted && !missing && !invalidContent) {
      Logger.info('Request being handled...');
      Logger.info(
        'Loading endpoint from ' +
          require.resolve(path.join(_this.options.root, route)),
      );
      var endpoint = new (require(path.join(_this.options.root, route)))();
      var methods = [];
      // i have no clue what i was thinking with doing it this way...
      Logger.extend(endpoint);
      for (const method in endpoint) {
        if (endpoint[method] && !Logger[method]) {
          methods.push(method.toUpperCase());
        }
      }

      if (!isHandled && endpoint[request.method.toLowerCase()]) {
        var delayTimer = 0,
          requestResponse;

        if (endpoint[request.method.toLowerCase()].delay) {
          Logger.info('Found response delay for ' + request.method);
          if (
            typeof endpoint[request.method.toLowerCase()].delay === 'number'
          ) {
            delayTimer = endpoint[request.method.toLowerCase()].delay;
            Logger.info('Response delay set to ' + delayTimer + 'ms');
          } else if (
            typeof endpoint[request.method.toLowerCase()].delay === 'function'
          ) {
            delayTimer = endpoint[request.method.toLowerCase()].delay();
            Logger.info(
              'Response delay set to function callback, actual delay this request is ' +
                delayTimer +
                'ms',
            );
          }
        }

        Logger.info('Serving ' + request.method + ' request...');

        _this._internals.delayTimer = setTimeout(function () {
          if (!endpoint[request.method.toLowerCase()].override) {
            if (endpoint[request.method.toLowerCase()].capture) {
              var capturedData = '';
              request.on('data', function (data) {
                Logger.info('Receiving ' + request.method + ' data...');
                capturedData += data;
              });
              request.on('end', function () {
                Logger.info(
                  'Finished receiving ' + request.method + ' data',
                );
                requestResponse = endpoint[request.method.toLowerCase()](
                  route,
                  request,
                  response,
                  capturedData,
                );
                Logger.info(
                  'Writing header response to ' +
                    request.method +
                    ' request...',
                );
                response.writeHeader(
                  requestResponse.status,
                  requestResponse.headers || {},
                );
                Logger.info(
                  'Writing response to ' + request.method + ' request...',
                );

                if (requestResponse.response) {
                  response.write(requestResponse.response);
                }
                response.end();
              });
            } else {
              Logger.info(
                'Writing header response to ' + request.method + ' request...',
              );
              requestResponse = endpoint[request.method.toLowerCase()](
                route,
                request,
                response,
              );
              response.writeHeader(
                requestResponse.status,
                requestResponse.headers,
              );
              Logger.info(
                'Writing response to ' + request.method + ' request...',
              );
              if (requestResponse.response) {
                response.write(requestResponse.response);
              }
              response.end();
            }
          } else {
            endpoint[request.method.toLowerCase()](route, request, response);
          }
        }, delayTimer);
        isHandled = true;
      }

      if (!isHandled) {
        response.writeHeader(405, {
          Accept: methods.join(','),
        });
        response.end();
      }
    } else if (blacklisted) {
      Logger.error(
        'Blacklisted endpoint request rejected with 404 status',
      );
      response.writeHeader(404, {
        'Content-Type': 'text/plain',
      });
      response.end();
    } else if (missing) {
      Logger.error('Missing endpoint request rejected with 404 status');
      response.writeHeader(404, {
        'Content-Type': 'text/plain',
      });
      response.end();
    } else if (invalidContent) {
      Logger.error('Invalid content request rejected with 406 status');
      response.writeHeader(406, {
        'Content-Type': 'text/plain',
      });
      response.end();
    }
  }
}

export default MammockEngine;
