'use strict';

var proxyquire =  require('proxyquire');
/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/


var winstonMock = {
  Logger: function () {
    return {
      info: function () { },
      warn: function () { },
      error: function () { },
      extend: function (object) {
        object.info = this.info;
        object.warn = this.warn;
        object.error = this.error;
      }
    };
  }
};

var httpRequest = {
  url: "/",
  headers: {
    "content-type": "application/json"
  }
};

var httpResponse = {
  writeHeader: function () { },
  end: function () { }
};

var httpMock = {
  createServer: function () {
    return {
      on: this.on,
      listen: function () { }
    };  
  },
  on: function (event, fn) { fn(httpRequest, httpResponse); },
  sendRequest: function (fn) {
    this.on("request", fn); 
  }
};

exports['Server'] = {
  setUp: function(done) {
    done();
  },
  'no args': function(test) {
    test.expect(4);
    var Mammock =  proxyquire('../src/lib/mammock.js', { 'winston': winstonMock, 'http': httpMock });
    var server = new Mammock();
    test.equal(typeof server, 'object', 'should be an object type.');
    test.ok(server instanceof Mammock);

    server.start();
    test.ok(server.options && typeof server.options !== 'undefined', 'should instantiate with options');

    httpMock.sendRequest(function () {
      test.ok(server, "server responds to requests");
    });
    setTimeout(function () {
      test.done();
    }, 1000); 
  },
};
