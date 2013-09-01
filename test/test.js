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
    it ("server should instantiate", function(done){
        var Mammock = proxyquire('../src/lib/mammock.js', { 'winston': winstonMock });
        (typeof Mammock).should.equal("function");
        var server = new Mammock();
        done();
    });
    it ("server should start and stop", function (done) {
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
});
