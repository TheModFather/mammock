# mammock [![Build Status](https://secure.travis-ci.org/earmbrust/mammock.png?branch=master)](http://travis-ci.org/earmbrust/mammock) [![Dependency Status](https://gemnasium.com/earmbrust/mammock.png)](https://gemnasium.com/earmbrust/mammock)

Mammock is a node.js service mocking framework designed to be quick and easy, allowing developers to fill the "missing gaps" in services during development.

## Getting Started
Install the module with: `npm install mammock`

The command line script and library can also be installed globally, with: `npm install -g mammock`

_Note: To install globally, it may be necessary to become a superuser on your OS with a command such as `sudo`._

## Documentation
### Basic Usage
```
USAGE: node mammock [--port <ARG1>] [--root <ARG1>] [--silent] 
  -p, --port <ARG1>     specify the port to listen on
  -r, --root <ARG1>     root path to serve from
  -s, --silent          runs the server without console output
```

### Adanced Usage
Here is an example node, or endpoint, in Mammock:
```javascript
module.exports  = function () {
    //We create a variable to return, 'node', so that we can set properties to the functions
    var node = {
        get: function (route, request, response) {
            return {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                response: JSON.stringify({})
            }
        },
        post: function (route, request, response, data) {
            var endpoint = this,
                postData = "";

            endpoint.info("Now overriding the POST response...")

            request.on('data', function (data) {
                endpoint.info("Receiving POST data...");
                postData += data;
            });
            request.on('end', function () {
                endpoint.info("Finished receiving POST data");
                
                endpoint.info("Writing header response to POST request...");
                response.writeHeader(200, {
                    "Content-Type": "application/json"
                });
                endpoint.info("Writing response to POST request...");
                response.write(postData);
                response.end();

            });
        },
        put: function (route, request, response, data) {
            return {
                status: 200,
                contentType: "application/json",
                response: data
            }
        },
        delete: function (route, request, response) {
            return {
                status: 200,
                contentType: "application/json"
            }
        }
    }

    //overriding the node allows us to handle the request manually
    node.post.override = true;
    //setting capture on the method will allow you to have the method invoked
    //after the server has already captured the data, and pass it in as the 
    //optional fourth parameter
    node.put.capture = true;
    return node;
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
### 0.2.2
* Switched to mocha for testing, as it provides more reporters
* Improved testing a bit
* Switched npm test script from `npm nodeunit` to `npm test`
* One step closer to coveralls reporting...
* Fix for slightly outdated grunt-watch-contrib dependency (thank you gemnasium)

### 0.2.1
* Minor fix for tests
* Improved test mocks somewhat, but they still need some attention
* Moved source files to live in src/, to clean up project root

### 0.2.0
* Major rewrite of the routing engine to better suit a multitude of custom requesti methods
* Removed Mammock.Endpoint and Mammock.Server, moving main constructor to the initial mammock instance
* endpoints now get extended with logging abilities

### 0.1.6
* Fixed documentation error stating the version was 0.2.5
* Fixed major GET bug

### 0.1.5
* Fixed build further
* Actually ready for release

### 0.1.4
* Cleaned up build
* First npm publish

### 0.1.3
* Fixed major endpoint bug, which resulted in endpoints being inaccessible
* Fixed index routing bug

### 0.1.2
* Added timestamps to logs
* Added -s/--silent option to allow running the server sans output
* Renamed bin/mammock to bin/mammock.js because no extension is stupid.
* endpoints should now be reachable

### 0.1.1
* First functional server running as intended.
* Options added to command line

### 0.1.0
* Added initial structure and got .travis.yml not being bejankity.

## License
Copyright (c) 2013 Elden Armbrust  
Licensed under the MIT license.
