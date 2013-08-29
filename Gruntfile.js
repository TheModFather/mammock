'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            files: ['test/**/*_test.js'],
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['lib/**/*.js']
            },
            bin: {
                src: ['bin/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            },
        },
        uglify: {
            options: {
                compress: true
            },
            lib: {
                src: [
                    "lib/mammock.js"
                ],
                dest: 'build/lib/mammock.js'
            }
        },
        clean: {
            build: ["build"]
        },
        copy: {
          main: {
            files: [
              //{expand: true, src: ['bin/*.js'], dest: 'build/', filter: 'isFile'},
              //{expand: true, src: ['lib/*.js'], dest: 'build/', filter: 'isFile'},
              {expand: true, src: ['bin/*.js', 'lib/*.js', 'package.json', 'LICENSE', 'README.md'], dest: 'build/', filter: 'isFile'}
            ]
          }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'nodeunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'nodeunit']
            },
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task.
    grunt.registerTask('default', ['jshint', 'nodeunit']);
    grunt.registerTask('build', ['jshint', 'nodeunit', 'uglify', 'copy']);

};