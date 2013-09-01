'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                src: ['src/lib/**/*.js']
            },
            bin: {
                src: ['src/*.js']
            },
            test: {
                src: ['test/**/*.js']
            },
        },
        uglify: {
            options: {
                compress: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            lib: {
                src: [
                    "src/lib/mammock.js"
                ],
                dest: 'build/lib/mammock.js'
            }
        },
        clean: {
            build: ["build"],
            extras: ["**/*~"]
        },
        copy: {
          main: {
            files: [
              {expand: true, cwd: "src/", src: ['*.js'], dest: 'build/', filter: 'isFile'},
              {expand: true, src: ['package.json', 'LICENSE', 'README.md'], dest: 'build/', filter: 'isFile'}
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

    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['jshint', 'nodeunit']);
    grunt.registerTask('build', ['jshint', 'nodeunit', 'uglify', 'copy']);
};