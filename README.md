# mammock [![Build Status](https://secure.travis-ci.org/earmbrust/mammock.png?branch=master)](http://travis-ci.org/earmbrust/mammock)

Mammock is a node.js service mocking framework designed to be quick and easy, allowing developers to fill the "missing gaps" in services during development.

## Getting Started
Install the module with: `npm install mammock`
The command line script and library can also be installed globally, with: `npm install -g mammock`
_Note: To install globally, it may be necessary to become a superuser on your OS with a command such as `sudo`_

## Documentation
### Basic Usage
    USAGE: node mammock [--port <ARG1>] [--root <ARG1>] [--silent] 
      -p, --port <ARG1>     specify the port to listen on
      -r, --root <ARG1>     root path to serve from
      -s, --silent          runs the server without console output

### Adanced Usage
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
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
