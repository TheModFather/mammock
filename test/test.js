/*jshint -W098*/
/*global describe: true, it: true */
'use strict';

var proxyquire =  require('proxyquire'),
    should = require('should');


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



describe('Server', function(){
    it ("should instantiate", function(done){
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        (typeof Mammock).should.equal("function");
        var server = new Mammock();
        done();
    });
    // it ("should start and stop", function (done) {
    //     this.timeout(500);
    //     var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
    //     (typeof Mammock).should.equal("function");
    //     var server = new Mammock();
    //     server.start();
    //     setTimeout(function () {
    //         server.should.be.an.instanceof(Mammock);

    //         server.stop();
    //         done();
    //     }, 700);
    // });
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
          server.stop();
          should.exist(server);
          done();
        });
        //done();
    });
});
