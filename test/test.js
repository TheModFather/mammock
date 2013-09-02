/*jshint -W098*/
/*global describe: true, it: true */
'use strict';

var proxyquire =  require('proxyquire'),
    should = require('should');


var winstonMock = {
  Logger: function () {
    return {
      info: function () { this.logged = true; },
      warn: function () { this.logged = true; },
      error: function () { this.logged = true; },
      extend: function (object) {
        object.info = this.info;
        object.warn = this.warn;
        object.error = this.error;
      }
    };
  }
};

describe('Server', function(){
    it ("should instantiate", function(done){
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        (typeof Mammock).should.equal("function");
        var server = new Mammock();
        server.should.be.an.instanceof(Mammock);
        done();
    });
    it ("should start and stop", function (done) {
        this.timeout(700);
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        (typeof Mammock).should.equal("function");
        var server = new Mammock();
        server.start();
        setTimeout(function () {
            server.should.be.an.instanceof(Mammock);
            server.stop();
            done();
        }, 500);
    });

    it ("should return version", function (done) {
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        var server = new Mammock();
          
        should.exist(server._internals.pkginfo);
        should.exist(server.getVersion());

        done();
    });

    it ("should timestamp", function (done) {
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        var server = new Mammock();
        var timecheck = new RegExp('((?:2|1)\\d{3}(?:-|\\/)(?:(?:0[1-9])|(?:1[0-2]))(?:-|\\/)(?:(?:0[1-9])|(?:[1-2][0-9])|(?:3[0-1]))(?:T|\\s)(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9]))', "gi");
        server.timeStamp().match(timecheck).length.should.equal(1);
        done();
    });
    it ("should capture options", function (done) {
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        var server = new Mammock({port: 5050, root: "test"});
        server.options.port.should.equal(5050);
        server.options.root.should.equal("test");
        done();
    });
    it ("should call start() callback", function (done) {
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        var server = new Mammock();
        server.start(function () {
          should.exist(server);
          server.stop();
          done();
        });
    });

    it ("should process requests", function (done) {
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        var server = new Mammock();
        server.handleRequest = function (request, response) {
            should.exist(request);
            should.exist(response);
            server.stop();
            done();
        };
        
        server.start(function () {
            server._internals.server.emit('request', {}, {});    
        });
    });

});
