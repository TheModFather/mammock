'use strict';

import { program } from 'commander';

const Mammock = require('mammock');
// const stdio = require('stdio');
// const extend = require('node.extend');
let server;
//const options = { port: 4040 };
const hasOptions = false;
// const args;

program
  .name('string-util')
  .description('CLI to some JavaScript string utilities')
  .version(server.getVersion());

program
  .option('-p, --port <port>', 'Specify the port to listen on')
  .option('-r, --root <dir>', 'root path to serve from')
  .option('-s, --silent', 'runs the server without console output')
  .option('-v, --version', 'Display application version');
// process.stdin.setRawMode(true);
// process.stdin.resume();
// process.stdin.setEncoding('utf8');

// args = stdio.getopt({
//     'port': {key: 'p', args: 1, description: 'specify the port to listen on'},
//     'root': {key: 'r', args: 1, description: 'root path to serve from'},
//     'silent': {key: 's', description: 'runs the server without console output'},
//     'version': {key: 'v', description: 'returns the server version'}
// });

// if (args.port) {
//     hasOptions = true;
//     extend(options, { port: args.port });
// }

//     if (args.root) {
//     hasOptions = true;
//     extend(options, { root: args.root });
// }

// if (args.silent) {
//     hasOptions = true;
//     extend(options, { silent: true });
// }

program.parse(process.argv);
const options = program.opts();

server = new Mammock(hasOptions && options);
process.stdin.on('data', function (key) {
  if (key.toString() === '\u0003') {
    server.stop();
    process.exit();
  }
});
// if (args.version) {
//     console.log('mammock v' + server.getVersion() + " (c) 2013-2024 Elden Armbrust");
//     console.log('Released under the MIT License <http://opensource.org/licenses/MIT>');
//     process.exit();
// }
server.logger.info('mammock CLI interface v' + server.getVersion());
server.logger.info('Use Ctrl-C to stop the server');
server.start();
