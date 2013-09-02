#!/usr/bin/env node

'use strict';

var Mammock = require("mammock"),
    stdio = require('stdio'),
    extend = require('node.extend'),
    server,
    options = { port: 4040 },
    hasOptions = false,
    args;
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

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

server = new Mammock(hasOptions && options);
process.stdin.on('data', function(key) {
    if (key === '\u0003') {
        server.stop();
        process.exit(); 
    }
});
server.logger.info('mammock CLI interface v' + server.getVersion());
server.logger.info('Use Ctrl-C to stop the server');
server.start();