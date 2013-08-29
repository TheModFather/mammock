#!/usr/bin/env node

'use strict';

var Mammock = require("mammock"),
    stdio = require('stdio'),
    extend = require('node.extend'),
    server,
    options = { port: 4040 },
    hasOptions = false,
    args;

args = stdio.getopt({
    'port': {key: 'p', args: 1, description: 'specify the port to listen on'},
    'root': {key: 'r', args: 1, description: 'root path to serve from'},
    'silent': {key: 's', description: 'runs the server without console output'}
});

if (args.port) {
    hasOptions = true;
    extend(options, { port: args.port });
}

if (args.root) {
    hasOptions = true;
    extend(options, { root: args.root });
}

if (args.silent) {
    hasOptions = true;
    extend(options, { silent: true });
}

server = new Mammock.Server(hasOptions && options);
server.info('mammock CLI interface v0.1.2');
server.start();