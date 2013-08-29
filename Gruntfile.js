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
            bin: {
                src: [
                    "bin/mammock.js"
                ],
                dest: 'build/bin/mammock.js'
            },
            lib: {
                src: [
                    "lib/mammock.js"
                ],
                dest: 'build/lib/mammock.js'
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
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task.
    grunt.registerTask('default', ['jshint', 'nodeunit']);

};